import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import OpenAI from "openai";

const app = express();
app.use(bodyParser.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Chatwoot API config
const CHATWOOT_BASE_URL = process.env.CHATWOOT_BASE_URL; // e.g., https://app.cenotrades.com
const CHATWOOT_API_KEY = process.env.CHATWOOT_API_KEY;   // personal API key
const ACCOUNT_ID = process.env.CHATWOOT_ACCOUNT_ID || 1;  // usually 1
const INBOX_ID = process.env.CHATWOOT_INBOX_ID;           // inbox where bot is assigned

// Helper: send reply to Chatwoot
async function sendMessageToChatwoot(conversationId, message) {
  const url = `${CHATWOOT_BASE_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}/messages`;
  const body = {
    content: message,
    message_type: 1 // 1 = agent/bot message
  };

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api_access_token": CHATWOOT_API_KEY
      },
      body: JSON.stringify(body)
    });
    console.log("✅ Replied to Chatwoot:", message);
  } catch (err) {
    console.error("❌ Failed to send reply to Chatwoot:", err.message);
  }
}

// Webhook endpoint
app.post("/chatwoot-bot", async (req, res) => {
  const conversationId = req.body.conversation?.id;
  const userMessage = req.body.content?.trim() || "Hello";

  if (!conversationId) {
    return res.status(400).json({ content: "No conversation ID provided." });
  }

  // Immediately acknowledge Chatwoot so the widget stops waiting
  res.json({ content: "..." });

  try {
    // Generate AI reply
    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a concise, friendly support assistant for Cenotrades. Keep responses short, clear, and polite."
        },
        { role: "user", content: userMessage }
      ],
      temperature: 0.5,
      max_tokens: 200
    });

    const reply = completion.choices?.[0]?.message?.content || 
      "I’m here to help with your Cenotrades questions.";

    // Send reply to Chatwoot
    await sendMessageToChatwoot(conversationId, reply);

  } catch (err) {
    console.error("❌ AI Bot error:", err.message);
    await sendMessageToChatwoot(conversationId, "Sorry, I’m having trouble responding right now.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`⚡ Cenotrades AI bot running on port ${PORT}`));
