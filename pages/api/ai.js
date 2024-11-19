import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests are allowed" });
  }

  const { userInput } = req.body;

  if (!userInput || userInput.trim() === "") {
    return res.status(400).json({ error: "Input cannot be empty" });
  }

  try {
    const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    // Send user input to OpenAI with the updated veterinarian system role
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: "gpt-3.5-turbo", // Replace with your desired model
        max_tokens: 300, // Limit the maximum tokens in the response
        messages: [
          {
            role: "system",
            content:
              "You are a veterinarian named PawVetAIBot. You will answer questions as a veterinarian and introduce yourself as PawVetAI. In your expertise as a veterinarian, you will respond to questions regarding animal health and care.",
          },
          { role: "user", content: userInput },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const data = response.data;

    // Send the AI's response back to the client
    res.status(200).json({ prediction: data.choices[0].message.content.trim() });
  } catch (error) {
    console.error("API request failed:", error);
    res.status(500).json({ error: "API request failed", details: error.message });
  }
}
