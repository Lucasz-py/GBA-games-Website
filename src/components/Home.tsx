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
                    Play the best games for GameBoy Advance
                </h1>

                <button className="home-button" onClick={handleStart}>
                    Start
                </button>
            </div>
        </div>
    )
}

export default Home