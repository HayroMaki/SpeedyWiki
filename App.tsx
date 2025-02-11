import {Route, HashRouter as Router, Routes } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Join from './pages/Join';
import NameSelection from './pages/Name_Selection';
import About from './pages/Aboutus';

function App() {

  return (
    <main className='h-FULL'>
    <Router>
        <Routes>
            <Route path="/" element={<Homepage/>} />
            <Route path="/Join" element={<Join/>}/>
            <Route path="/NameSelection" element={<NameSelection/>}/>
            <Route path="/About" element={<About/>}/>
        </Routes>
    </Router>
</main>
  )
}

export default App
