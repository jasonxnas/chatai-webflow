import express from "express";
import bodyParser from "body-parser";
import OpenAI from "openai";
import fetch from "node-fetch";

const app = express();
app.use(bodyParser.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const chatwootUrl = process.env.CHATWOOT_URL; // e.g., https://your-chatwoot.herokuapp.com
const chatwootToken = process.env.CHATWOOT_API_TOKEN; // personal access token

app.post("/chatwoot-bot", async (req, res) => {
  try {
    const { content: userMessage, id: messageId, inbox: { id: inboxId }, conversation } = req.body;
    const conversationId = conversation.id;

    // 1️⃣ Send immediate placeholder reply
    await fetch(`${chatwootUrl}/api/v1/accounts/1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api_access_token": chatwootToken
      },
      body: JSON.stringify({
        content: "🤖 AI is thinking...",
        message_type: 1, // incoming message
        private: false,
        inbox_id: inboxId,
        conversation_id: conversationId
      })
    });

    // 2️⃣ Generate AI reply
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a concise, friendly support assistant for Cenotrades. Answer clearly and briefly." },
        { role: "user", content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    const aiReply = completion.choices[0].message.content;

    // 3️⃣ Send actual AI reply
    await fetch(`${chatwootUrl}/api/v1/accounts/1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api_access_token": chatwootToken
      },
      body: JSON.stringify({
        content: aiReply,
        message_type: 1,
        private: false,
        inbox_id: inboxId,
        conversation_id: conversationId
      })
    });

    // 4️⃣ Respond quickly to Chatwoot webhook
    res.json({ content: "" });

  } catch (err) {
    console.error("AI Bot error:", err);
    res.json({ content: "Sorry, something went wrong." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AI bot running on port ${PORT}`));
