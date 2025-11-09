import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './components/Home'
import Catalog from './components/Catalog'
import Emulator from './components/Emulator'
import Footer from './components/Footer'
import './App.css'

function App() {
  return (
    <>
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/emulator/:gameId" element={<Emulator />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App