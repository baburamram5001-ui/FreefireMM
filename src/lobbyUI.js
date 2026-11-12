export function createLobbyUI(profile, onLogout) {
  const el = document.createElement("div");
  el.className = "lobby-ui";

  el.innerHTML = `
    <div class="lobby-topbar">
      <div class="topbar-left">
        <div class="game-logo">◆ Aether Realms</div>
      </div>
      <div class="topbar-center">
        <button class="menu-btn" data-menu="store">
          <span class="menu-icon">◈</span>
          <span class="menu-label">Store</span>
        </button>
        <button class="menu-btn" data-menu="events">
          <span class="menu-icon">✦</span>
          <span class="menu-label">Events</span>
        </button>
        <button class="menu-btn" data-menu="modes">
          <span class="menu-icon">⚔</span>
          <span class="menu-label">Play</span>
        </button>
      </div>
      <div class="topbar-right">
        <div class="profile-card" id="profile-card">
          <div class="profile-avatar">
            <span class="profile-level">${profile.level}</span>
          </div>
          <div class="profile-info">
            <div class="profile-name">${escapeHtml(profile.username)}</div>
            <div class="profile-uid">UID: ${profile.uid}</div>
          </div>
          <div class="profile-chevron">›</div>
        </div>
      </div>
    </div>

    <div class="lobby-scene-controls">
      <div class="lobby-build">1.134.20</div>
      <button class="recovery-chip">◉ ACCOUNT RECOVERY</button>
      <div class="lobby-side-actions">
        <button class="side-action" aria-label="Notifications">♧</button>
        <button class="side-action" aria-label="Music">♪</button>
        <button class="side-action" aria-label="More">•••</button>
      </div>
      <button class="sound-action" aria-label="Mute">◒</button>
      <button class="scene-logout" id="scene-logout">▣ LOG OUT</button>
    </div>

    <div class="lobby-overlay" id="overlay-store">
      <div class="overlay-panel">
        <div class="overlay-header">
          <h2>Store</h2>
          <button class="overlay-close" data-close>✕</button>
        </div>
        <div class="overlay-body">
          <div class="store-grid">
            ${storeItems.map(item => `
              <div class="store-item">
                <div class="store-item-icon" style="color:${item.color}">${item.icon}</div>
                <div class="store-item-name">${item.name}</div>
                <div class="store-item-desc">${item.desc}</div>
                <button class="store-buy">${item.price} ◆</button>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    </div>

    <div class="lobby-overlay" id="overlay-events">
      <div class="overlay-panel">
        <div class="overlay-header">
          <h2>Events</h2>
          <button class="overlay-close" data-close>✕</button>
        </div>
        <div class="overlay-body">
          <div class="events-list">
            ${eventItems.map(ev => `
              <div class="event-card">
                <div class="event-banner" style="background: linear-gradient(135deg, ${ev.color1}, ${ev.color2})">
                  <span class="event-tag">${ev.tag}</span>
                </div>
                <div class="event-content">
                  <h3>${ev.title}</h3>
                  <p>${ev.desc}</p>
                  <div class="event-timer">${ev.timer}</div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    </div>

    <div class="lobby-overlay" id="overlay-modes">
      <div class="overlay-panel overlay-sm">
        <div class="overlay-header">
          <h2>Select Mode</h2>
          <button class="overlay-close" data-close>✕</button>
        </div>
        <div class="overlay-body">
          <div class="modes-list">
            ${gameModes.map(m => `
              <button class="mode-card">
                <span class="mode-icon">${m.icon}</span>
                <div class="mode-info">
                  <div class="mode-name">${m.name}</div>
                  <div class="mode-desc">${m.desc}</div>
                </div>
              </button>
            `).join("")}
          </div>
        </div>
      </div>
    </div>

    <div class="lobby-overlay" id="overlay-profile">
      <div class="overlay-panel overlay-sm">
        <div class="overlay-header">
          <h2>Player Profile</h2>
          <button class="overlay-close" data-close>✕</button>
        </div>
        <div class="overlay-body">
          <div class="profile-detail">
            <div class="profile-detail-avatar">
              <span class="profile-level-big">${profile.level}</span>
            </div>
            <div class="profile-detail-info">
              <div class="profile-detail-name">${escapeHtml(profile.username)}</div>
              <div class="profile-detail-uid">UID: ${profile.uid}</div>
              <div class="profile-detail-level">Level ${profile.level} Player</div>
              <div class="xp-bar">
                <div class="xp-fill" style="width: ${(profile.level % 10) * 10}%"></div>
              </div>
              <div class="xp-text">${(profile.level % 10) * 10}% to Level ${profile.level + 1}</div>
            </div>
          </div>
          <button class="btn-logout" id="btn-logout">Sign Out</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(el);
  wireEvents(el, onLogout);
  return el;
}

function wireEvents(el, onLogout) {
  const menuButtons = el.querySelectorAll(".menu-btn");
  const overlays = el.querySelectorAll(".lobby-overlay");
  const closeButtons = el.querySelectorAll(".overlay-close");
  const profileCard = el.querySelector("#profile-card");
  const logoutBtn = el.querySelector("#btn-logout");

  function openOverlay(id) {
    const ov = el.querySelector(`#overlay-${id}`);
    if (ov) {
      ov.classList.add("active");
    }
  }

  function closeAllOverlays() {
    overlays.forEach(o => o.classList.remove("active"));
  }

  menuButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const menu = btn.dataset.menu;
      const target = el.querySelector(`#overlay-${menu}`);
      const isOpen = target.classList.contains("active");
      closeAllOverlays();
      if (!isOpen) openOverlay(menu);
    });
  });

  closeButtons.forEach(btn => {
    btn.addEventListener("click", closeAllOverlays);
  });

  overlays.forEach(ov => {
    ov.addEventListener("click", (e) => {
      if (e.target === ov) closeAllOverlays();
    });
  });

  profileCard.addEventListener("click", () => {
    closeAllOverlays();
    openOverlay("profile");
  });

  logoutBtn?.addEventListener("click", () => {
    closeAllOverlays();
    onLogout();
  });

  el.querySelector("#scene-logout")?.addEventListener("click", onLogout);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllOverlays();
  });
}

