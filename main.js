const TelegramBot = require("node-telegram-bot-api")
const axios = require("axios")
require("dotenv").config();

const token = process.env.BOT_TOKEN;
const options = { polling: true }
const sungbot = new TelegramBot(token, options)

// Regex patterns
const askGeminiRegex = /\.ai\s+(.+)/i
const sayHi = /^woi$/
const askWalas = /nama walas/
const askKetua = /nama ketua/
const askSekre = /nama sekre/
const askBendahara = /nama benda/
const askIgkelas = /\big\b/i
const askTiktokkelas = /\btiktok\b/i
const askWebkelas = /\bweb\b/i

// Data kelas
const namaWalas = "Rini Novriani, ST"
const namaKetua = "Zsi Malik Aqilla Mustaqim"
const namaSekre = "Kayla Fitri Salsabila dan Angel Vetroni"
const namaBendahara = "Syaira Ramadhani dan Muhammad Raffa Nurhalim"
const igKelas = "@xitjktonesti\n\nhttps://www.instagram.com/xitjktonesti_"
const tiktokKelas = "Belum ada hehee, soon yaa!"
const webKelas = "tjktsamsungskanda.github.io"

console.log("KEY = ", process.env.GEMINI_KEY)

// ✅ FUNGSI BARU: Split pesan panjang
function splitMessage(text, maxLength = 4000) {
    if (text.length <= maxLength) return [text];
    
    const messages = [];
    let currentMessage = "";
    const lines = text.split('\n');
    
    for (const line of lines) {
        if ((currentMessage + line + '\n').length > maxLength) {
            if (currentMessage) messages.push(currentMessage.trim());
            currentMessage = line + '\n';
        } else {
            currentMessage += line + '\n';
        }
    }
    
    if (currentMessage) messages.push(currentMessage.trim());
    return messages;
}

// ✅ FUNGSI BARU: Kirim pesan dengan auto-split
async function safeSendMessage(chatId, text, options = {}) {
    try {
        const chunks = splitMessage(text);
        
        for (let i = 0; i < chunks.length; i++) {
            await sungbot.sendMessage(chatId, chunks[i], options);
            // Delay kecil antar pesan untuk avoid rate limit
            if (i < chunks.length - 1) {
                await new Promise(r => setTimeout(r, 500));
            }
        }
        return true;
    } catch (err) {
        console.error("Error sending message:", err.message);
        return false;
    }
}

// ✅ FUNGSI BARU: Edit pesan dengan auto-split
async function safeEditMessage(chatId, messageId, text) {
    try {
        const chunks = splitMessage(text);
        
        // Edit pesan pertama
        await sungbot.editMessageText(chunks[0], {
            chat_id: chatId,
            message_id: messageId
        });
        
        // Kirim sisanya sebagai pesan baru
        for (let i = 1; i < chunks.length; i++) {
            await sungbot.sendMessage(chatId, chunks[i]);
            await new Promise(r => setTimeout(r, 500));
        }
        
        return true;
    } catch (err) {
        console.error("Error editing message:", err.message);
        // Jika edit gagal, kirim sebagai pesan baru
        return await safeSendMessage(chatId, text);
    }
}

// ✅ FUNGSI BARU: Bersihkan formatting berlebihan
function cleanMarkdown(text) {
    // Hapus bold berlebihan (** atau __) tapi pertahankan struktur
    text = text.replace(/\*\*([^\*]+)\*\*/g, '$1'); // Hapus **bold**
    text = text.replace(/__([^_]+)__/g, '$1');       // Hapus __bold__
    
    // Ubah bullet points markdown jadi simbol sederhana
    text = text.replace(/^\* /gm, '• ');              // * jadi •
    text = text.replace(/^- /gm, '• ');               // - jadi •
    
    // Bersihkan multiple newlines jadi max 2
    text = text.replace(/\n{3,}/g, '\n\n');
    
    // Hapus spaces berlebihan
    text = text.replace(/  +/g, ' ');
    
    return text.trim();
}

