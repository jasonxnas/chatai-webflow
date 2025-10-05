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
    const message = req.body.content || "Hello";

    // Generate AI response
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful, friendly customer support AI for the company website." },
        { role: "user", content: message }
      ]
    });

    const reply = completion.choices[0].message.content;

    // Respond in Chatwoot's expected format
    res.json({
      content: reply
    });
  } catch (err) {
    console.error("Error:", err);
    res.json({
      content: "Sorry, I'm having trouble responding right now."
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AI bot running on port ${PORT}`));
