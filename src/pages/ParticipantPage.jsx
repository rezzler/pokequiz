import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const ParticipantPage = () => {
  const { participantName } = useParams();
  const { participants, setParticipants, hostSettings, setHostSettings } =
    useAppContext();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => console.log("Connected to WebSocket server");

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "START_ROUND") {
        setHostSettings(message.hostSettings);
        setParticipants(message.participants);
      }

      if (message.type === "REVEAL_ROUND") {
        setHostSettings(message.hostSettings);
      }

      if (message.type === "RESET_ROUND") {
        setHostSettings(message.hostSettings);
        setParticipants(message.participants);
      }
    };

    ws.onclose = () => console.log("Disconnected from WebSocket server");

    setSocket(ws);
    return () => ws.close();
  }, [setHostSettings, setParticipants]);

  const participant = participants.find(
    (p) => p.name.toLowerCase() === participantName.toLowerCase()
  );

  const imposter = participants.find((p) => p.isImposter);

  if (!participant) {
    return (
      <h1 className="text-center text-xl">
        Participant "{participantName}" not found
      </h1>
    );
  }

  return (
    <div className="container">
      <div className="main-layout">
        {/* Pokémon- und Imposter-Anzeige */}
        <div className="pokemon-imposter-container">
          {participant.isImposter ? (
            <>
              <img
                src="/imposter.png"
                alt="Imposter"
                className="imposter-image"
              />
              {hostSettings.isRevealed && (
                <img
                  src={hostSettings.pokemonImage || "/default-pokemon.png"}
                  alt="Pokemon"
                  className="pokemon-image"
                />
              )}
            </>
          ) : (
            <img
              src={hostSettings.pokemonImage || "/default-pokemon.png"}
              alt="Pokemon"
              className="pokemon-image"
            />
          )}
        </div>

        {/* Host Cam */}
        <div className="host-cam-container">
          {hostSettings.hostCam ? (
            <iframe
              src={hostSettings.hostCam}
              title="Host Camera"
              className="cam"
            />
          ) : (
            <p className="text-center text-gray-500">No Host Camera Available</p>
          )}
        </div>
      </div>

      {/* Teilnehmer-Cams */}
      <div className="participant-grid">
        {participants.map((p, index) => (
          <div key={index} className="participant-item">
            <iframe
              src={p.cam}
              title={`${p.name}'s Camera`}
              className="cam"
            />
            <p className="participant-name">@{p.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantPage;