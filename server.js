
const express = require("express");

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.post("/api/chat", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "Tu es NOVA, un assistant personnel intelligent. Tu réponds en français, clairement et utilement."
            },
            {
              role: "user",
              content: req.body.message
            }
          ],
          temperature: 0.7
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("ERREUR GROQ :", data);
      throw new Error("Erreur API Groq");
    }

    res.json({
      reply: data.choices[0].message.content
    });

  } catch (error) {
    console.error("ERREUR NOVA :", error);
    res.status(500).json({
      error: "NOVA rencontre un problème. Réessaie."
    });
  }
});

app.listen(process.env.PORT || 3000);
