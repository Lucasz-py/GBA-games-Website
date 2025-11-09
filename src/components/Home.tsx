import { useNavigate } from 'react-router-dom'
import './Home.css'

const Home = () => {
    const navigate = useNavigate()

    const handleStart = () => {
        navigate('/catalogo')
    }

    return (
        <div className="home">
            <div className="home-content">
                <h1 className="home-title">
                    Juega los mejores titulos de la GameBoy Advanced
                </h1>

                <button className="home-button" onClick={handleStart}>
                    Comenzar
                </button>
            </div>
        </div>
    )
}

export default Home