import { supabase } from "./supabaseClient.js";
import { ensureProfile, signOut } from "./auth.js";

let currentUser = null;
let currentProfile = null;
let loading = true;
const listeners = new Set();

export function getAuthState() {
  return { user: currentUser, profile: currentProfile, loading };
}

export function subscribeAuth(fn) {
  listeners.add(fn);
  fn(getAuthState());
  return () => listeners.delete(fn);
}

function notify() {
  for (const fn of listeners) fn(getAuthState());
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function loginAsGuest() {
  const guestEmail = `guest_${Date.now()}@guest.local`;
  const guestPassword = `guest_${Date.now()}_Aether!`;
  const { data, error } = await supabase.auth.signUp({
    email: guestEmail,
    password: guestPassword,
  });
  if (error) throw error;
  return data;
}

export async function signInWithProvider(provider) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin },
  });
  if (error) throw error;
  return data;
}

export async function logout() {
  await signOut();
  currentUser = null;
  currentProfile = null;
  notify();
}

export async function initAuth() {
  const { data } = await supabase.auth.getSession();
  if (data.session?.user) {
    currentUser = data.session.user;
    try {
      currentProfile = await ensureProfile(currentUser);
    } catch (e) {
      console.error("Profile init error:", e);
    }
  }
  loading = false;
  notify();

  supabase.auth.onAuthStateChange((event, session) => {
    (async () => {
      if (event === "SIGNED_OUT") {
        currentUser = null;
        currentProfile = null;
        loading = false;
        notify();
        return;
      }
      if (session?.user) {
        currentUser = session.user;
        try {
          currentProfile = await ensureProfile(currentUser);
        } catch (e) {
          console.error("Profile error:", e);
        }
        notify();
      }
    })();
  });
}
