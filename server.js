const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// =====================
// DATABASE (plik JSON)
// =====================
let db = {};

if (fs.existsSync("data.json")) {
  db = JSON.parse(fs.readFileSync("data.json"));
}

function saveDB() {
  fs.writeFileSync("data.json", JSON.stringify(db, null, 2));
}

// =====================
// REGISTER
// =====================
app.post("/register", (req, res) => {
  const { username, password, email } = req.body;

  if (db[username]) {
    return res.json({ ok: false, msg: "User already exists" });
  }

  db[username] = {
    password,
    email,
    level: 1,
    exp: 0,
    expToNext: 50,
    hp: 100,
    maxHp: 100,
    atk: 10,
    def: 5,
    speed: 5,
    gold: 50,
    inventory: []
  };

  saveDB();

  res.json({
    ok: true,
    msg: "Account created (email system not active yet)"
  });
});

// =====================
// LOGIN
// =====================
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = db[username];

  if (!user || user.password !== password) {
    return res.json({ ok: false, msg: "Wrong login" });
  }

  res.json({
    ok: true,
    user
  });
});

// =====================
// SIMPLE PvP FIGHT
// =====================
app.post("/fight", (req, res) => {
  const { attacker, defender } = req.body;

  const a = db[attacker];
  const d = db[defender];

  if (!a || !d) {
    return res.json({ ok: false, msg: "Player not found" });
  }

  const dmgToDef = Math.max(1, a.atk - d.def + Math.floor(Math.random() * 5));
  const dmgToAtk = Math.max(1, d.atk - a.def + Math.floor(Math.random() * 5));

  d.hp -= dmgToDef;
  a.hp -= dmgToAtk;

  saveDB();

  res.json({
    ok: true,
    log: `${attacker} dealt ${dmgToDef} dmg, ${defender} dealt ${dmgToAtk}`,
    attackerHP: a.hp,
    defenderHP: d.hp
  });
});

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
