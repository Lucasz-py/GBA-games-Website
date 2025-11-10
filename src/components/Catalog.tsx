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

    // Array para juegos oficiales
    const officialGames: Game[] = [
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
            title: 'Zelda: the Minish cap',
            video: 'zelda-minish.mp4',
            romFile: '/roms/zelda-minish.gba',
        },
        {
            id: 'Dragon Ball Advanced Adventure',
            title: 'Dragon Ball: Advanced Adventure',
            video: '',
            romFile: '/roms/db.gba',
        }
    ]

    // Nuevo array para Hack Roms
    const hackRoms: Game[] = [
        {
            id: 'Pokemon Islas Doradas',
            title: 'Pokemon Islas Doradas',
            video: '',
            romFile: '/roms/islas-doradas.gba'
        },
        {
            id: 'Pokemon Memories',
            title: 'Pokemon Memories',
            video: '',
            romFile: '/roms/pokemon-memories.gba'
        },
        {
            id: 'Pokemon Gaia',
            title: 'Pokemon Gaia',
            video: '',
            romFile: '/roms/poke-gaia.gba'
        }
        // Agrega aquí tus Hack Roms cuando los tengas
    ]

    const handleGameClick = (game: Game) => {
        if (game.romFile) {
            navigate(`/emulator/${game.id}`, { state: { game } })
        }
    }

    // Función auxiliar para renderizar una grid de juegos (para no repetir código)
    const renderGameGrid = (gamesList: Game[]) => (
        <div className="games-grid">
            {gamesList.map((game) => (
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
                                playsInline
                            />
                        ) : (
                            <div className="placeholder-media">?</div>
                        )}
                    </div>
                    <p className="game-title">{game.title}</p>
                </div>
            ))}
        </div>
    )

    return (
        <div className="catalog">
            <div className="catalog-container">
                {/* SECCIÓN 1: CATÁLOGO OFICIAL */}
                <h1 className="catalog-title">catalogo</h1>
                {renderGameGrid(officialGames)}

                {/* Separador opcional si quieres más espacio entre secciones */}
                <div style={{ height: '40px' }}></div>

                {/* SECCIÓN 2: HACK ROMS */}
                <h1 className="catalog-title">hack roms</h1>
                {renderGameGrid(hackRoms)}
            </div>
        </div>
    )
}

export default Catalog