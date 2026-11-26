
const express = require("express");

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.post("/api/chat", async (req, res) => {
  try {
    const message = req.body.message;

    // Récupérer les anciennes conversations
    const history = Array.isArray(req.body.history)
      ? req.body.history
      : [];

    if (!message) {
      return res.status(400).json({
        error: "Message vide"
      });
    }

    // Vérifier et limiter l'historique
    const safeHistory = history
      .filter(item =>
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string"
      )
      .slice(-20)
      .map(item => ({
        role: item.role,
        content: item.content.slice(0, 4000)
      }));

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            {
              role: "system",
              content: "Tu es NOVA, un assistant personnel intelligent. Tu réponds toujours en français, clairement, naturellement et utilement. Tu utilises les anciennes conversations fournies pour garder le contexte et te souvenir des informations importantes."
            },
            ...safeHistory,
            {
              role: "user",
              content: message
            }
          ],
          temperature: 0.7
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("ERREUR GROQ :", data);
      return res.status(500).json({
        error: "Le service NOVA rencontre un problème."
      });
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

app.listen(process.env.PORT || 3000, () => {
  console.log("NOVA est démarré !");
});
