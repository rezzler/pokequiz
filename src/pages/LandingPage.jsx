import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const [participantName, setParticipantName] = useState("");
  const [hostPassword, setHostPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const correctPassword = "pokequiz123"; // 🔐 Ändere das Passwort nach Bedarf

  const handleJoinParticipant = () => {
    if (participantName.trim()) {
      navigate(`/${participantName.trim()}`);
    } else {
      setError("Bitte gib einen Namen ein!");
    }
  };

  const handleAccessHost = () => {
    if (hostPassword === correctPassword) {
      localStorage.setItem("hostAccess", "true");
      navigate("/host");
    } else {
      setError("Falsches Passwort!");
    }
  };

  return (
    <div className="landing-container">
      <h1 className="title">Welcome to PokeQuiz</h1>

      <div className="section">
        <h2>Host-Zugang</h2>
        <input
          type="password"
          placeholder="Passwort eingeben"
          value={hostPassword}
          onChange={(e) => setHostPassword(e.target.value)}
          className="input-field"
        />
        <button onClick={handleAccessHost} className="btn">
          Host Page betreten
        </button>
      </div>

      <div className="section">
        <h2>Participant-Zugang</h2>
        <input
          type="text"
          placeholder="Teilnehmernamen eingeben"
          value={participantName}
          onChange={(e) => setParticipantName(e.target.value)}
          className="input-field"
        />
        <button onClick={handleJoinParticipant} className="btn">
          Beitreten
        </button>
      </div>

      <div className="section">
        <h2>Weitere Seiten</h2>
        <button onClick={() => navigate("/host-overlay")} className="btn">
          Host Overlay anzeigen
        </button>
      </div>

      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default LandingPage;