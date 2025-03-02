import "dotenv/config";
const BOT_TOKEN = "7819866889:AAFAB75mk7eIPLVXt2R4Sl4J4hTq0yQjfVY";
const CHAT_ID = "6286091721";

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
