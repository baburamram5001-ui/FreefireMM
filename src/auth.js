import { supabase, generateUID } from "./supabaseClient.js";

const adjectives = ["Swift", "Brave", "Crimson", "Shadow", "Frost", "Storm", "Golden", "Mystic", "Iron", "Azure"];
const nouns = ["Hunter", "Blade", "Wolf", "Phoenix", "Raven", "Knight", "Sage", "Drake", "Viper", "Sentinel"];

function randomUsername() {
  const a = adjectives[Math.floor(Math.random() * adjectives.length)];
  const n = nouns[Math.floor(Math.random() * nouns.length)];
  return `${a}${n}${Math.floor(Math.random() * 100)}`;
}

export async function ensureProfile(user) {
  const { data: existing, error } = await supabase
    .from("profiles")
    .select("id, username, level, uid")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw error;
  if (existing) return existing;

  const profile = {
    id: user.id,
    username: randomUsername(),
    level: Math.floor(1 + Math.random() * 49),
    uid: generateUID(),
  };

  const { data, error: insertError } = await supabase
    .from("profiles")
    .insert(profile)
    .select("id, username, level, uid")
    .maybeSingle();

  if (insertError) throw insertError;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}
