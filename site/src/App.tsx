import {Route, HashRouter as Router, Routes } from 'react-router-dom';
import Home from './pages/Home.tsx';
import Join from './pages/Join';
import Selection from './pages/Selection.tsx';
import About from './pages/Aboutus';
import Game from './pages/Game.tsx';
import Lobby from "./pages/Lobby.tsx";
import Win from './pages/Win.tsx';

function App() {
  return (
    <main className='h-FULL'>
    <Router>
        <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/Join" element={<Join/>}/>
            <Route path="/Selection" element={<Selection/>}/>
            <Route path="/Lobby" element={<Lobby/>}/>
            <Route path='/Game' element={<Game/>}/>
            <Route path="/About" element={<About/>}/>
            <Route path='/Win' element={<Win/>}/>
        </Routes>
    </Router>
</main>
  )
}

export default App
