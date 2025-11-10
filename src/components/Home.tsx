import { useNavigate } from 'react-router-dom'
import './Home.css'

const Home = () => {
    const navigate = useNavigate()

    const handleStartClick = () => {
        navigate('/catalogo')
    }

    return (
        <div className="home">
            <div className="home-content">
                <h1 className="home-title">
                    play the best games <br /> for gameboy advance
                </h1>
                <button className="home-button" onClick={handleStartClick}>
                    Start
                </button>
            </div>

            {/* Contenedor para los GIFs decorativos */}
            <div className="gif-decorations">
                <img src="/gif3.gif" alt="Link GIF" className="gif-bottom-left" />
                <img src="/gif1.gif" alt="Pokemon GIF" className="gif-bottom-right" />
            </div>
        </div>
    )
}

export default Home