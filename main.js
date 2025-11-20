const TelegramBot = require("node-telegram-bot-api")

require("dotenv").config();

const token = process.env.BOT_TOKEN;

const options = {
    polling: true
}

const sungbot = new TelegramBot(token, options)

// lojiknya disini boyy, stop ngira guwe pakek AI
const askGeminiRegex = /\.ai\s+(.+)/i

const sayHi = /^woi$/

const askWalas = /nama walas/
const askKetua = /nama ketua/
const askSekre = /nama sekre/
const askBendahara = /nama benda/

const askIgkelas = /ig/
const askTiktokkelas = /tiktok/
const askWebkelas = /web/

const namaWalas = "Rini Novriani, ST"
const namaKetua = "Zsi Malik Aqilla Mustaqim"
const namaSekre = "Kayla Fitri Salsabila dan Angel Vetroni"
const namaBendahara = "Syaira Ramadhani dan Muhammad Raffa Nurhalim"

const igKelas = "@xitjktonesti\n\nhttps://www.instagram.com/xitjktonesti_"
const tiktokKelas = "Belum ada hehee, soon yaa!"
const webKelas = "tjktsamsungskanda.github.io"
//

require("dotenv").config()
const axios = require("axios")

console.log("KEY = ", process.env.GEMINI_KEY)

async function askGemini(prompt) {
    try {
        const res = await axios.post(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
            {
                contents: [
                    {
                        role: "user",
                        parts: [{ text: prompt }]
                    }
                ]
            },
            {
                params: { key: process.env.GEMINI_KEY }
            }
        );

        const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) return "Error bang, AI kosong jawabannya 😭";

        return text;
    } catch (err) {
        console.log("Gemini Error:", err.response?.data || err.message);
        return "Error bang, AI lagi ngambek 😭";
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

sungbot.onText(askGeminiRegex, async (msg, match) => {
    const prompt = match[1].trim()

    await sungbot.sendMessage(msg.from.id, "Bentar ya....")

    const reply = await askGemini(prompt)

    await sungbot.sendMessage(msg.from.id, reply)

    logUser(msg)
})

sungbot.onText(sayHi, (callback) => {
    sungbot.sendMessage(callback.from.id, "Apa woi?")
    logUser(callback)
})

sungbot.onText(askWalas, (callback) => {
    sungbot.sendMessage(callback.from.id, namaWalas)
    logUser(callback)
})

sungbot.onText(askKetua, (callback) => {
    sungbot.sendMessage(callback.from.id, namaKetua)
    logUser(callback)
})

sungbot.onText(askSekre, (callback) => {
    sungbot.sendMessage(callback.from.id, namaSekre)
    logUser(callback)
})

sungbot.onText(askBendahara, (callback) => {
    sungbot.sendMessage(callback.from.id, namaBendahara)
    logUser(callback)
})

sungbot.onText(askIgkelas, (callback) => {
    sungbot.sendMessage(callback.from.id, igKelas)
    logUser(callback)
})

sungbot.onText(askTiktokkelas, (callback) => {
    sungbot.sendMessage(callback.from.id, tiktokKelas)
    logUser(callback)
})

sungbot.onText(askWebkelas, (callback) => {
    sungbot.sendMessage(callback.from.id, webKelas)

    logUser(callback)

})