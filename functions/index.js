// ✅ index.js (Firebase Cloud Function)
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = "AIzaSyBwlh2meQzA15rcOjTRBs8fOdQLPNjVUmM";

// 1. Yorum Sıralama
app.post("/gemini", async (req, res) => {
  const yorumlar = req.body.yorumlar || [];

  if (yorumlar.length === 0) {
    return res.json({ sonuc: "Yorum verisi alınamadı." });
  }

  const yorumMetni = yorumlar.map((y, i) =>
    `${i + 1}. Salon: ${y.salonAdi}, Puan: ${y.puan}, Yorum: ${y.yorum}`
  ).join('\n');

  const prompt = `
Aşağıda bazı güzellik salonlarının müşteri puanları ve yorumları bulunmaktadır. 
Lütfen salonları hem puanlarına hem de yorum kalitesine göre değerlendirerek en iyiden en kötüye sırala. 
Ayrıca kötü yorumlara ve düşük puanlara sahip salonları "tercih etmeyin" diyerek belirt. 
İyi salonları önerirken neden iyi olduklarını da kısaca açıkla. 

Format:
1. [Salon Adı] - Ortalama Puan: [puan] - Açıklama: ...
...

Veri:

${yorumMetni}`;

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
    const yanit = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    res.json({ sonuc: yanit || "Yapay zekadan anlamlı bir cevap alınamadı." });
  } catch (error) {
    console.error("Gemini API hatası:", error);
    res.status(500).json({ sonuc: "Yapay zeka işleminde hata oluştu." });
  }
});

// 2. Chatbot Mesaj Yanıtlama (Yorumları ve puanları birlikte analiz ederek önerir)
app.post("/chatbot", async (req, res) => {
  const mesaj = req.body.mesaj?.trim().toLowerCase();

 const sabitSorular = [
  "istanbul'da en iyi güzellik merkezi hangisi?",
  "istanbul'da en iyi kuaför hangisi?",
  "ankara'da en iyi güzellik merkezi hangisi?",
  "ankara'da en iyi kuaför hangisi?",
  "izmir'de en iyi güzellik merkezi hangisi?",
  "izmir'de en iyi kuaför hangisi?",
  "bursa'da en iyi güzellik merkezi hangisi?",
  "bursa'da en iyi kuaför hangisi?",
  "elazığ'da en iyi güzellik merkezi hangisi?",
  "elazığ'da en iyi kuaför hangisi?"
];


  if (!mesaj || !sabitSorular.includes(mesaj)) {
    return res.json({ yanit: "Lütfen geçerli bir şehir ve desteklenen bir soru sorun. Örnek: 'İzmir'de en iyi kuaför hangisi?'" });
  }

  try {
    const admin = require("firebase-admin");
    if (!admin.apps.length) {
      admin.initializeApp();
    }
    const db = admin.firestore();

    const snapshot = await db.collection("comments").get();
    const yorumlar = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (!data.sehir || !data.salonKategori || !data.yorum) return;

      const sehirKisa = data.sehir.toLowerCase().split(" ")[0]; // 🔧 "Elazığ Merkez" → "elazığ"

      if (
        mesaj.includes(sehirKisa) &&
        ((mesaj.includes("güzellik merkezi") && data.salonKategori.toLowerCase() === "güzellik merkezi") ||
         (mesaj.includes("kuaför") && data.salonKategori.toLowerCase() === "kuaför"))
      ) {
        yorumlar.push(`Salon: ${data.salonAdi}, Puan: ${data.puan}, Şehir: ${data.sehir}, Kategori: ${data.salonKategori}, Yorum: ${data.yorum}`);
      }
    });

    if (yorumlar.length === 0) {
      return res.json({ yanit: "Bu şehir ve kategori için yeterli veri bulunamadı." });
    }

    const veriText = yorumlar.join("\n");

    const prompt = `Sen bir güzellik danışmanı yapay zekasısın. Kullanıcının aşağıdaki şehir ve kategoriye ait sorusuna, hem puanı yüksek hem de yorumu olumlu olan salonları öner. Ayrıca, puanı düşük veya yorumu olumsuz olan salonları da belirt ve \"tercih etmeyin\" şeklinde uyarı yap. İyi olan için de yorumlara göre Kullanıcıya yol gösterici bir şekilde yanıt ver.

Veri:
${veriText}

Soru:
${mesaj}`;

    const body = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    );

    const result = await response.json();
    const yanit = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    res.json({ yanit: yanit || "Anlamlı cevap alınamadı." });
  } catch (error) {
    console.error("Chatbot Gemini hatası:", error);
    res.status(500).json({ yanit: "Yapay zeka chatbot hatası.", hata: error.message });
  }
});

exports.api = functions.https.onRequest(app);
