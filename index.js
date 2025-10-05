import express from "express";
import bodyParser from "body-parser";
import OpenAI from "openai";

const app = express();
app.use(bodyParser.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Chatwoot webhook endpoint
app.post("/chatwoot-bot", async (req, res) => {
  try {
    const userMessage = req.body.content || "Hello";

    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a concise, friendly support assistant for Cenotrades."
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    const reply = completion.choices[0].message.content;

    res.json({ content: reply });
  } catch (err) {
    console.error("AI Bot error:", err);
    res.json({ content: "Sorry, I’m having trouble responding right now." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AI bot running on port ${PORT}`));
