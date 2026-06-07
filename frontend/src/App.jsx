import { Routes, Route } from 'react-router-dom';
import ERC1155 from './pages/ERC1155.jsx';
import Inventory from './pages/Inventory.jsx';
import MintLab from './pages/MintLab.jsx';
import ERC20 from './pages/ERC20.jsx';
import ERC721 from './pages/ERC721.jsx';
import Compare from './pages/Compare.jsx';
import Navbar from './components/Navbar.jsx';

function App() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <Routes>
          <Route path="/" element={<Compare />} />
          <Route path="/erc1155" element={<ERC1155 />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/mint-lab" element={<MintLab />} />
          <Route path="/erc20" element={<ERC20 />} />
          <Route path="/erc721" element={<ERC721 />} />
          <Route path="/compare" element={<Compare />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
