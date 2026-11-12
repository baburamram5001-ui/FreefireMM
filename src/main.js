import "./styles.css";
import { initAuth, subscribeAuth, logout } from "./authStore.js";
import { createLoginScreen, removeLoginScreen } from "./loginScreen.js";
import { initLobby } from "./lobbyScene.js";
import { createLobbyUI } from "./lobbyUI.js";

let loginEl = null;
let lobbyContainer = null;
let lobbyUIEl = null;
let lobbyCleanup = null;

const loading = document.createElement("div");
loading.className = "loading";
loading.innerHTML = `
  <div class="loading-art"></div>
  <div class="loading-shade"></div>
  <div class="loading-brand">AETHER<span>FIRE</span></div>
  <div class="loading-status">LOADING...</div>
  <div class="loading-track"><div class="loading-progress"></div></div>
`;
document.body.appendChild(loading);

window.addEventListener("game:interaction", () => {
  prepareGameViewport();
}, { passive: true });

async function start() {
  const progress = loading.querySelector(".loading-progress");
  const progressPromise = new Promise((resolve) => {
    let value = 0;
    const timer = window.setInterval(() => {
      value = Math.min(value + Math.ceil(Math.random() * 8), 100);
      progress.style.width = `${value}%`;
      if (value === 100) {
        window.clearInterval(timer);
        resolve();
      }
    }, 48);
  });

  await Promise.all([initAuth(), progressPromise]);
  prepareGameViewport();
  loading.classList.add("hidden");
  setTimeout(() => loading.remove(), 600);

  subscribeAuth(({ user, profile, loading: authLoading }) => {
    if (authLoading) return;

    if (user && profile) {
      if (!lobbyContainer) {
        enterLobby(profile);
      }
      if (loginEl) {
        removeLoginScreen(loginEl);
        loginEl = null;
      }
    } else {
      if (lobbyContainer) {
        exitLobby();
      }
      if (!loginEl) {
        loginEl = createLoginScreen();
      }
    }
  });
}

function enterLobby(profile) {
  lobbyContainer = document.createElement("div");
  lobbyContainer.className = "lobby-container";
  document.body.appendChild(lobbyContainer);

  lobbyCleanup = initLobby(lobbyContainer);

  lobbyUIEl = createLobbyUI(profile, () => {
    logout();
  });

  prepareGameViewport();
}

function prepareGameViewport() {
  requestFullscreen().then(lockLandscape).catch(() => {});
}

async function lockLandscape() {
  try {
    if (screen.orientation?.lock) {
      await screen.orientation.lock("landscape");
    }
  } catch {
    // Browsers only allow orientation locking in supported fullscreen contexts.
  }
}

function exitLobby() {
  if (lobbyCleanup) {
    lobbyCleanup();
    lobbyCleanup = null;
  }
  if (lobbyContainer) {
    lobbyContainer.remove();
    lobbyContainer = null;
  }
  if (lobbyUIEl) {
    lobbyUIEl.remove();
    lobbyUIEl = null;
  }
  exitFullscreen();
}

async function requestFullscreen() {
  try {
    if (document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      await document.documentElement.webkitRequestFullscreen();
    }
  } catch {
    // Fullscreen may be blocked by browser — non-critical
  }
}

async function exitFullscreen() {
  try {
    if (document.exitFullscreen && document.fullscreenElement) {
      await document.exitFullscreen();
    } else if (document.webkitExitFullscreen && document.webkitFullscreenElement) {
      await document.webkitExitFullscreen();
    }
  } catch {
    // Non-critical
  }
}

start();
