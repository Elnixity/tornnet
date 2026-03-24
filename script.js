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

  fetch(`https://api.torn.com/user/?selections=basic,money,bars,cooldowns,networth,stats&key=${key}`)
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
  document.getElementById("loginCard").style.display = "none";
  document.getElementById("dashboard").style.display = "grid";

  document.getElementById("username").innerText = data.name;

  // ===== STATUS CARD =====
  const statusCard = document.getElementById("statusCard");
  if (statusCard) {
    const energyPercent = data.energy ? (data.energy.current / data.energy.maximum) * 100 : 0;
    const nervePercent = data.nerve ? (data.nerve.current / data.nerve.maximum) * 100 : 0;
    const happyPercent = data.happy ? (data.happy.current / data.happy.maximum) * 100 : 0;

    statusCard.innerHTML = `
      ⚡ Energy: ${data.energy?.current || 0}/${data.energy?.maximum || 0}
      <div style="background:#1e293b; border-radius:6px; margin-top:5px;">
        <div style="width:${energyPercent}%; background:#22c55e; height:8px; border-radius:6px;"></div>
      </div>
      🧠 Nerve: ${data.nerve?.current || 0}/${data.nerve?.maximum || 0}
      <div style="background:#1e293b; border-radius:6px; margin-top:5px;">
        <div style="width:${nervePercent}%; background:#9333ea; height:8px; border-radius:6px;"></div>
      </div>
      😊 Happiness: ${data.happy?.current || 0}/${data.happy?.maximum || 0}
      <div style="background:#1e293b; border-radius:6px; margin-top:5px;">
        <div style="width:${happyPercent}%; background:#facc15; height:8px; border-radius:6px;"></div>
      </div>
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
      💊 Drug Cooldown: ${data.cooldowns?.drug || 0}s
    `;
  }

  // ===== PROFILE INFO =====
  const profileInfo = document.getElementById("profileInfo");
  if (profileInfo) {
    profileInfo.innerHTML = `
      Name: ${data.name}<br>
      Level: ${data.level}
    `;
  }

  // ===== PREMIUM CHECK =====
  checkPremium(data.player_id).then(isPremium => {
    localStorage.setItem("tornPremium", isPremium);

    const premiumTab = document.querySelector("#premium .card");
    if (premiumTab) {
      premiumTab.innerHTML = isPremium
        ? "💊 Premium Features Unlocked 😈"
        : "🔒 Premium Feature Locked";
    }

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
    fetch(`https://api.torn.com/user/?selections=basic,money,bars,cooldowns,networth,stats&key=${savedKey}`)
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
  document.getElementById("tab-dashboard")?.addEventListener("click", (e) => showTab("dashboard", e));
  document.getElementById("tab-tools")?.addEventListener("click", (e) => showTab("tools", e));
  document.getElementById("tab-premium")?.addEventListener("click", (e) => showTab("premium", e));
  document.getElementById("tab-profile")?.addEventListener("click", (e) => showTab("profile", e));
});
