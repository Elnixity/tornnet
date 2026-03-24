
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
  const key = document.getElementById("apiKey")?.value;

  if (!key) {
    document.getElementById("loginStatus").innerText = "Enter API key";
    return;
  }

  document.getElementById("loginStatus").innerText = "Loading...";

  fetch(`https://api.torn.com/user/?selections=basic,money,bars,stats,cooldowns,networth&key=${key}`)
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

// ===== PREMIUM CHECK =====
async function checkPremium(userId) {
  try {
    const res = await fetch("https://raw.githubusercontent.com/YOURUSERNAME/tornnet/main/premium-users.json");
    const data = await res.json();
    return data.users.some(u => u.id === userId);
  } catch {
    return false;
  }
}

// ===== ADVISOR =====
function getAdvisorText(data, isPremium) {
  if (!isPremium) return "🔒 Premium Feature";

  if (data.energy?.current > 100) {
    return "⚡ Train or do crimes now!";
  } else if (data.cooldowns?.drug > 0) {
    return "💊 You're on cooldown, wait.";
  } else {
    return "📊 Save energy for better gains.";
  }
}

// ===== LOAD USER =====
function loadUser(data, isPremium) {

  // Hide login
  const loginCard = document.getElementById("loginCard");
  if (loginCard) loginCard.style.display = "none";

  // Show dashboard
  const dashboard = document.getElementById("dashboard");
  if (dashboard) dashboard.style.display = "grid";

  // Username
  document.getElementById("username").innerText = data.name || "Unknown";

  // ===== STATUS CARD =====
  const statusCard = document.getElementById("statusCard");
  if (statusCard) {
    statusCard.innerHTML = `
      ⚡ Energy: ${data.energy?.current || 0}/${data.energy?.maximum || 0}<br>
      🧠 Nerve: ${data.nerve?.current || 0}/${data.nerve?.maximum || 0}<br>
      😊 Happy: ${data.happy?.current || 0}/${data.happy?.maximum || 0}
    `;
  }

  // ===== STATS CARD =====
  const statsCard = document.getElementById("statsCard");
  if (statsCard) {
    statsCard.innerHTML = `
      📊 Level: ${data.level || 0}<br>
      💪 Strength: ${data.strength || 0}<br>
      ⚡ Speed: ${data.speed || 0}<br>
      🛡️ Defense: ${data.defense || 0}<br>
      🎯 Dexterity: ${data.dexterity || 0}
    `;
  }

  // ===== OVERVIEW CARD =====
  const overviewCard = document.getElementById("overviewCard");
  if (overviewCard) {
    overviewCard.innerHTML = `
      💰 Money: $${(data.money || 0).toLocaleString()}<br>
      📈 Networth: $${(data.networth?.total || 0).toLocaleString()}<br>
      💊 Drug Cooldown: ${data.cooldowns?.drug || 0}s<br><br>
      🧠 ${getAdvisorText(data, isPremium)}
    `;
  }

  // ===== PROFILE =====
  const profileInfo = document.getElementById("profileInfo");
  if (profileInfo) {
    profileInfo.innerHTML = `
      Name: ${data.name || "Unknown"}<br>
      Level: ${data.level || 0}<br>
      Premium: ${isPremium ? "Yes 💊" : "No"}
    `;
  }
}

// ===== AUTO LOGIN =====
window.onload = async function () {
  const savedKey = localStorage.getItem("tornApiKey");

  if (savedKey) {
    fetch(`https://api.torn.com/user/?selections=basic,money,bars,stats,cooldowns,networth&key=${savedKey}`)
      .then(res => res.json())
      .then(async data => {
        if (!data.error) {
          const premium = await checkPremium(data.player_id);
          loadUser(data, premium);
        }
      });
  }
};

// ===== LOGOUT =====
function logout() {
  localStorage.removeItem("tornApiKey");
  location.reload();
}

// ===== EVENT LISTENERS =====
document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("loginBtn")?.addEventListener("click", login);
  document.getElementById("logoutBtn")?.addEventListener("click", logout);

  document.getElementById("tab-dashboard")?.addEventListener("click", (e) => showTab("dashboard", e));
  document.getElementById("tab-tools")?.addEventListener("click", (e) => showTab("tools", e));
  document.getElementById("tab-premium")?.addEventListener("click", (e) => showTab("premium", e));
  document.getElementById("tab-profile")?.addEventListener("click", (e) => showTab("profile", e));

});
