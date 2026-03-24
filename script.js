// ===== TAB SWITCHING =====
function showTab(tabId, event) {
  let tabs = document.getElementsByClassName("tab");
  let buttons = document.querySelectorAll(".sidebar button");

  for (let tab of tabs) tab.style.display = "none";
  buttons.forEach(btn => btn.classList.remove("active"));

  const activeTab = document.getElementById(tabId);
  if (activeTab) activeTab.style.display = "grid";

  if (event?.target) event.target.classList.add("active");
}

// ===== LOGIN =====
function login() {
  const key = document.getElementById("apiKey").value;

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

// ===== LOAD USER DATA =====
function loadUser(data) {
  // hide login, show dashboard
  document.getElementById("loginCard").style.display = "none";
  document.getElementById("dashboard").style.display = "grid";

  // TOP BAR
  document.getElementById("username").innerText = data.name;

  // PLAYER CARD
  document.getElementById("playerCard").innerHTML =
    `👤 <b>${data.name}</b><br>Level ${data.level}`;

  // MONEY CARD
  if (document.getElementById("moneyCard")) {
    document.getElementById("moneyCard").innerHTML =
      `💰 $${(data.money || 0).toLocaleString()}`;
  }

  // ENERGY
  if (data.energy) {
    let percent = (data.energy.current / data.energy.maximum) * 100;
    document.getElementById("energyCard").innerHTML =
      `⚡ Energy: ${data.energy.current}/${data.energy.maximum}
       <div style="background:#1e293b; border-radius:6px; margin-top:5px;">
         <div style="width:${percent}%; background:#22c55e; height:8px; border-radius:6px;"></div>
       </div>`;
  } else {
    document.getElementById("energyCard").innerHTML = "⚡ Energy: Not available";
  }

  // NERVE
  if (data.nerve) {
    let percent = (data.nerve.current / data.nerve.maximum) * 100;
    document.getElementById("nerveCard").innerHTML =
      `🧠 Nerve: ${data.nerve.current}/${data.nerve.maximum}
       <div style="background:#1e293b; border-radius:6px; margin-top:5px;">
         <div style="width:${percent}%; background:#9333ea; height:8px; border-radius:6px;"></div>
       </div>`;
  } else {
    document.getElementById("nerveCard").innerHTML = "🧠 Nerve: Not available";
  }

  // COOLDOWNS
  if (data.cooldowns) {
    document.getElementById("cooldownCard").innerHTML =
      `💊 Drug Cooldown: ${data.cooldowns.drug || 0}s`;
  }

  // NETWORTH
  if (data.networth) {
    document.getElementById("networthCard").innerHTML =
      `📈 Networth: $${(data.networth.total || 0).toLocaleString()}`;
  }

  // PROFILE
  document.getElementById("profileInfo").innerHTML =
    `Name: ${data.name}<br>Level: ${data.level}`;

  // ===== PREMIUM CHECK =====
  checkPremium(data.player_id).then(isPremium => {

    localStorage.setItem("tornPremium", isPremium);

    const premiumTab = document.querySelector("#premium .card");

    if (premiumTab) {
      premiumTab.innerHTML = isPremium
        ? "💊 Premium Features Unlocked 😈"
        : "🔒 Premium Feature Locked";
    }

    // add premium info to profile
    const profileInfo = document.getElementById("profileInfo");
    if (profileInfo) {
      profileInfo.innerHTML += `<br>Premium: ${isPremium ? "Yes 💊" : "No"}`;
    }
  });
}

// ===== PREMIUM SYSTEM =====
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

// ===== AUTO LOGIN =====
window.onload = function () {
  const savedKey = localStorage.getItem("tornApiKey");

  if (savedKey) {
    fetch(`https://api.torn.com/user/?selections=basic,money,bars,cooldowns,networth&key=${savedKey}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          loadUser(data);
          checkPremium(data.player_id).then(isPremium => {
            localStorage.setItem("tornPremium", isPremium);
          });
        }
      });
  }
};

// ===== LOGOUT =====
function logout() {
  localStorage.removeItem("tornApiKey");
  localStorage.removeItem("tornPremium");
  location.reload();
}

// ===== EVENT LISTENERS FOR TABS =====
document.addEventListener("DOMContentLoaded", () => {
  // login/logout buttons
  document.getElementById("loginBtn")?.addEventListener("click", login);
  document.getElementById("logoutBtn")?.addEventListener("click", logout);

  // tab buttons
  document.getElementById("tab-dashboard")?.addEventListener("click", (e) => showTab("dashboard", e));
  document.getElementById("tab-tools")?.addEventListener("click", (e) => showTab("tools", e));
  document.getElementById("tab-premium")?.addEventListener("click", (e) => showTab("premium", e));
  document.getElementById("tab-profile")?.addEventListener("click", (e) => showTab("profile", e));
});
