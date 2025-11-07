import Deck from "./Components/Deck";
import Home from "./pages/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game/:gameId" element={<Deck />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;