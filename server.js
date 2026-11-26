
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

app.post("/api/chat", async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({
      model: model: "gemini-3.1-flash-lite"
    });

    let result;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        result = await model.generateContent(req.body.message);
        break;
      } catch (error) {
        console.error("Tentative", attempt, error.message);

        if (attempt === 3 || !String(error.message).includes("503")) {
          throw error;
        }

        await wait(attempt * 3000);
      }
    }

    res.json({ reply: result.response.text() });

  } catch (error) {
    console.error("ERREUR GEMINI :", error);
    res.status(500).json({
      error: "Gemini est temporairement indisponible. Réessaie."
    });
  }
});

app.listen(process.env.PORT || 3000);
