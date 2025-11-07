import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  async function start_game() {
    const res = await axios.post("http://localhost:3000/api/generate");
    const gameId = res.data.gameId;   
    navigate(`/game/${gameId}`);      
  }

  return (
    <>
      <h1>Home</h1>
      <button onClick={start_game}>Start Game</button>
    </>
  );
}

export default Home;
