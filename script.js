// ===== TAB SWITCHING =====
function showTab(tabId, event) {
  const tabs = document.getElementsByClassName("tab");
  const buttons = document.querySelectorAll(".sidebar button");

  for (let tab of tabs) tab.style.display = "none";
  buttons.forEach(btn => btn.classList.remove("active"));

  const activeTab = document.getElementById(tabId);
  if (activeTab) activeTab.style.display = "grid";

  if (event?.target) event.target.classList.add("active");
}

// ===== LOGIN =====
function login() {
  const key = document.getElementById("apiKey").value.trim();
  const statusEl = document.getElementById("loginStatus");

  if (!key) {
    statusEl.innerText = "Enter API key";
    return;
  }

  statusEl.innerText = "Loading...";

  fetch(`https://api.torn.com/user/?selections=basic,money,bars,cooldowns,networth&key=${key}`)
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        statusEl.innerText = "❌ Invalid API Key";
        return;
      }

      localStorage.setItem("tornApiKey", key);
      loadUser(data);
    })
    .catch(() => {
      statusEl.innerText = "Error connecting to API";
    });
}

// ===== BASIC ADVICE =====
function getBasicAdvice(data) {
  if (data.energy?.current > 50) return "⚡ Use your energy!";
  if (data.nerve?.current > 10) return "🧠 Do some crimes!";
  return "😴 Wait and recover.";
}

// ===== PREMIUM ADVICE =====
function getPremiumAdvice(data) {
  if (data.energy?.current > 100) return "🔥 Train HARD right now";
  if (data.cooldowns?.drug > 0) return "💊 Wait for drug cooldown";
  if (data.nerve?.current > 20) return "🧠 Do high-tier crimes";
  return "📈 Stack resources for efficiency";
}

// ===== PROFIT ESTIMATOR =====
function estimateCrimeProfit(data) {
  return (data.nerve?.current || 0) * 5000;
}

// ===== LOAD USER =====
function loadUser(data) {
  document.getElementById("loginCard").style.display = "none";
  document.getElementById("dashboard").style.display = "grid";
  document.getElementById("username").innerText = data.name;

  // STATUS CARD
  const statusCard = document.getElementById("statusCard");
  if (statusCard) {
    const e = data.energy || {};
    const n = data.nerve || {};
    const h = data.happy || {};

    const eP = (e.current / e.maximum) * 100 || 0;
    const nP = (n.current / n.maximum) * 100 || 0;
    const hP = (h.current / h.maximum) * 100 || 0;

    statusCard.innerHTML = `
      ⚡ Energy: ${e.current || 0}/${e.maximum || 0}
      <div class="bar"><div style="width:${eP}%"></div></div>
      🧠 Nerve: ${n.current || 0}/${n.maximum || 0}
      <div class="bar"><div style="width:${nP}%; background:#9333ea"></div></div>
      😊 Happiness: ${h.current || 0}/${h.maximum || 0}
      <div class="bar"><div style="width:${hP}%; background:#facc15"></div></div>
    `;
  }

  // STATS CARD
  document.getElementById("statsCard").innerHTML = `
    📊 Level: ${data.level || 0}<br>
    💪 Strength: ${data.strength || 0}<br>
    ⚡ Speed: ${data.speed || 0}<br>
    🛡️ Defense: ${data.defense || 0}<br>
    🎯 Dexterity: ${data.dexterity || 0}
  `;

  // OVERVIEW (WITH PREMIUM)
  checkPremium(data.player_id).then(isPremium => {

    localStorage.setItem("tornPremium", isPremium);

    let advice = isPremium
      ? getPremiumAdvice(data)
      : getBasicAdvice(data);

    let extra = "";

    if (isPremium) {
      let profit = estimateCrimeProfit(data);
      let readyTime = new Date(Date.now() + (data.cooldowns?.drug || 0) * 1000);

      extra = `
        <br>💰 Est. Crime Profit: $${profit.toLocaleString()}
        <br>⏱ Drug Ready: ${readyTime.toLocaleTimeString()}
      `;

      document.body.classList.add("premium");
    }

    document.getElementById("overviewCard").innerHTML = `
      💰 Money: $${(data.money || 0).toLocaleString()}<br>
      📈 Networth: $${(data.networth?.total || 0).toLocaleString()}<br>
      💊 Drug Cooldown: ${data.cooldowns?.drug || 0}s
      ${extra}
      <br><br>🧠 ${advice}
    `;

    // PREMIUM TAB
    const premiumTab = document.querySelector("#premium .card");
    premiumTab.innerHTML = isPremium
      ? "💊 Premium Unlocked 😈"
      : "🔒 Premium Locked";

    // PROFILE
    document.getElementById("profileInfo").innerHTML = `
      Name: ${data.name}<br>
      Level: ${data.level}<br>
      Premium: ${isPremium ? "Yes 💊" : "No"}
    `;
  });
}

// ===== PREMIUM CHECK =====
async function checkPremium(userId) {
  try {
    const res = await fetch("https://raw.githubusercontent.com/elnixity/tornnet/main/premium-users.json");
    const data = await res.json();
    return data.users.some(u => u.id === userId);
  } catch {
    return false;
  }
}

// ===== SPLIT CALCULATOR =====
function calculateSplit() {
  const total = parseInt(document.getElementById("splitTotal").value) || 0;
  const people = parseInt(document.getElementById("splitPeople").value) || 1;

  const each = Math.floor(total / people);
  document.getElementById("splitResult").innerText =
    `Each person gets $${each.toLocaleString()}`;
}

// ===== AUTO LOGIN =====
window.onload = function () {
  const key = localStorage.getItem("tornApiKey");
  if (!key) return;

  fetch(`https://api.torn.com/user/?selections=basic,money,bars,cooldowns,networth&key=${key}`)
    .then(res => res.json())
    .then(data => {
      if (!data.error) loadUser(data);
    });
};

// ===== LOGOUT =====
function logout() {
  localStorage.clear();
  location.reload();
}
