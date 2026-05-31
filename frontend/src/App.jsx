import { Routes, Route } from 'react-router-dom';
import ERC1155 from './pages/ERC1155.jsx';
import Inventory from './pages/Inventory.jsx';
import MintLab from './pages/MintLab.jsx';
import ERC20 from './pages/ERC20.jsx';
import Navbar from './components/Navbar.jsx';

function App() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <Routes>
          <Route path="/" element={<ERC1155 />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/mint-lab" element={<MintLab />} />
          <Route path="/erc20" element={<ERC20 />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
