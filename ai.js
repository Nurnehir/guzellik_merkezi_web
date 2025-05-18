export async function getSalonSiralama(yorumlar) {
  const url = "https://us-central1-beautysalonapp-4c3af.cloudfunctions.net/api/gemini";

  if (!yorumlar || yorumlar.length === 0) {
    return "Yorum verisi bulunamadı.";
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ yorumlar }),
    });

    const data = await response.json();
    return data?.sonuc || "Sıralama alınamadı.";
  } catch (error) {
    console.error("Yapay zeka API hatası:", error);
    return "Yapay zeka sıralama yapılırken hata oluştu.";
  }
}
