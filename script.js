// TAB SWITCHING
function showTab(tabId) {
  let tabs = document.getElementsByClassName("tab");
  let buttons = document.querySelectorAll(".sidebar button");

  for (let tab of tabs) tab.style.display = "none";
  buttons.forEach(btn => btn.classList.remove("active"));

  document.getElementById(tabId).style.display = "grid";
  event.target.classList.add("active");
}

// LOGIN
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

// LOAD USER DATA
function loadUser(data) {
  document.getElementById("loginCard").style.display = "none";
  document.getElementById("dashboard").style.display = "grid";

  // TOP BAR
  document.getElementById("username").innerText = data.name;

  // PLAYER CARD
  document.getElementById("playerCard").innerHTML =
    `👤 <b>${data.name}</b><br>Level ${data.level}`;

  // MONEY
  document.getElementById("moneyCard").innerHTML =
    `💰 $${(data.money || 0).toLocaleString()}`;

  // ENERGY (SAFE)
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

  // NERVE (SAFE)
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
