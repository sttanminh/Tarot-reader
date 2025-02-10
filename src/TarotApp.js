import React, { useState, useEffect } from "react";
import tarotCards from "./tarot_cards.json";
import tarotQuestions from "./tarot_questions.json";
import "./TarotApp.css";

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("Missing OpenAI API Key! Make sure your .env file is set up.");
}

async function getTarotReading(question, cards) {
  console.log("Using API Key:", OPENAI_API_KEY); // Debug API Key

  try {
    // Introduce a small delay to prevent hitting rate limits
    await new Promise((resolve) => setTimeout(resolve, 1500)); 

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo-0125", // ✅ Use the latest available model
        messages: [
          { role: "system", content: "You are a tarot reading assistant." },
          { role: "user", content: `Question: ${question}\nCards: ${cards.map(c => c.name).join(", ")}` }
        ],
        max_tokens: 200
      })
    });

    if (response.status === 429) {
      throw new Error("Too many requests! Slow down or check your OpenAI quota.");
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    } else {
      throw new Error("Invalid response from OpenAI API");
    }
  } catch (error) {
    console.error("Error fetching Tarot reading:", error);
    return "Sorry, I couldn't generate a tarot reading. Please try again later.";
  }
}




function TarotApp() {
  const [selectedCards, setSelectedCards] = useState([]);
  const [question, setQuestion] = useState("");
  const [randomQuestions, setRandomQuestions] = useState([]);
  const [tarotReading, setTarotReading] = useState(""); // Store AI response
  const [loading, setLoading] = useState(false); // Track loading state

  // Function to get 3 random cards and fetch tarot reading
  const drawCards = async () => {
    if (!question.trim()) {
      alert("Please enter a question before drawing the cards.");
      return;
    }

    setLoading(true); // Start loading
    setTarotReading(""); // Clear previous reading

    const shuffled = [...tarotCards].sort(() => Math.random() - 0.5);
    const drawnCards = shuffled.slice(0, 3);
    setSelectedCards(drawnCards);

    try {
      const response = await getTarotReading(question, drawnCards);
      setTarotReading(response);
    } catch (error) {
      setTarotReading("Error getting tarot reading. Please try again.");
    }

    setLoading(false); // Stop loading
  };

  // Function to get 5 random questions from JSON file
  const getRandomQuestions = () => {
    const shuffled = [...tarotQuestions].sort(() => Math.random() - 0.5);
    setRandomQuestions(shuffled.slice(0, 5));
  };

  // Load random questions when the component mounts
  useEffect(() => {
    getRandomQuestions();
  }, []);

  return (
    <div className="container">
      <h1>Tarot Card Reading</h1>

      {/* Question Input Form */}
      <div>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter your question..."
          className="input-field"
          disabled={loading} // Disable input while loading
        />
      </div>

      {/* Example Questions List (5 Randomly Selected) */}
      <div>
        <p>Need inspiration? Click a question below:</p>
        {randomQuestions.map((q, index) => (
          <button
            key={index}
            onClick={() => setQuestion(q)}
            className="question-button"
            disabled={loading} // Disable buttons while loading
          >
            {q}
          </button>
        ))}
      </div>

      {/* Draw Cards Button */}
      <button onClick={drawCards} className="button" disabled={loading}>
        {loading ? "Drawing..." : "Draw 3 Cards"}
      </button>

      {/* Display Drawn Cards */}
      {selectedCards.length > 0 && (
        <div className="card-container">
          {selectedCards.map((card, index) => (
            <div key={index} className="card">
              <h3>{card.name}</h3>
              <p><strong>Meaning:</strong> {card.meaning}</p>
            </div>
          ))}
        </div>
      )}

      {/* Display AI-Generated Tarot Reading */}
      {loading ? (
        <p className="loading-message">Generating tarot reading...</p>
      ) : (
        tarotReading && (
          <div className="tarot-reading">
            <h2>Your Tarot Reading</h2>
            <p>{tarotReading}</p>
          </div>
        )
      )}
    </div>
  );
}

export default TarotApp;
