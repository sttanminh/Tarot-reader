import React, { useState, useEffect } from "react";
import tarotCards from "./tarot_cards.json";
import tarotQuestions from "./tarot_questions.json";
import "./TarotApp.css";

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KE;
if (!OPENAI_API_KEY) {
  console.error("Missing OpenAI API Key! Make sure your .env file is set up.");
}

const getCardImageURL = (card) => {
  let imageName = "";

  // 🔵 Major Arcana Mapping
  const majorArcanaMapping = {
    "The Fool": "00", "The Magician": "01", "The High Priestess": "02", "The Empress": "03",
    "The Emperor": "04", "The Hierophant": "05", "The Lovers": "06", "The Chariot": "07",
    "Strength": "08", "The Hermit": "09", "Wheel Of Fortune": "10", "Justice": "11",
    "The Hanged Man": "12", "Death": "13", "Temperance": "14", "The Devil": "15",
    "The Tower": "16", "The Star": "17", "The Moon": "18", "The Sun": "19",
    "Judgement": "20", "The World": "21"
  };

  // 🃏 Major Arcana Logic
  if (card.arcana === "Major") {
    if (majorArcanaMapping[card.name]) {
      imageName = `${majorArcanaMapping[card.name]}-${card.name.replace(/\s+/g, "")}.jpg`;
    }
  } 
  // 🏆 Minor Arcana Logic
  else if (card.arcana === "Minor") {
    const rankMapping = {
      "Ace": "01", "Two": "02", "Three": "03", "Four": "04", "Five": "05",
      "Six": "06", "Seven": "07", "Eight": "08", "Nine": "09", "Ten": "10",
      "Page": "11", "Knight": "12", "Queen": "13", "King": "14"
    };

    const [rank, suit] = card.name.split(" of ");
    if (rankMapping[rank]) {
      imageName = `${suit}${rankMapping[rank]}.jpg`;
    }
  }

  return `/cards/${imageName}`; // Image stored in public/cards/
};


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
  const [tarotReading, setTarotReading] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showQuestionSection, setShowQuestionSection] = useState(true);
  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    getRandomQuestions();
  }, []);

  const getRandomQuestions = () => {
    const shuffled = [...tarotQuestions].sort(() => Math.random() - 0.5);
    setRandomQuestions(shuffled.slice(0, 5));
  };

  const drawCards = () => {
    if (!question.trim()) {
      alert("Please enter a question before drawing the cards.");
      return;
    }

    setShowQuestionSection(false); // Hide question section
    setTimeout(() => {
      const shuffled = [...tarotCards].sort(() => Math.random() - 0.5);
      setSelectedCards(shuffled.slice(0, 3));
      setShowCards(true);
    }, 500);
  };

  const getReading = async () => {
    if (selectedCards.length === 0) {
      alert("Please draw 3 cards first!");
      return;
    }

    setLoading(true);
    const response = await getTarotReading(question, selectedCards);
    setTarotReading(response);
    setShowModal(true);
    setLoading(false);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedCards([]);
    setTarotReading("");
    setQuestion("");
    setShowCards(false);
    setTimeout(() => {
      setShowQuestionSection(true);
    }, 500);
  };

  return (
    <div className="container">
      <h1>Tarot Card Reading</h1>

      {/* Question Section (Hidden after clicking Draw 3 Cards) */}
      <div className={`question-section ${showQuestionSection ? "fade-in" : "fade-out"}`}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter your question..."
          className="input-field"
        />

        <div className="recommended-questions">
          {randomQuestions.map((q, index) => (
            <button key={index} onClick={() => setQuestion(q)} className="question-button">
              {q}
            </button>
          ))}
        </div>

        <button onClick={drawCards} className="button">Draw 3 Cards</button>
      </div>

      {/* Drawn Cards Section */}
      {showCards && (
        <div  className="card-read">
        <div className="card-container">
        {selectedCards.map((card, index) => (
          <div key={index} className="card">
            <img src={getCardImageURL(card)} alt={card.name} className="card-image" />
            <h3>{card.name}</h3>
          </div>
          ))}
        </div>
        <button onClick={getReading} className="reading-button" disabled={loading}>
            {loading ? "Getting Reading..." : "Get Reading"}
          </button>
        </div>
        
      )}

      {/* Modal for Reading */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Your Tarot Reading</h2>
            <div className="modal-cards">
        {selectedCards.map((card, index) => (
          <div key={index} className="card">
            <img src={getCardImageURL(card)} alt={card.name} className="card-image" />
            <h3>{card.name}</h3>
          </div>
              ))}
            </div>
            <p className="modal-text">{tarotReading}</p>
            <button className="modal-close" onClick={handleClose}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}


export default TarotApp;


