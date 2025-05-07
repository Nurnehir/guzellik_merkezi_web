// Firebase SDK modülleri
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

// 🔐 Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyDJirw-mDrefZho9wn1WqcC0n2H45Oa8FE",
    authDomain: "beautysalonapp-4c3af.firebaseapp.com",
    projectId: "beautysalonapp-4c3af",
    storageBucket: "beautysalonapp-4c3af.firebasestorage.app",
    messagingSenderId: "993447977304",
    appId: "1:993447977304:web:4686572339b487b816452d",
    measurementId: "G-CQDVC8YHLP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 🔐 Giriş (index.html)
const loginBtn = document.getElementById("loginBtn");
if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      const msg = document.getElementById("successMessage");
      if (msg) {
        msg.style.display = "block";
        setTimeout(() => {
          msg.style.display = "none";
          window.location.href = "home.html"; // ✅ Mesajdan sonra yönlendirme
        }, 2500); // 2.5 saniye sonra kaybolur ve yönlendir
      }
    })
    .catch((error) => {
      alert("Giriş hatası: " + error.message);
    });
  });
}

// 📝 Kayıt
const signupBtn = document.getElementById("signupBtn");
if (signupBtn) {
  signupBtn.addEventListener("click", () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        alert("Kayıt başarılı! Giriş yapabilirsiniz.");
        window.location.href = "index.html";
      })
      .catch((error) => {
        alert("Kayıt hatası: " + error.message);
      });
  });
}

// 🔁 Şifre Sıfırlama
const resetBtn = document.getElementById("resetBtn");
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    const email = document.getElementById("resetEmail").value;

    sendPasswordResetEmail(auth, email)
      .then(() => {
        alert("Şifre sıfırlama bağlantısı gönderildi!");
      })
      .catch((error) => {
        alert("Sıfırlama hatası: " + error.message);
      });
  });
}
