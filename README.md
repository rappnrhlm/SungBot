# SungBot
SungBot adalah Telegram bot sederhana yang gue build pakai Node.js. Bot ini dipake buat kebutuhan kelas (XI TJKT), mulai dari respon otomatis, info wali kelas/ketua, sampai fitur AI yang terhubung ke Google Gemini. Project ini jalan 24/7 di server Armbian lewat PM2 tanpa perlu IP publik atau domain.


# **SungBot — Telegram Bot with Node.js + Gemini API**

SungBot adalah Telegram bot yang gue build menggunakan **Node.js**, terintegrasi dengan **Gemini API**, dan berjalan 24/7 di server **Armbian** menggunakan **PM2**.  
Bot ini dibuat untuk kebutuhan kelas (XI TJKT), seperti info wali kelas, daftar pengurus, link IG kelas, sampai fitur AI berbasis perintah regex.

---

## ✨ Features

ADA 3 JENIS REGEX YANG SAYA BUAT

- `.ai <prompt>` → Chat AI dengan Gemini API
  
- `woi` → Auto reply cepat (harus sama persis)

REGEX bebas (yang penting mengandung kata dibawah ini):
- `nama walas`  
- `nama ketua`  
- `nama sekre`  
- `nama benda`  
- `ig`
- `tiktok`  
- `web`

Semua ditangani via regex bawaan `node-telegram-bot-api`.