function escapeHtml(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

const storeItems = [
  { name: "Crystal Blade", desc: "Legendary weapon skin", price: 1200, icon: "⚔", color: "#c9a84c" },
  { name: "Frost Armor", desc: "Epic armor set", price: 850, icon: "🛡", color: "#4a9eff" },
  { name: "Shadow Cloak", desc: "Rare accessory", price: 450, icon: "✦", color: "#9a4aff" },
  { name: "Phoenix Mount", desc: "Legendary mount", price: 2000, icon: "◆", color: "#ff6a4a" },
  { name: "Starlight Bow", desc: "Epic weapon skin", price: 750, icon: "➹", color: "#aaffcc" },
  { name: "Ember Potion x10", desc: "Consumable bundle", price: 200, icon: "◉", color: "#ff8844" },
];

const eventItems = [
  { title: "Dragon Hunt", desc: "Defeat dragons for exclusive rewards", tag: "LIMITED", timer: "Ends in 2d 14h", color1: "#8b1a1a", color2: "#ff6a4a" },
  { title: "Frost Festival", desc: "Winter themed challenges and cosmetics", tag: "SEASONAL", timer: "Ends in 5d 3h", color1: "#1a4d7a", color2: "#4a9eff" },
  { title: "Double XP Weekend", desc: "Earn double experience all weekend", tag: "WEEKEND", timer: "Ends in 1d 6h", color1: "#2a6a3a", color2: "#aaffcc" },
  { title: "Arena Tournament", desc: "Compete for the champion title", tag: "LIVE", timer: "Ends in 6h 22m", color1: "#4a2a6a", color2: "#9a4aff" },
];

const gameModes = [
  { name: "Ranked Battle", desc: "Climb the competitive ladder", icon: "⚔" },
  { name: "Co-op Dungeon", desc: "Team up with friends", icon: "◆" },
  { name: "Survival Arena", desc: "Last one standing", icon: "✦" },
  { name: "Free Roam", desc: "Explore the open world", icon: "◎" },
];
