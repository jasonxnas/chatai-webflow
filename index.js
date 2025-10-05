import express from "express";
import bodyParser from "body-parser";
import OpenAI from "openai";

const app = express();
app.use(bodyParser.json());

// Initialize OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Chatwoot webhook endpoint
app.post("/chatwoot-bot", async (req, res) => {
  try {
    const userMessage = req.body.content || "Hello";

    // Generate AI response with gpt-3.5-turbo (fast)
    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a concise and friendly support assistant for Cenotrades. Answer clearly and briefly."
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    const reply = completion.choices[0].message.content;

    // Respond immediately in Chatwoot format
    res.json({ content: reply });

  } catch (error) {
    console.error("AI Bot error:", error);
    res.json({ content: "Sorry, I am having trouble responding right now." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AI bot running on port ${PORT}`));
