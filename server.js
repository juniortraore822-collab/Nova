
const express = require("express");

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

app.post("/api/chat", async (req, res) => {
  try {
    const {
      message,
      history = [],
      memory = [],
      tasks = [],
      reminders = []
    } = req.body || {};

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message vide." });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        error: "La clé de connexion de NOVA n'est pas configurée."
      });
    }

    const safeHistory = Array.isArray(history)
      ? history
          .filter(item =>
            ["user", "assistant"].includes(item.role) &&
            typeof item.content === "string"
          )
          .slice(-20)
          .map(item => ({
            role: item.role,
            content: item.content.slice(0, 4000)
          }))
      : [];

    const safeMemory = Array.isArray(memory)
      ? memory
          .filter(item => typeof item === "string")
          .slice(-100)
          .map(item => item.slice(0, 1000))
      : [];

    const safeTasks = Array.isArray(tasks)
      ? tasks.slice(0, 50).map(t => ({
          title: String(t.title || "").slice(0, 200),
          priority: String(t.priority || "Normale"),
          date: String(t.date || "")
        }))
      : [];

    const safeReminders = Array.isArray(reminders)
      ? reminders.slice(0, 50).map(r => ({
          title: String(r.title || "").slice(0, 200),
          date: String(r.date || "")
        }))
      : [];

    const systemPrompt = `
Tu es NOVA, un assistant personnel intelligent.

PERSONNALITÉ :
- Tu parles principalement français.
- Tu es naturelle, chaleureuse, intelligente et respectueuse.
- Tu réponds clairement, sans être inutilement longue.
- Tu peux utiliser quelques emojis quand cela convient.
- Tu ne prétends jamais avoir réalisé une action que tu n'as pas effectuée.
- Tu ne prétends pas avoir accès aux applications ou aux données qui ne t'ont pas été fournies.

MÉMOIRE PERSONNELLE :
Voici les informations que l'utilisateur a enregistrées :
${safeMemory.length
  ? safeMemory.map(x => "- " + x).join("\n")
  : "Aucune information enregistrée."}

Utilise ces informations lorsqu'elles sont pertinentes.
Ne les invente jamais.
Si l'utilisateur veut enregistrer une information, indique-lui qu'il peut commencer sa phrase par « Retiens que ».

TÂCHES EN COURS :
${safeTasks.length
  ? safeTasks.map(t => `- ${t.title} | Priorité : ${t.priority} | Date : ${t.date || "Non définie"}`).join("\n")
  : "Aucune tâche en cours."}

RAPPELS :
${safeReminders.length
  ? safeReminders.map(r => `- ${r.title} | Date : ${r.date}`).join("\n")
  : "Aucun rappel enregistré."}

TES CAPACITÉS :
- Aider à réfléchir, apprendre, écrire et prendre des décisions.
- Analyser les tâches fournies et proposer un ordre de priorité.
- Préparer un programme de journée réaliste.
- Conseiller l'utilisateur sur son organisation.
- Préparer des messages et des publications.
- Expliquer comment utiliser les fonctions de NOVA.

LIMITES :
- Tu ne peux pas créer ou supprimer directement une tâche ou un rappel depuis le serveur.
- Les commandes simples de création et de mémoire sont traitées par l'application.
- Tu ne peux pas envoyer automatiquement des messages WhatsApp ni publier sur les réseaux sociaux.
- Tu ne peux pas déclencher des rappels lorsque le navigateur est fermé.
- Ne prétends pas avoir effectué une action si elle n'a pas été confirmée par l'application.

Réponds comme un véritable assistant personnel, en tenant compte du contexte disponible.
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
            { role: "user", content: message.trim().slice(0, 4000) }
          ],
          temperature: 0.7
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("ERREUR GROQ :", data);
      return res.status(500).json({
        error: "Le service intelligent de NOVA rencontre un problème."
      });
    }

    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({
        error: "NOVA n'a pas reçu de réponse exploitable."
      });
    }

    res.json({ reply });

  } catch (error) {
    console.error("ERREUR NOVA :", error);
    res.status(500).json({
      error: "NOVA rencontre un problème. Réessaie."
    });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("NOVA 3.0 est démarré !");
});
