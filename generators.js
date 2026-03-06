function generateSteam() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  for (let i = 0; i < 3; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  return result;
}

function generateMinecraft() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

function generateCrunchyroll() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = {
  steam: generateSteam,
  minecraft: generateMinecraft,
  crunchyroll: generateCrunchyroll
};