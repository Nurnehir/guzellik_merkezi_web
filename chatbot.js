// chatbot.js

export async function getChatbotYaniti(mesaj) {
  const url = "https://us-central1-beautysalonapp-4c3af.cloudfunctions.net/api/chatbot";

  if (!mesaj || mesaj.trim() === "") {
    return "Lütfen bir mesaj girin.";
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ mesaj })
    });

    if (!response.ok) {
      console.error("HTTP Hatası:", response.status);
      return "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.";
    }

    const data = await response.json();

    if (data?.yanit) {
      return data.yanit;
    } else {
      console.warn("Yanıt alınamadı:", data);
      return "Yapay zekadan cevap alınamadı.";
    }

  } catch (error) {
    console.error("Chatbot API hatası:", error.message);
    return "Yapay zeka ile konuşma sırasında bir hata oluştu.";
  }
}
