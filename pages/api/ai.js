import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests are allowed" });
  }

  const { userInput } = req.body;

  // Validate user input
  if (!userInput || userInput.trim() === "") {
    return res.status(400).json({ error: "Input cannot be empty" });
  }

  // Ensure the OpenAI API key is set
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return res
      .status(500)
      .json({ error: "OpenAI API key is not configured in the environment variables." });
  }

  try {
    const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

    // Send user input to OpenAI
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: "chatgpt-4o-latest", // Replace with your desired model
        max_tokens: 300, // Adjust token limit as needed
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

    // Provide detailed error response
    if (error.response) {
      // Error response from OpenAI
      return res.status(error.response.status).json({
        error: "OpenAI API error",
        details: error.response.data,
      });
    } else if (error.request) {
      // No response received
      return res.status(500).json({
        error: "No response received from OpenAI",
        details: error.message,
      });
    } else {
      // Request setup error
      return res.status(500).json({
        error: "Unexpected error occurred",
        details: error.message,
      });
    }
  }
}
