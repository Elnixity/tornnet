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
    .then(async data => {
      if (data.error) {
        document.getElementById("loginStatus").innerText = "❌ Invalid API Key";
        return;
      }

      localStorage.setItem("tornApiKey", key);
      const premium = await checkPremium(data.player_id);
      loadUser(data, premium);
    })
    .catch(() => {
      document.getElementById("loginStatus").innerText = "Error connecting to API";
    });
}

// CHECK PREMIUM
async function checkPremium(userId) {
  try {
    const res = await fetch("https://raw.githubusercontent.com/YOURUSERNAME/tornnet/main/premium-users.json");
    const data = await res.json();
    return data.users.some(u => u.id === userId);
  } catch (err) {
    console.error("Premium check failed:", err);
    return false;
  }
}

// LOAD USER DATA
async function loadUser(data, isPremium) {
  const loginCard = document.getElementById("loginCard");
  if (loginCard) loginCard.style.display = "none";

  const dashboard = document.getElementById("dashboard");
  if (dashboard) dashboard.style.display = "grid";

  document.getElementById("username")?.innerText = data.name || "Unknown";

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

  // Smart Advisor (Premium Locked)
  const advisorCard = document.getElementById("advisorCard");
  if (advisorCard) {
    if (!isPremium) {
      advisorCard.innerHTML = "🔒 Premium Feature";
    } else {
      if (data.energy && data.nerve) {
        if (data.energy.current > 100) {
          advisorCard.innerHTML = "⚡ Train or do crimes now!";
        } else if (data.cooldowns?.drug > 0) {
          advisorCard.innerHTML = "💊 You're on drug cooldown, wait!";
        } else {
          advisorCard.innerHTML = "📊 Save energy for bigger gains.";
        }
      } else {
        advisorCard.innerHTML = "📊 Premium Advisor Loading...";
      }
    }
  }

  // Profile Info
  const profileInfo = document.getElementById("profileInfo");
  if (profileInfo)
    profileInfo.innerHTML = `Name: ${data.name || "Unknown"}<br>Level: ${data.level || "?"}`;
}

// AUTO LOGIN
window.onload = async function () {
  const savedKey = localStorage.getItem("tornApiKey");

  if (savedKey) {
    fetch(`https://api.torn.com/user/?selections=basic,money,bars,cooldowns,networth&key=${savedKey}`)
      .then(res => res.json())
      .then(async data => {
        if (!data.error) {
          const premium = await checkPremium(data.player_id);
          loadUser(data, premium);
        }
      });
  }
};

// LOGOUT
function logout() {
  localStorage.removeItem("tornApiKey");
  location.reload();
}
