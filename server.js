
const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
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

  const response = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
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
