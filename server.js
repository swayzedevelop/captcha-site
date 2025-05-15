
const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");

const viewsDir = path.join(__dirname, "views");
const publicDir = path.join(__dirname, "public");

// Автоматическое создание папок и файлов, если их нет
if (!fs.existsSync(viewsDir)) {
  fs.mkdirSync(viewsDir);
  fs.writeFileSync(path.join(viewsDir, "captcha.ejs"), `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Подтверждение капчи</title>
  <link rel="stylesheet" href="/style.css">
  <script src="https://www.google.com/recaptcha/api.js" async defer></script>
</head>
<body>
  <div class="container">
    <h1>Подтвердите, что вы не бот</h1>
    <form action="/verify" method="post">
      <input type="hidden" name="uuid" value="<%= uuid %>">
      <div class="g-recaptcha" data-sitekey="<%= siteKey %>"></div>
      <button type="submit">Подтвердить</button>
    </form>
  </div>
</body>
</html>`);
}

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
  fs.writeFileSync(path.join(publicDir, "style.css"), `body {
  background-color: #1e1e1e;
  color: #ffffff;
  font-family: sans-serif;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
}
.container {
  background-color: #2b2b2b;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 0 10px #000000aa;
  text-align: center;
  width: 400px;
}
button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
button:hover {
  background-color: #45a049;
}`);
}

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Сервер капчи работает. Используй /captcha/UUID");
});

app.get("/captcha/:uuid", (req, res) => {
  const uuid = req.params.uuid;
  res.render("captcha", { uuid, siteKey: process.env.RECAPTCHA_SITE_KEY });
});

app.post("/verify", async (req, res) => {
  const token = req.body["g-recaptcha-response"];
  const uuid = req.body.uuid;

  const secret = process.env.RECAPTCHA_SECRET_KEY;

  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${secret}&response=${token}`
  });

  const data = await response.json();

  if (data.success) {
    console.log(`✅ Игрок ${uuid} прошел капчу`);
    res.send("✅ Капча пройдена. Вернись в игру.");
  } else {
    res.send("❌ Капча не пройдена. Попробуй ещё раз.");
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
