import React, { useState, useEffect } from "react";
import axios from "axios";

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Unauthorized: Please log in first.");
          return;
        }

        const response = await axios.get("https://root-auto-grade.onrender.com/get-quiz", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setQuestions(response.data.questions);
      } catch (error) {
        setError("Error fetching quiz questions: " + error.message);
      }
    };

    fetchQuiz();
  }, []);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNext = () => {
    if (selectedAnswer) {
      const isCorrect = selectedAnswer === questions[currentQuestionIndex].answer;
      setAnswers([...answers, selectedAnswer]);
      if (isCorrect) setScore(score + 1);
      
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
      } else {
        handleSubmit([...answers, selectedAnswer]);
      }
    }
  };

  const handleSubmit = async (finalAnswers) => {
    try {
      const token = localStorage.getItem("token");
      
      await axios.post(
        "http://127.0.0.1:5000/submit-quiz",
        { answers: finalAnswers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSubmitted(true);
      fetchLeaderboard();
    } catch (error) {
      setError("Error submitting quiz: " + error.message);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get("https://root-auto-grade.onrender.com");
      setLeaderboard(response.data.leaderboard);
    } catch (error) {
      setError("Error fetching leaderboard: " + error.message);
    }
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (questions.length === 0) return <p>Loading questions...</p>;

  return (
    <div>
      <h1>📝 Quiz</h1>
      {submitted ? (
        <div>
          <p>Your score: {score}/{questions.length}</p>
          <h2>🏆 Leaderboard</h2>
          <ul>
            {leaderboard.map((entry, index) => (
              <li key={index}>{index + 1}. {entry.user} - {entry.score} points</li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <h2>{questions[currentQuestionIndex].question}</h2>
          <div>
            {questions[currentQuestionIndex].options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleAnswerSelect(option)}
                style={{
                  backgroundColor: selectedAnswer === option ? "lightblue" : "white",
                  padding: "10px",
                  margin: "5px",
                  border: "1px solid black",
                }}
              >
                {option}
              </button>
            ))}
          </div>
          <button onClick={handleNext} disabled={!selectedAnswer}>
            {currentQuestionIndex === questions.length - 1 ? "Submit" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Quiz;
