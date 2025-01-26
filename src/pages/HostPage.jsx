import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";

const HostPage = () => {
  const { participants, setParticipants, hostSettings, setHostSettings } =
    useAppContext();
  const [newParticipant, setNewParticipant] = useState({ name: "", cam: "" });
  const [pokemonName, setPokemonName] = useState("");
  const [socket, setSocket] = useState(null);
  const [hostCamInput, setHostCamInput] = useState("");

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => console.log("Connected to WebSocket server");
    ws.onclose = () => console.log("Disconnected from WebSocket server");

    setSocket(ws);

    return () => ws.close();
  }, []);

  const sendMessage = (message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  };

  const startRound = () => {
    const updatedHostSettings = {
      ...hostSettings,
      isRevealed: false,
      isRoundStarted: true,
    };
    setHostSettings(updatedHostSettings);
    sendMessage({
      type: "START_ROUND",
      hostSettings: updatedHostSettings,
      participants,
    });
  };

  const revealRound = () => {
    const updatedHostSettings = { ...hostSettings, isRevealed: true };
    setHostSettings(updatedHostSettings);
    sendMessage({
      type: "REVEAL_ROUND",
      hostSettings: updatedHostSettings,
      participants,
    });
  };

  const resetRound = () => {
    const updatedHostSettings = {
      ...hostSettings,
      pokemonImage: null,
      isRevealed: false,
      isRoundStarted: false,
    };
    setHostSettings(updatedHostSettings);

    const updatedParticipants = participants.map((p) => ({
      ...p,
      isImposter: false,
    }));
    setParticipants(updatedParticipants);

    sendMessage({
      type: "RESET_ROUND",
      hostSettings: updatedHostSettings,
      participants: updatedParticipants,
    });
  };

  const fetchPokemonImage = async () => {
    if (!pokemonName.trim()) return alert("Bitte einen Pokémon-Namen eingeben!");

    try {
      let englishName = pokemonName.toLowerCase();
      const testResponse = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${englishName}`
      );

      if (!testResponse.ok) {
        const speciesResponse = await fetch(
          "https://pokeapi.co/api/v2/pokemon-species?limit=10000"
        );
        const speciesData = await speciesResponse.json();

        const matchedSpecies = await Promise.all(
          speciesData.results.map(async (species) => {
            const speciesDetailsResponse = await fetch(species.url);
            const speciesDetails = await speciesDetailsResponse.json();

            return speciesDetails.names.some(
              (entry) =>
                entry.language.name === "de" &&
                entry.name.toLowerCase() === pokemonName.toLowerCase()
            )
              ? species
              : null;
          })
        ).then((matches) => matches.find((match) => match !== null));

        if (!matchedSpecies) return alert("Pokémon nicht gefunden.");

        const speciesDetailsResponse = await fetch(matchedSpecies.url);
        const speciesDetails = await speciesDetailsResponse.json();

        englishName = speciesDetails.names.find(
          (entry) => entry.language.name === "en"
        )?.name;
      }

      const pokemonResponse = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${englishName.toLowerCase()}`
      );

      if (!pokemonResponse.ok) throw new Error("Pokémon-Daten konnten nicht geladen werden.");

      const pokemonData = await pokemonResponse.json();
      setHostSettings((prev) => ({
        ...prev,
        pokemonImage: pokemonData.sprites.front_default,
      }));

      sendMessage({
        type: "UPDATE_POKEMON",
        hostSettings: { ...hostSettings, pokemonImage: pokemonData.sprites.front_default },
      });
    } catch (error) {
      alert("Fehler beim Abrufen des Pokémon-Bilds.");
      console.error(error);
    }
  };

  const updateHostCam = () => {
    const updatedHostSettings = { ...hostSettings, hostCam: hostCamInput };
    setHostSettings(updatedHostSettings);

    sendMessage({ type: "UPDATE_HOST_CAM", hostSettings: updatedHostSettings });
  };

  const addParticipant = () => {
    if (!newParticipant.name || !newParticipant.cam) {
      alert("Bitte sowohl Name als auch Cam-Link eingeben!");
      return;
    }

    const updatedParticipants = [
      ...participants,
      {
        name: newParticipant.name.trim(),
        cam: newParticipant.cam.trim(),
        isImposter: false,
      },
    ];
    setParticipants(updatedParticipants);

    sendMessage({ type: "ADD_PARTICIPANT", participants: updatedParticipants });

    setNewParticipant({ name: "", cam: "" });
  };

  const updateParticipant = (index, key, value) => {
    const updatedParticipants = [...participants];
    updatedParticipants[index][key] = value;
    setParticipants(updatedParticipants);

    sendMessage({ type: "UPDATE_PARTICIPANT", participants: updatedParticipants });
  };

  const toggleImposter = (index) => {
    const updatedParticipants = participants.map((p, i) => ({
      ...p,
      isImposter: i === index ? !p.isImposter : false,
    }));
    setParticipants(updatedParticipants);

    sendMessage({ type: "TOGGLE_IMPOSTER", participants: updatedParticipants });
  };

  const deleteParticipant = (index) => {
    const updatedParticipants = participants.filter((_, i) => i !== index);
    setParticipants(updatedParticipants);

    sendMessage({ type: "DELETE_PARTICIPANT", participants: updatedParticipants });
  };

  const clearParticipants = () => {
    if (window.confirm("Möchtest du wirklich alle Teilnehmer entfernen?")) {
      setParticipants([]);
      sendMessage({ type: "CLEAR_PARTICIPANTS", participants: [] });
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Host Page</h1>

      {/* Host Name */}
      <div className="mt-4">
        <label className="block mb-2">Host Name:</label>
        <input
          type="text"
          value={hostSettings.hostName || ""}
          onChange={(e) =>
            setHostSettings({ ...hostSettings, hostName: e.target.value })
          }
          className="border p-2"
        />
      </div>

      {/* Host Cam URL */}
      <div className="mt-4">
        <label className="block mb-2">Host Cam URL:</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={hostCamInput}
            onChange={(e) => setHostCamInput(e.target.value)}
            className="border p-2 flex-grow"
          />
          <button
            onClick={updateHostCam}
            className="bg-blue-500 text-white px-4 py-2"
          >
            Bestätigen
          </button>
        </div>
      </div>

      {/* Pokémon Image */}
      <div className="mt-4">
        <label className="block mb-2">Pokémon Name (Deutsch/Englisch):</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={pokemonName}
            onChange={(e) => setPokemonName(e.target.value)}
            className="border p-2 flex-grow"
          />
          <button
            onClick={fetchPokemonImage}
            className="bg-blue-500 text-white px-4 py-2"
          >
            Fetch Image
          </button>
        </div>
        {hostSettings.pokemonImage && (
          <img
            src={hostSettings.pokemonImage}
            alt="Selected Pokémon"
            className="mt-4 w-32 h-32 object-contain"
          />
        )}
      </div>

      {/* Participants */}
      <div className="mt-4">
        <h3>Participants:</h3>
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Name"
            value={newParticipant.name}
            onChange={(e) =>
              setNewParticipant({ ...newParticipant, name: e.target.value })
            }
            className="border p-2"
          />
          <input
            type="text"
            placeholder="Cam URL"
            value={newParticipant.cam}
            onChange={(e) =>
              setNewParticipant({ ...newParticipant, cam: e.target.value })
            }
            className="border p-2"
          />
          <button
            onClick={addParticipant}
            className="bg-blue-500 text-white px-4 py-2"
          >
            Add
          </button>
        </div>
        <ul className="mt-4">
          {participants.map((p, index) => (
            <li key={index} className="flex items-center gap-4 mb-2">
              <input
                type="text"
                value={p.name}
                onChange={(e) =>
                  updateParticipant(index, "name", e.target.value)
                }
                className="border p-2"
              />
              <input
                type="text"
                value={p.cam}
                onChange={(e) =>
                  updateParticipant(index, "cam", e.target.value)
                }
                className="border p-2"
              />
              <button
                onClick={() => toggleImposter(index)}
                className={`${
                  p.isImposter ? "bg-red-500" : "bg-green-500"
                } text-white px-4 py-2`}
              >
                {p.isImposter ? "Remove Imposter" : "Set Imposter"}
              </button>
              <button
                onClick={() => deleteParticipant(index)}
                className="bg-gray-500 text-white px-4 py-2"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        {participants.length > 0 && (
          <button
            onClick={clearParticipants}
            className="bg-red-500 text-white px-4 py-2 mt-4"
          >
            Remove All Participants
          </button>
        )}
      </div>

      {/* Control Buttons */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={startRound}
          className="bg-blue-500 text-white px-4 py-2"
        >
          Runde starten
        </button>
        <button
          onClick={revealRound}
          className="bg-green-500 text-white px-4 py-2"
        >
          Runde auflösen
        </button>
        <button
          onClick={resetRound}
          className="bg-gray-500 text-white px-4 py-2"
        >
          Runde zurücksetzen
        </button>
      </div>
    </div>
  );
};

export default HostPage;