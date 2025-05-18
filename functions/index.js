const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = "AIzaSyBwlh2meQzA15rcOjTRBs8fOdQLPNjVUmM";

app.post("/gemini", async (req, res) => {
  const yorumlar = req.body.yorumlar || [];

  if (yorumlar.length === 0) {
    return res.json({ sonuc: "Yorum verisi alınamadı." });
  }

  const yorumMetni = yorumlar.map((y, i) =>
    `${i + 1}. Salon: ${y.salonAdi}, Puan: ${y.puan}`
  ).join('\n');

  const prompt = `
Aşağıda bazı güzellik salonlarının aldığı müşteri puanları bulunmaktadır. Bu salonları ortalama puanlarına göre en iyi olandan kötüye doğru sırala. 
Yorumları dikkate alma. Sadece salon adı ve ortalama puana odaklan. Aşağıdaki formatta yanıt ver:

1. [Salon Adı] - Ortalama Puan: [puan]
2. ...

Veri:

${yorumMetni}
`;

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ]
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    );

    const result = await response.json();

    console.log("🎯 Gemini yanıtı:");
    console.dir(result, { depth: null });

    const yanit = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (yanit) {
      res.json({ sonuc: yanit });
    } else {
      res.json({ sonuc: "Yapay zekadan anlamlı bir cevap alınamadı." });
    }

  } catch (error) {
    console.error("Gemini API hatası:", error);
    res.status(500).json({ sonuc: "Yapay zeka işleminde hata oluştu." });
  }
});

exports.api = functions.https.onRequest(app);
