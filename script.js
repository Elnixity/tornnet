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

  fetch(`https://api.torn.com/user/?selections=basic,money,bars&key=${key}`)
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

  document.getElementById("username").innerText = data.name;

  document.getElementById("playerCard").innerHTML =
    `👤 <b>${data.name}</b><br>Level ${data.level}`;

  document.getElementById("moneyCard").innerHTML =
    `💰 $${data.money.toLocaleString()}`;

  document.getElementById("energyCard").innerHTML =
    `⚡ Energy: ${data.energy.current}/${data.energy.maximum}`;

  document.getElementById("nerveCard").innerHTML =
    `🧠 Nerve: ${data.nerve.current}/${data.nerve.maximum}`;

  document.getElementById("profileInfo").innerHTML =
    `Name: ${data.name}<br>Level: ${data.level}`;
}

// AUTO LOGIN
window.onload = function () {
  const savedKey = localStorage.getItem("tornApiKey");

  if (savedKey) {
    fetch(`https://api.torn.com/user/?selections=basic,money,bars&key=${savedKey}`)
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
