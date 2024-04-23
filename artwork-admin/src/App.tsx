// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import VincentPage from './pages/Vincent';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<VincentPage />} />
      </Routes>
    </Router>
  );
}

export default App;