async function askGemini(prompt) {
    const maxRetries = 4;
    const baseDelay = 500;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const res = await axios.post(
                'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
                {
                    contents: [
                        {
                            role: "user",
                            parts: [{ 
                                text: prompt + "\n\nCatatan: Berikan jawaban dalam format yang rapi dan mudah dibaca, tanpa terlalu banyak formatting bold."
                            }]
                        }
                    ]
                },
                { params: { key: process.env.GEMINI_KEY }, timeout: 25000 }
            );

            const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) return "Bang, AI-nya kosong jawabannya 😭";

            // ✅ Bersihkan formatting sebelum return
            return cleanMarkdown(text);

        } catch (err) {
            const status = err.response?.status;

            const retryable =
                status === 503 ||
                err.code === 'ECONNABORTED' ||
                err.code === 'ETIMEDOUT';

            if (!retryable || attempt === maxRetries) {
                console.log("Gemini Error:", err.response?.data || err.message);
                return "AI lagi error bang (503/timeout). Coba lagi bentar.";
            }

            const backoff = Math.min(2000, baseDelay * Math.pow(2, attempt));
            const jitter = Math.floor(Math.random() * 300);

            await new Promise(r => setTimeout(r, backoff + jitter));
        }
    }
}

function logUser(callback) {
    console.log(`
    User Info:
    - ID: ${callback.from.id}
    - Username: ${callback.from.username}
    - Pesan: ${callback.text}
    `)
}

// ✅ DIPERBAIKI: Gemini handler dengan safe edit
sungbot.onText(askGeminiRegex, async (msg, match) => {
    const prompt = match[1].trim();

    const thinking = await sungbot.sendMessage(msg.chat.id, "Sabar ya, aku mikir dulu...");

    const reply = await askGemini(prompt);

    // Gunakan safeEditMessage untuk handle pesan panjang
    await safeEditMessage(msg.chat.id, thinking.message_id, reply);

    logUser(msg);
});

// ✅ TAMBAHAN: Command /start dan /help
sungbot.onText(/\/start|\/help/, (callback) => {
    const helpText = `
🤖 *Halo! Aku Bot Kelas XI TJK Tonesti*

📌 *Perintah yang bisa kamu coba:*
• woi - Sapa aku
• nama walas - Info Wali Kelas
• nama ketua - Info Ketua Kelas
• nama sekre - Info Sekretaris
• nama benda - Info Bendahara
• ig - Instagram kelas
• tiktok - TikTok kelas
• web - Website kelas
• .ai [pertanyaan] - Tanya AI

Contoh: .ai apa itu javascript?
    `;
    safeSendMessage(callback.chat.id, helpText, { parse_mode: 'Markdown' });
    logUser(callback);
});

sungbot.onText(sayHi, (callback) => {
    safeSendMessage(callback.from.id, "Apa woi?")
    logUser(callback)
})

sungbot.onText(askWalas, (callback) => {
    safeSendMessage(callback.from.id, namaWalas)
    logUser(callback)
})

sungbot.onText(askKetua, (callback) => {
    safeSendMessage(callback.from.id, namaKetua)
    logUser(callback)
})

sungbot.onText(askSekre, (callback) => {
    safeSendMessage(callback.from.id, namaSekre)
    logUser(callback)
})

sungbot.onText(askBendahara, (callback) => {
    safeSendMessage(callback.from.id, namaBendahara)
    logUser(callback)
})

sungbot.onText(askIgkelas, (callback) => {
    safeSendMessage(callback.from.id, igKelas)
    logUser(callback)
})

sungbot.onText(askTiktokkelas, (callback) => {
    safeSendMessage(callback.from.id, tiktokKelas)
    logUser(callback)
})

sungbot.onText(askWebkelas, (callback) => {
    safeSendMessage(callback.from.id, webKelas)
    logUser(callback)
})

console.log("Bot sudah siap! 🚀")