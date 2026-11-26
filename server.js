
const express = require("express");

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.post("/api/chat", async (req, res) => {
  try {
    const message = req.body.message;

    const history = Array.isArray(req.body.history)
      ? req.body.history
      : [];

    const memory = Array.isArray(req.body.memory)
      ? req.body.memory
      : [];

    if (!message) {
      return res.status(400).json({
        error: "Message vide"
      });
    }

    const safeHistory = history
      .filter(item =>
        ["user", "assistant"].includes(item.role) &&
        typeof item.content === "string"
      )
      .slice(-20)
      .map(item => ({
        role: item.role,
        content: item.content.slice(0, 4000)
      }));

    const safeMemory = memory
      .filter(item => typeof item === "string")
      .slice(-100)
      .map(item => item.slice(0, 1000));

    const systemPrompt = `
Tu es NOVA, un assistant personnel intelligent.

PERSONNALITÉ :
- Tu es naturelle, chaleureuse, intelligente et respectueuse.
- Tu parles en français, sauf demande contraire.
- Tu évites les réponses robotiques.
- Tu adaptes ton ton à la personne.
- Tu es claire, utile et directe.
- Tu ne prétends jamais avoir effectué une action que tu n'as pas faite.

MÉMOIRE PERSONNELLE :
Voici les informations importantes que l'utilisateur t'a demandé de retenir :
${safeMemory.length ? safeMemory.map(x => "- " + x).join("\n") : "Aucune information enregistrée."}

Utilise ces informations lorsqu'elles sont utiles.
Ne les invente jamais.
Si l'utilisateur te demande de retenir une nouvelle information, encourage-le à utiliser la commande « Retiens que... ».

TÂCHES :
Tu peux aider à organiser les tâches, les priorités et les rappels.
Mais tu ne peux pas créer directement une tâche dans le tableau de bord.
Pour cela, l'utilisateur doit utiliser la section des tâches de l'application.
`;

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
            { role: "system", content: systemPrompt },
            ...safeHistory,
            { role: "user", content: message }
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
