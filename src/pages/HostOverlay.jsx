import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";

const HostOverlay = () => {
  const { participants, hostSettings } = useAppContext();
  const [socket, setSocket] = useState(null);
  const [currentHostSettings, setCurrentHostSettings] = useState({
    pokemonImage: null,
    hostCam: null,
  });
  const [currentImposter, setCurrentImposter] = useState(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => console.log("Connected to WebSocket server");

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      // Aktualisiere nur Pokémon-Bild und Imposter bei den Buttons
      if (
        message.type === "START_ROUND" ||
        message.type === "REVEAL_ROUND" ||
        message.type === "RESET_ROUND"
      ) {
        setCurrentHostSettings(message.hostSettings);
        const imposter = message.participants.find((p) => p.isImposter);
        setCurrentImposter(imposter);
      }
    };

    ws.onclose = () => console.log("Disconnected from WebSocket server");

    setSocket(ws);
    return () => ws.close();
  }, []);

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <div className="header-item">
          <p>IMPOSTER:</p>
          <p>{currentImposter?.name || "N/A"}</p>
        </div>
        <div className="header-item">
          <p>POKÉMON:</p>
          <img
            src={currentHostSettings.pokemonImage || "/default-pokemon.png"}
            alt="Pokémon"
          />
        </div>
      </div>

      {/* Host Cam */}
      <div className="host-cam">
        {hostSettings.hostCam ? (
          <iframe
            src={hostSettings.hostCam}
            title="Host Camera"
            className="w-full h-48 border rounded-lg"
          />
        ) : (
          <p className="text-gray-500">Host Cam nicht verfügbar</p>
        )}
      </div>

      {/* Participant Cams */}
      <div className="participant-grid">
        {participants.map((participant, index) => (
          <div key={index}>
            <iframe
              src={participant.cam}
              title={`${participant.name}'s Camera`}
              className="w-full h-48 border rounded-lg"
            />
            <p className="participant-name">@{participant.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HostOverlay;