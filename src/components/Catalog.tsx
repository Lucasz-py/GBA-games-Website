import { useNavigate } from 'react-router-dom'
import './Catalog.css'

interface Game {
    id: string
    title: string
    video: string
    romFile: string
}

const Catalog = () => {
    const navigate = useNavigate()

    // Aquí irás agregando tus juegos
    const games: Game[] = [
        {
            id: 'pokemon-rojo-fuego',
            title: 'Pokemon Rojo Fuego',
            video: '/pokemon-rojo-fuego.mp4',
            romFile: '/roms/pokemon-rojo-fuego.gba'
        },
        {
            id: 'pokemon-esmeralda',
            title: 'Pokemon Esmeralda',
            video: '/pokemon-esmeralda.mp4',
            romFile: '/roms/pokemon-esmeralda.gba'
        },
        {
            id: 'pokemon-rubi',
            title: 'Pokemon Rubi',
            video: '/pokemon-rubi.mp4',
            romFile: '/roms/pokemon-rubi.gba'
        },
        {
            id: 'pokemon-zafiro',
            title: 'Pokemon Zafiro',
            video: '/pokemon-zafiro.mp4',
            romFile: '/roms/pokemon-zafiro.gba',
        },
        {
            id: 'zelda-minish-cap',
            title: 'Zelda the Minish cap',
            video: 'zelda-minish.mp4',
            romFile: '/roms/zelda-minish.gba',
        },
        {
            id: 'proximamente-2',
            title: 'Proximamente...',
            video: '',
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
                <div className="games-grid">
                    {games.map((game) => (
                        <div
                            key={game.id}
                            className={`game-card ${!game.romFile ? 'disabled' : ''}`}
                            onClick={() => handleGameClick(game)}
                        >
                            <div className="game-media-container">
                                {game.video ? (
                                    <video
                                        src={game.video}
                                        className="game-video"
                                        muted
                                        loop
                                        autoPlay
                                        playsInline // Importante para que funcione bien en móviles
                                    />
                                ) : (
                                    // Fallback por si no hay video (ej. "Próximamente")
                                    <div className="placeholder-media">?</div>
                                )}
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