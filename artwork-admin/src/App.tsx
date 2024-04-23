// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import VincentPage from './pages/VincentAdmin';
import VincentImages from './pages/VincentGrid';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<VincentPage />} />
        <Route path="/grids" element={<VincentImages />} />
      </Routes>
    </Router>
  );
}

export default App;
