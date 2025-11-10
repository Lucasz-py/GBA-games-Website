import { Routes, Route } from 'react-router-dom'
// AJUSTA ESTAS RUTAS SI TUS ARCHIVOS ESTÁN EN SUBCARPETAS
import Header from './components/Header' // ¿Quizás está aquí?
import Home from './components/Home'
import Catalog from './components/Catalog'
import Emulator from './components/Emulator'
import Footer from './components/Footer' // ¿Quizás también moviste Footer a layout?
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