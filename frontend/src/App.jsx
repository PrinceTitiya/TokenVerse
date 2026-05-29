import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Inventory from './pages/Inventory.jsx';
import Navbar from './components/Navbar.jsx';

function App() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inventory" element={<Inventory />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
