import express from "express";
import bodyParser from "body-parser";
import OpenAI from "openai";

const app = express();
app.use(bodyParser.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ✅ Quick response and timeout handling
app.post("/chatwoot-bot", async (req, res) => {
  const userMessage = req.body.content?.trim() || "Hello";

  // Immediately acknowledge Chatwoot that message is being processed
  res.json({ content: "..." });

  try {
    // Run OpenAI request in background
    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a concise, friendly support assistant for Cenotrades. Keep responses short, polite, and helpful."
        },
        { role: "user", content: userMessage }
      ],
      temperature: 0.5,
      max_tokens: 200
    });

    const reply = completion.choices?.[0]?.message?.content || 
      "I’m here to help with your questions about Cenotrades.";

    // Optional: Send reply to Chatwoot asynchronously
    await fetch(req.body.webhook_url || "", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: reply })
    }).catch(() => console.log("No Chatwoot reply URL provided."));

    console.log("✅ Replied to Chatwoot:", reply);
  } catch (err) {
    console.error("❌ AI Bot error:", err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`⚡ Cenotrades AI bot running on port ${PORT}`));
