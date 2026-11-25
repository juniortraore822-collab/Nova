
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());
app.use(express.static("public"));

if (!process.env.GEMINI_API_KEY) {
  console.error("La clé GEMINI_API_KEY est absente !");
}

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || ""
);

app.post("/api/chat", async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.8-flash"
    });

    const result = await model.generateContent(req.body.message);
    res.json({ reply: result.response.text() });

  } catch (error) {
    console.error("ERREUR GEMINI :", error);
    res.status(500).json({
      error: "Erreur de connexion à NOVA."
    });
  }
});

app.listen(process.env.PORT || 3000);
