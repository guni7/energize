import React from 'react';
import logo from './logo.svg';
import './App.css';
import Navbar from './components/Navbar'
import { Home } from './pages/Home';
function App() {
  return (
    <div>
      <Navbar />
      <Home />
    </div>
  );
}

export default App;
