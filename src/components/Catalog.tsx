import { useNavigate } from 'react-router-dom'
import './Catalog.css'

interface Game {
    id: string
    title: string
    image: string
    romFile: string
}

const Catalog = () => {
    const navigate = useNavigate()

    // Aquí irás agregando tus juegos
    const games: Game[] = [
        {
            id: 'pokemon-rojo-fuego',
            title: 'Pokémon Rojo Fuego',
            image: '/pokemon-rojo-fuego.png',
            romFile: '/roms/pokemon-rojo-fuego.gba'
        },
        {
            id: 'pokemon-esmeralda',
            title: 'Pokémon Esmeralda',
            image: '/pokemon-esmeralda.png',
            romFile: '/roms/pokemon-esmeralda.gba'
        },
        {
            id: 'pokemon-rubi',
            title: 'Pokémon Rubí',
            image: '/pokemon-rubi.png',
            romFile: '/roms/pokemon-rubi.gba'
        },
        {
            id: 'pokemon-zafiro',
            title: 'Pokémon Zafiro',
            image: '/pokemon-zafiro.png',
            romFile: '/roms/pokemon-zafiro.gba',
        },
        {
            id: 'proximamente-2',
            title: 'Proximamente...',
            image: '/cs2.png',
            romFile: ''
        }
    ]

    const handleGameClick = (game: Game) => {
        if (game.romFile) {
            navigate(`/emulator/${game.id}`, { state: { game } })
        }
    }

    return (
        <div className="catalog">
            <div className="catalog-container">
                <h1 className="catalog-title">catalogo</h1>
                <h2 className="catalog-subtitle">Pokemon</h2>

                <div className="games-grid">
                    {games.map((game) => (
                        <div
                            key={game.id}
                            className={`game-card ${!game.romFile ? 'disabled' : ''}`}
                            onClick={() => handleGameClick(game)}
                        >
                            <div className="game-image-container">
                                <img
                                    src={game.image}
                                    alt={game.title}
                                    className="game-image"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/placeholder.png'
                                    }}
                                />
                            </div>
                            <p className="game-title">{game.title}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Catalog