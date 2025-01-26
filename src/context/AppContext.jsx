import React, { createContext, useState, useContext, useEffect } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [participants, setParticipants] = useState(() => {
    const saved = localStorage.getItem("participants");
    return saved ? JSON.parse(saved) : [];
  });

  const [hostSettings, setHostSettings] = useState(() => {
    const saved = localStorage.getItem("hostSettings");
    return saved
      ? JSON.parse(saved)
      : { pokemonImage: null, hostCam: "", hostName: "" };
  });

  useEffect(() => {
    localStorage.setItem("participants", JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    localStorage.setItem("hostSettings", JSON.stringify(hostSettings));
  }, [hostSettings]);

  return (
    <AppContext.Provider
      value={{ participants, setParticipants, hostSettings, setHostSettings }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);