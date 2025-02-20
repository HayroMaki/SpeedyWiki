import {Route, HashRouter as Router, Routes } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Join from './pages/Join';
import NameSelection from './pages/Name_Selection';
import About from './pages/Aboutus';
import NameSelectionhost from './pages/Name_Selection_host';
import Test from './pages/Test';
import GamePage from './pages/GamePage';
import GamePage2 from './pages/GamePage copy';
import Truc from './pages/truv';
function App() {
  return (
    <main className='h-FULL'>
    <Router>
        <Routes>
            <Route path="/" element={<Homepage/>} />
            <Route path="/Join" element={<Join/>}/>
            <Route path="/NameSelection" element={<NameSelection/>}/>
            <Route path="/About" element={<About/>}/>
            <Route path="/NameSelectionHost" element={<NameSelectionhost />} />
            <Route path='/Test' element={<Test/>}/>
            <Route path='/GamePage' element={<GamePage/>}/>
            <Route path='/GamePage2' element={<GamePage2/>}/>
            <Route path='/truc' element={<Truc title={"France"}/>}/>
        </Routes>
    </Router>
</main>
  )
}

export default App
