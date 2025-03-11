import "dotenv/config";
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

export const sendTelegramMessage = async (text) => {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  console.log("➡ Sending message to Telegram...");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: text,
      }),
    });

    const data = await response.json();
    console.log("✅ Telegram Response:", data);
  } catch (error) {
    console.error("❌ Error sending message:", error);
  }
};
