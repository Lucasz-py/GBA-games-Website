// src/components/Home.tsx
import { useNavigate } from 'react-router-dom'
import ColorBends from './ui/ColorBends'; // Ajusta la ruta según donde lo hayas creado
import './Home.css'

const Home = () => {
    const navigate = useNavigate()

    const handleStartClick = () => {
        navigate('/catalogo')
    }

    return (
        <div className="home">
            {/* --- FONDO ANIMADO --- */}
            <ColorBends
                colors={["#ff5c7a", "#8a5cff", "#00ffd1"]} // Puedes ajustar estos colores a tu gusto
                rotation={45}
                speed={0.2}
                scale={1}
                frequency={1}
                warpStrength={1}
                mouseInfluence={1}
                parallax={0.5}
                noise={0}
                transparent={false} // Importante: false si quieres que sea el fondo opaco
            />

            {/* Contenido principal (Texto y Botón) */}
            <div className="home-content">
                <h1 className="home-title">
                    play the best games <br /> for gameboy advance
                </h1>
                <button className="home-button" onClick={handleStartClick}>
                    Start
                </button>
            </div>

            {/* GIFs decorativos */}
            <div className="gif-decorations">
                <img src="/gif3.gif" alt="Link GIF" className="gif-bottom-left" />
                <img src="/gif1.gif" alt="Pokemon GIF" className="gif-bottom-right" />
            </div>
        </div>
    )
}

export default Home