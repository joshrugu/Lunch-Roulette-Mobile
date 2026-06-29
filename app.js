const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const copyBtn = document.getElementById("copyBtn");
const categoryEl = document.getElementById("category");
const foodEl = document.getElementById("food");
const budgetEl = document.getElementById("budget");
const challengeEl = document.getElementById("challenge");
const fortuneEl = document.getElementById("fortune");

const size = canvas.width;
const center = size / 2;
const radius = size * 0.44;

let data = null;
let rotation = 0;
let currentResult = "";

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function allRegularFoods() {
  return data.categories
    .filter(c => !["🎲 Chaos", "🌟 Lucky", "☠️ Legendary", "❓ Chef's Surprise"].includes(c.name))
    .flatMap(c => c.foods);
}

function drawWheel() {
  const cats = data.categories;
  const arc = (Math.PI * 2) / cats.length;

  ctx.clearRect(0, 0, size, size);

  cats.forEach((cat, index) => {
    const angle = index * arc;
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, angle, angle + arc);
    ctx.closePath();
    ctx.fillStyle = cat.color;
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,.76)";
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(angle + arc / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#24170f";
    ctx.font = "900 29px Inter, Arial";
    const label = cat.name.length > 21 ? cat.name.slice(0, 19) + "…" : cat.name;
    ctx.fillText(label, radius - 22, 10);
    ctx.restore();
  });

  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.lineWidth = 20;
  ctx.strokeStyle = "rgba(255,255,255,.86)";
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(center, center, radius * .14, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,.92)";
  ctx.fill();
}

function throwConfetti(amount = 55) {
  const colors = ["#FFD166", "#EF476F", "#06D6A0", "#118AB2", "#C77DFF"];
  for (let i = 0; i < amount; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti";
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.background = randomFrom(colors);
    piece.style.animationDelay = Math.random() * .4 + "s";
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 2300);
  }
}

function reveal(category) {
  const isSurprise = category.name === "❓ Chef's Surprise";
  const food = isSurprise ? randomFrom(allRegularFoods()) : randomFrom(category.foods);

  categoryEl.textContent = category.name;
  foodEl.textContent = food;
  budgetEl.textContent = category.budget;
  challengeEl.textContent = randomFrom(data.challenges);
  fortuneEl.textContent = randomFrom(data.fortunes);
  currentResult = `${category.name}: ${food}`;

  if (["🌟 Lucky", "❓ Chef's Surprise"].includes(category.name)) {
    throwConfetti();
  }
}

function spin() {
  const cats = data.categories;
  const selectedIndex = Math.floor(Math.random() * cats.length);
  const sliceDegrees = 360 / cats.length;
  const selectedCenter = selectedIndex * sliceDegrees + sliceDegrees / 2;

  const currentNormalized = ((rotation % 360) + 360) % 360;
  const desiredNormalized = (270 - selectedCenter + 360) % 360;
  let delta = desiredNormalized - currentNormalized;
  if (delta < 0) delta += 360;

  const fullSpins = 6 + Math.floor(Math.random() * 4);
  rotation += fullSpins * 360 + delta;

  spinBtn.disabled = true;
  categoryEl.textContent = "🎡 Spinning category...";
  foodEl.textContent = "Consulting lunch fate";
  budgetEl.textContent = "RM?";
  challengeEl.textContent = "Pending";
  fortuneEl.textContent = "The wheel is checking everyone’s lunch mood.";

  canvas.style.transform = `rotate(${rotation}deg)`;

  setTimeout(() => {
    reveal(cats[selectedIndex]);
    spinBtn.disabled = false;
  }, 4800);
}

async function copyResult() {
  const text = `🎲 Today's Lunch Roulette: ${currentResult || "Not spun yet"}`;
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = "✅ Copied!";
    setTimeout(() => copyBtn.textContent = "📋 Copy Result", 1200);
  } catch {
    alert(text);
  }
}

async function init() {
  const response = await fetch("./foods.json");
  data = await response.json();
  drawWheel();

  spinBtn.addEventListener("click", spin);
  copyBtn.addEventListener("click", copyResult);

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }
}

init();
