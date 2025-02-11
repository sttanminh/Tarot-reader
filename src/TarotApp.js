import React, { useState, useEffect } from "react";
import tarotCards from "./tarot_cards.json";
import tarotQuestions from "./tarot_questions.json";
import tarotQuestionsVi from "./tarot_questions_vietnamese.json";
import "./TarotApp.css";

// src/api/getTarotReading.js
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

export async function getTarotReading(question, cards, language = "en") {
  console.log("Using OpenAI API Key:", OPENAI_API_KEY);

  try {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const prompt = language === "en"
    ? `You are a mystical tarot reading assistant. Given the user's question and three drawn tarot cards, provide a detailed 4-paragraph reading.
        
        **User's Question:** ${question}

        **Past Card:** ${cards[0].name}  
        **Present Card:** ${cards[1].name}  
        **Future Card:** ${cards[2].name}  

        **Instructions:**  
        - Write a structured tarot reading in 4 paragraphs. 30-40 words each paragraph
        - **Paragraph 1** (Past): How the past influences the querent's situation.  
        - **Paragraph 2** (Present): The impact of the present card on their current life.  
        - **Paragraph 3** (Future): Potential outcomes or guidance from the future card.  
        - **Paragraph 4** (Overall Message): Summarize key themes, insights, and advice.  

        Keep the reading engaging and insightful.`

      : `Bạn là một trợ lý bói bài tarot huyền bí. Dựa trên câu hỏi của người dùng và ba lá bài đã rút, hãy cung cấp một bài đọc chi tiết gồm 4 đoạn.

        **Câu hỏi của người dùng:** ${question}

        **Lá bài Quá khứ:** ${cards[0].name}  
        **Lá bài Hiện tại:** ${cards[1].name}  
        **Lá bài Tương lai:** ${cards[2].name}  

        **Hướng dẫn:**  
        - Viết bài đọc gồm 4 đoạn văn. 30-40 tu moi đoạn
        - **Đoạn 1** (Quá khứ): Ảnh hưởng của lá bài quá khứ đến người hỏi.  
        - **Đoạn 2** (Hiện tại): Tác động của lá bài hiện tại đến cuộc sống hiện tại.  
        - **Đoạn 3** (Tương lai): Dự đoán hoặc lời khuyên từ lá bài tương lai.  
        - **Đoạn 4** (Tổng quan): Tóm tắt những thông điệp chính và lời khuyên chung.  

        Trả lời bằng tiếng Việt, rõ ràng và có chiều sâu.`;


    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo-0125",
        messages: [
          { role: "system", content: "You are a mystical tarot reading assistant." },
          { role: "user", content: prompt }
        ],
        max_tokens: 1000
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
  const [showReadingButton, setShowReadingButton] = useState(false);
  const [showReading, setShowReading] = useState(false);
  const [fogActive, setFogActive] = useState(false);
  const [fogVisible, setFogVisible] = useState(false);
  const [language, setLanguage] = useState("en"); // Default to English



  const getCardImageURL = (card) => {
    let imageName = "";
  
    const majorArcanaMapping = {
      "The Fool": "00", "The Magician": "01", "The High Priestess": "02", "The Empress": "03",
      "The Emperor": "04", "The Hierophant": "05", "The Lovers": "06", "The Chariot": "07",
      "Strength": "08", "The Hermit": "09", "Wheel Of Fortune": "10", "Justice": "11",
      "The Hanged Man": "12", "Death": "13", "Temperance": "14", "The Devil": "15",
      "The Tower": "16", "The Star": "17", "The Moon": "18", "The Sun": "19",
      "Judgement": "20", "The World": "21"
    };
  
    if (card.arcana === "Major") {
      if (majorArcanaMapping[card.name]) {
        imageName = `${majorArcanaMapping[card.name]}-${card.name.replace(/\s+/g, "")}.jpg`;
      }
    } else if (card.arcana === "Minor") {
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
  
    return `/cards/${imageName}`;
  };


  useEffect(() => {
    getRandomQuestions(); // 🔄 Fetch new questions when language changes
}, [language]); // 👈 Trigger when language updates


  useEffect(() => {
    if (selectedCards.length > 0 && selectedCards.every(card => card.revealed)) {
      setTimeout(() => setShowReadingButton(true), 500); // 🎯 Ensure delay before showing button
    }
  }, [selectedCards]);

  const getRandomQuestions = () => {
    const questions = language === "en" ? tarotQuestions : tarotQuestionsVi;
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setRandomQuestions(shuffled.slice(0, 5));
};

  

  const drawCards = () => {
    if (!question.trim()) {
      alert(language === "en" ? "Please input your question first!" : "Vui lòng nhập câu hỏi trước!");
      return;
    }

    setShowQuestionSection(false);

    setTimeout(() => {
    const shuffledDeck = [...tarotCards];
    for (let i = shuffledDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
    }
      const drawnCards = shuffledDeck.slice(0, 3).map(card => ({ ...card, revealed: false }));
      setSelectedCards(drawnCards);

      setTimeout(() => {
        setSelectedCards(drawnCards.map(card => ({ ...card, revealed: true })));
      }, 500);
    }, 500);
  };

  const getReading = async () => {
    if (selectedCards.length === 0) {
        alert("Please draw 3 cards first!");
        return;
    }

    setShowModal(true); // 1️⃣ Show Modal
    setShowReading(false); // 2️⃣ Hide the reading initially
    setFogActive(true); // 3️⃣ Keep the fog element in DOM

    setTimeout(() => {
        setFogVisible(true); // 4️⃣ Start fog fade-in effect
    }, 50); 

    const response = await getTarotReading(question, selectedCards,language); // 5️⃣ Call OpenAI API

    setTimeout(() => {
        setTarotReading(response); // 6️⃣ Set the reading text
        setShowReading(true); // 7️⃣ Show the reading but with LOW opacity
    }, 1500); // 🔥 Message appears **before** fog is fully gone

    setTimeout(() => {
        setFogVisible(false); // 8️⃣ Start fading out the fog
    }, 2500);

    setTimeout(() => {
        setFogActive(false); // 9️⃣ Remove fog completely
    }, 4000);
};


  
  
  const handleClose = () => {
    setShowModal(false);
    setSelectedCards([]);
    setTarotReading("");
    setQuestion("");
    setShowQuestionSection(true);
    setShowReadingButton(false);
  };

  return (
    <div className="container">
      <div className="dark-overlay"></div> 

      <button className="language-toggle" onClick={() => setLanguage(language === "en" ? "vi" : "en")}>
        {language === "en" ? "🇻🇳 Tiếng Việt" : "🇬🇧 English"}
      </button>
      <h1>{language === "en" ? "Tarot Card Reading" : "Bói Bài Tarot"}</h1>


      {showQuestionSection && (
        <div className="question-section fade-in">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={language === "en" ? "Enter your question..." : "Nhập câu hỏi của bạn..."}
            className="input-field"
          />

      <div className="recommended-questions">
          {randomQuestions.map((q, index) => (
              <button key={index} onClick={() => setQuestion(q)} className="question-button">
                  {q}
              </button>
          ))}
      </div>

          <button onClick={drawCards} className="button">{language === "en" ? "Draw 3 Cards" : "Rút 3 Lá Bài"}</button>
        </div>
      )}
      {selectedCards.length > 0 && (
  <div className="question-display">
    <h2>{language === "en" ? "Your Question:" : "Câu hỏi của bạn:"}</h2>
    <p>{question}</p>
  </div>
)}
      {selectedCards.length > 0 && (
        <div className="card-container">
          {selectedCards.map((card, index) => (
            <div key={index} className={`card ${card.revealed ? "reveal" : ""}`}>
              <img src={getCardImageURL(card)} alt={card.name} className="card-image" />
              <h3>{card.name}</h3>
            </div>
          ))}
        </div>
      )}

      {selectedCards.length > 0 && (
        <button onClick={getReading} className={`reading-button ${showReadingButton ? "show" : ""}`} disabled={loading}>
        {loading ? (language === "en" ? "Getting Reading..." : "Đang Xem Bói...") : (language === "en" ? "Get Reading" : "Xem Bói")}
      </button>
      )}

      {showModal && (
    <div className={`modal-overlay show`}>
        {/* 🔥 Fog Effect */}
        {fogActive && <div className={`fog-overlay ${fogVisible ? "fade-in" : "fade-out"}`}></div>}

        {/* 📜 Tarot Reading (Appears earlier, but fades in slowly) */}
        {/* 📜 Tarot Reading Section (Past, Present, Future) */}
<div className={`tarot-reading-container ${showReading ? "show" : ""}`}>
<h2>{language === "en" ? "Your Tarot Reading" : "Bài Bói Tarot Của Bạn"}</h2>

    {/* 🎴 3-Column Layout */}
    <div className="reading-grid">
        <div className="reading-column">
            <h3>{language === "en" ? "Past" : "Quá khứ"}</h3>
            <p>{tarotReading.split("\n\n")[0]}</p>
        </div>
        <div className="reading-column">
            <h3>{language === "en" ? "Present" : "Hiện tại"}</h3>
            <p>{tarotReading.split("\n\n")[1]}</p>
        </div>
        <div className="reading-column">
            <h3>{language === "en" ? "Future" : "Tương lai"}</h3>
            <p>{tarotReading.split("\n\n")[2]}</p>
        </div>
        <div className="reading-column">
            <h3>{language === "en" ? "Overall" : "Tổng quan"}</h3>
            <p>{tarotReading.split("\n\n")[3]}</p>
        </div>
    </div>

    <button className="modal-close" onClick={handleClose}>Done</button>
</div>

    </div>
)}





    </div>
  );
}

export default TarotApp;
