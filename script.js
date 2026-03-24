// TAB SWITCHING
function showTab(tabId, event) {
  let tabs = document.getElementsByClassName("tab");
  let buttons = document.querySelectorAll(".sidebar button");

  for (let tab of tabs) tab.style.display = "none";
  buttons.forEach(btn => btn.classList.remove("active"));

  const activeTab = document.getElementById(tabId);
  if (activeTab) activeTab.style.display = "grid";

  if (event?.target) event.target.classList.add("active");
}

// LOGIN
function login() {
  const key = document.getElementById("apiKey")?.value;

  if (!key) {
    document.getElementById("loginStatus").innerText = "Enter API key";
    return;
  }

  document.getElementById("loginStatus").innerText = "Loading...";

  fetch(`https://api.torn.com/user/?selections=basic,money,bars,cooldowns,networth&key=${key}`)
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        document.getElementById("loginStatus").innerText = "❌ Invalid API Key";
        return;
      }

      localStorage.setItem("tornApiKey", key);
      loadUser(data);
    })
    .catch(() => {
      document.getElementById("loginStatus").innerText = "Error connecting to API";
    });
}

// LOAD USER DATA
async function loadUser(data) {
  // Hide login card
  const loginCard = document.getElementById("loginCard");
  if (loginCard) loginCard.style.display = "none";

  // Show dashboard
  const dashboard = document.getElementById("dashboard");
  if (dashboard) dashboard.style.display = "grid";

  // Username
  const usernameEl = document.getElementById("username");
  if (usernameEl) usernameEl.innerText = data.name || "Unknown";

  // PLAYER CARD
  const playerCard = document.getElementById("playerCard");
  if (playerCard)
    playerCard.innerHTML = `👤 <b>${data.name || "Unknown"}</b><br>Level ${data.level || "?"}`;

  // MONEY
  const moneyCard = document.getElementById("moneyCard");
  if (moneyCard)
    moneyCard.innerHTML = `💰 $${(data.money || 0).toLocaleString()}`;

  // ENERGY
  const energyCard = document.getElementById("energyCard");
  if (energyCard) {
    if (data.energy) {
      const percent = (data.energy.current / data.energy.maximum) * 100;
      energyCard.innerHTML = `
        ⚡ Energy: ${data.energy.current}/${data.energy.maximum}
        <div style="background:#1e293b; border-radius:6px; margin-top:5px;">
          <div style="width:${percent}%; background:#22c55e; height:8px; border-radius:6px;"></div>
        </div>`;
    } else {
      energyCard.innerHTML = "⚡ Energy: Not available";
    }
  }

  // NERVE
  const nerveCard = document.getElementById("nerveCard");
  if (nerveCard) {
    if (data.nerve) {
      const percent = (data.nerve.current / data.nerve.maximum) * 100;
      nerveCard.innerHTML = `
        🧠 Nerve: ${data.nerve.current}/${data.nerve.maximum}
        <div style="background:#1e293b; border-radius:6px; margin-top:5px;">
          <div style="width:${percent}%; background:#9333ea; height:8px; border-radius:6px;"></div>
        </div>`;
    } else {
      nerveCard.innerHTML = "🧠 Nerve: Not available";
    }
  }

  // COOLDOWNS
  const cooldownCard = document.getElementById("cooldownCard");
  if (cooldownCard)
    cooldownCard.innerHTML = `💊 Drug Cooldown: ${data.cooldowns?.drug || 0}s`;

  // NETWORTH
  const networthCard = document.getElementById("networthCard");
  if (networthCard)
    networthCard.innerHTML = `📈 Networth: $${(data.networth?.total || 0).toLocaleString()}`;

  // Smart Advisor (placeholder)
  const advisorCard = document.getElementById("advisorCard");
  if (advisorCard) {
    if (data.energy && data.nerve) {
      if (data.energy.current > 100) {
        advisorCard.innerHTML = "⚡ You should train or do crimes now.";
      } else if (data.cooldowns?.drug > 0) {
        advisorCard.innerHTML = "💊 You're on cooldown, chill for now.";
      } else {
        advisorCard.innerHTML = "📊 Save energy for better gains.";
      }
    } else {
      advisorCard.innerHTML = "🔒 Premium Feature";
    }
  }

  // Profile Info
  const profileInfo = document.getElementById("profileInfo");
  if (profileInfo)
    profileInfo.innerHTML = `Name: ${data.name || "Unknown"}<br>Level: ${data.level || "?"}`;
}

// AUTO LOGIN
window.onload = function () {
  const savedKey = localStorage.getItem("tornApiKey");

  if (savedKey) {
    fetch(`https://api.torn.com/user/?selections=basic,money,bars,cooldowns,networth&key=${savedKey}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          loadUser(data);
        }
      });
  }
};

// LOGOUT
function logout() {
  localStorage.removeItem("tornApiKey");
  location.reload();
}
