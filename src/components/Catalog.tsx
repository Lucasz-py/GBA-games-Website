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
            title: 'Pokemon Fire Red',
            video: '/pokemon-rojo-fuego.mp4',
            romFile: '/roms/pokemon-rojo-fuego.gba'
        },
        {
            id: 'pokemon-esmeralda',
            title: 'Pokemon Emerald',
            video: '/pokemon-esmeralda.mp4',
            romFile: '/roms/pokemon-esmeralda.gba'
        },
        {
            id: 'pokemon-rubi',
            title: 'Pokemon Ruby',
            video: '/pokemon-rubi.mp4',
            romFile: '/roms/pokemon-rubi.gba'
        },
        {
            id: 'pokemon-zafiro',
            title: 'Pokemon Sapphire',
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
            video: 'db.mp4',
            romFile: '/roms/db.gba',
        },
        {
            id: 'Pokemon Mundo Misterioso',
            title: 'Pokemon Mystery Dungeon',
            video: 'pokemon-mundo.mp4',
            romFile: '/roms/pokemon-mundo.gba',
        }
    ]

    // Nuevo array para Hack Roms
    const hackRoms: Game[] = [
        {
            id: 'Pokemon Islas Doradas',
            title: 'Pokemon Islas Doradas',
            video: 'pkmn-islas.mp4',
            romFile: '/roms/islas-doradas.gba'
        },
        {
            id: 'Pokemon dark worship',
            title: 'Pokemon Dark Worship',
            video: 'pkmn-dark-worship.mp4',
            romFile: '/roms/pokemon-dark-worship.gba'
        },
        {
            id: 'Pokemon Gaia',
            title: 'Pokemon Gaia',
            video: 'pkmn-gaia.mp4',
            romFile: '/roms/poke-gaia.gba'
        },
        {
            id: 'Pokemon Black Dark',
            title: 'Pokemon Black Dark',
            video: 'pkmn-black-dark.mp4',
            romFile: '/roms/pkmn-black-dark.gba'
        },
        //{
        //    id: 'Pokemon Light Platinum',
        //    title: 'Pokemon Light Platinum',
        //    video: 'pkmn-platinum.mp4',
        //    romFile: '/roms/pkmn-light-platinum.gba'
        //},
        //{
        //    id: 'Pokemon Ash Gray',
        //   title: 'Pokemon Ash Gray',
        //    video: 'pkmn-ash.mp4',
        //    romFile: '/roms/pkmn-ash-gray.gba'
        //},
        //{
        //    id: 'Pokemon Mystical',
        //    title: 'Pokemon Mystical',
        //    video: 'pkmn-mystical.mp4',
        //    romFile: '/roms/pkmn-mystical.gba'
        //},
        //{
        //    id: 'Pokemon Heroes',
        //    title: 'Pokemon Heroes',
        //    video: 'pkmn-heroes.mp4',
        //   romFile: '/roms/pkmn-heroes.gba'
        //},
        //{
        //    id: 'Pokemon Liquid Crystal',
        //    title: 'Pokemon Liquid Crystal', 
        //    video: 'pkmn-crystal.mp4',
        //    romFile: '/roms/pkmn-liquid-crystal.gba'
        //},
        //{
        //    id: 'Pokemon Memories',
        //    title: 'Pokemon Memories',
        //    video: 'pkmn-memories.mp4',
        //    romFile: '/roms/pokemon-memories.gba'
        //},
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
                <h1 className="catalog-title">catalog</h1>
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