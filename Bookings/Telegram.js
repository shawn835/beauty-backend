import "dotenv/config";
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

export const sendTelegramMessage = async (text) => {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.error("Telegram bot token or chat ID is missing!");
    return;
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Failed to send Telegram message:", data);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error sending message:", error);
    return null;
  }
};
