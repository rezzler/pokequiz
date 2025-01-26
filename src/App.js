import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HostPage from "./pages/HostPage";
import ParticipantPage from "./pages/ParticipantPage";
import HostOverlay from "./pages/HostOverlay";
import { AppProvider } from "./context/AppContext";
import './App.css';

const App = () => {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/host" element={<HostPage />} />
          <Route path="/host-overlay" element={<HostOverlay />} />
          <Route path="/:participantName" element={<ParticipantPage />} />
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;