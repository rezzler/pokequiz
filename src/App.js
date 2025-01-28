import React from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom"; // 🔄 BrowserRouter → HashRouter
import HostPage from "./pages/HostPage";
import LandingPage from "./pages/LandingPage";
import ParticipantPage from "./pages/ParticipantPage";
import HostOverlay from "./pages/HostOverlay";
import { AppProvider } from "./context/AppContext.jsx";
import './App.css';

const App = () => {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/host" element={<HostPage />} />
          <Route path="/host-overlay" element={<HostOverlay />} />
          <Route path="/:participantName" element={<ParticipantPage />} />
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;