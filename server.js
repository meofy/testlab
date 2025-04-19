const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 3000;

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const USERS = {
  admin: { password: "adminpass", role: "admin" },
  user: { password: "userpass", role: "user" },
};

const PROFILES = {
  1: { id: 1, username: "admin", role: "admin", secret: "flag{admin_data}" },
  2: { id: 2, username: "user", role: "user", secret: "flag{user_data}" },
};

// CORS Misconfig
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Admin");
  next();
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = USERS[username];
  if (user && user.password === password) {
    res.cookie("role", user.role, { httpOnly: false });
    return res.redirect("/dashboard");
  }
  res.send("Login gagal");
});

app.get("/dashboard", (req, res) => {
  const role = req.cookies.role;
  res.send(`<h1>Halo, kamu login sebagai ${role || "anonim"}</h1>
    <p><a href="/admin">Coba akses /admin</a></p>
    <p><a href="/profile/1">Profil 1</a> | <a href="/profile/2">Profil 2</a></p>`);
});

app.get("/admin", (req, res) => {
  const role = req.cookies.role;
  const adminHeader = req.headers["x-admin"];
  if (role === "admin" || adminHeader === "true") {
    return res.send("<h1>Selamat datang di panel admin 🔐</h1>");
  }
  res.status(403).send("Kamu bukan admin.");
});

app.get("/api/data", (req, res) => {
  res.json({ secret: "ini data rahasia 😈" });
});

app.get("/profile/:id", (req, res) => {
  const requestedId = req.params.id;
  const profile = PROFILES[requestedId];
  if (!profile) return res.status(404).send("User not found");

  res.send(`
    <h2>Profil User #${requestedId}</h2>
    <p>Username: ${profile.username}</p>
    <p>Data Rahasia: ${profile.secret}</p>
    <p><a href="/profile/1">/profile/1</a> | <a href="/profile/2">/profile/2</a></p>
  `);
});

app.listen(PORT, () => {
  console.log(`TargetAPI running at http://localhost:${PORT}`);
});
