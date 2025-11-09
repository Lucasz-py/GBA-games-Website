import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './Emulator.css'

interface IEmulatorInstance {
    destroy?: () => void;
    [key: string]: unknown;
}

declare global {
    interface Window {
        EJS_player: string;
        EJS_core: string;
        EJS_gameUrl: string;
        EJS_pathtodata: string;
        EJS_startOnLoaded: boolean;
        EJS_DEBUG_XX?: boolean;
        EJS_Emulator?: IEmulatorInstance | null;
    }
}

const Emulator = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const game = location.state?.game
    // ESTA ES LA CLAVE: Una referencia que sobrevive a los re-renderizados
    const didInitRef = useRef(false)

    useEffect(() => {
        if (!game) {
            navigate('/catalogo')
            return
        }

        // Si ya inicializamos una vez en esta visita, NO hacer nada más.
        // Esto bloquea la segunda ejecución automática de React Strict Mode.
        if (didInitRef.current) return;
        didInitRef.current = true;

        // --- INICIO ÚNICO ---
        // Limpiamos por si acaso quedo basura de antes
        const existingScript = document.getElementById('ejs-loader-script');
        if (existingScript) existingScript.remove();

        window.EJS_player = '#emulator-target'
        window.EJS_core = 'gba'
        window.EJS_pathtodata = '/data/'
        window.EJS_gameUrl = new URL(game.romFile, window.location.origin).href
        window.EJS_startOnLoaded = true
        window.EJS_DEBUG_XX = false

        // Creamos el script con un ID único para poder encontrarlo y borrarlo fácil
        const script = document.createElement('script')
        script.id = 'ejs-loader-script'
        script.src = '/data/loader.js'
        script.async = true
        document.body.appendChild(script)

        // --- LIMPIEZA (Solo ocurrirá cuando realmente te vayas de la página) ---
        return () => {
            // Intentamos limpiar, aunque ahora confiamos más en la recarga del Header
            try {
                if (window.EJS_Emulator && typeof window.EJS_Emulator.destroy === 'function') {
                    window.EJS_Emulator.destroy();
                }
            } catch (e) { console.warn(e) }

            window.EJS_Emulator = null;
        }

    }, [game, navigate])

    if (!game) return null

    return (
        <div className="emulator">
            <div className="emulator-container">
                <h1 className="emulator-title">{game.title}</h1>
                <div className="emulator-wrapper">
                    <div id="emulator-target"></div>
                </div>
            </div>
        </div>
    )
}

export default Emulator