import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { saveService } from '../services/saveService'
import './Emulator.css'

interface IEmulatorInstance {
    destroy?: () => void
    gameSave?: () => ArrayBuffer | null
    gameLoad?: (data: ArrayBuffer) => void
    [key: string]: unknown
}

declare global {
    interface Window {
        EJS_player: string
        EJS_core: string
        EJS_gameUrl: string
        EJS_pathtodata: string
        EJS_startOnLoaded: boolean
        EJS_DEBUG_XX?: boolean
        EJS_Emulator?: IEmulatorInstance | null
        EJS_onSaveState?: (state: ArrayBuffer) => void
        EJS_onLoadState?: () => ArrayBuffer | null
    }
}

const Emulator = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { user } = useAuth()
    const game = location.state?.game
    const didInitRef = useRef(false)
    const [saveMenuOpen, setSaveMenuOpen] = useState(false)
    const [savedGames, setSavedGames] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    // Cargar lista de partidas guardadas
    useEffect(() => {
        if (user && game) {
            loadSavesList()
        }
    }, [user, game])

    const loadSavesList = async () => {
        if (!game) return
        const saves = await saveService.listUserSaves(game.id)
        setSavedGames(saves)
    }

    useEffect(() => {
        if (!game) {
            navigate('/catalogo')
            return
        }

        if (didInitRef.current) return
        didInitRef.current = true

        const existingScript = document.getElementById('ejs-loader-script')
        if (existingScript) existingScript.remove()

        window.EJS_player = '#emulator-target'
        window.EJS_core = 'gba'
        window.EJS_pathtodata = '/data/'
        window.EJS_gameUrl = new URL(game.romFile, window.location.origin).href
        window.EJS_startOnLoaded = true
        window.EJS_DEBUG_XX = false

        // Interceptar guardado automático
        window.EJS_onSaveState = (saveData: ArrayBuffer) => {
            if (user && game) {
                console.log('🎮 Guardado detectado, subiendo a la nube...')
                saveService.saveToCloud(game.id, saveData, 1, game.title)
                    .then(() => {
                        showNotification('✅ Partida guardada en la nube')
                        loadSavesList()
                    })
            }
        }

        const script = document.createElement('script')
        script.id = 'ejs-loader-script'
        script.src = '/data/loader.js'
        script.async = true
        document.body.appendChild(script)

        return () => {
            try {
                if (window.EJS_Emulator && typeof window.EJS_Emulator.destroy === 'function') {
                    window.EJS_Emulator.destroy()
                }
            } catch (e) {
                console.warn(e)
            }
            window.EJS_Emulator = null
        }
    }, [game, navigate, user])

    const handleManualSave = async () => {
        if (!user) {
            showNotification('⚠️ Debes iniciar sesión para guardar')
            return
        }

        if (!window.EJS_Emulator || !game) return

        setLoading(true)
        try {
            // Obtener estado actual del emulador
            const saveData = window.EJS_Emulator.gameSave?.()
            if (saveData) {
                await saveService.saveToCloud(game.id, saveData, 1, game.title)
                showNotification('✅ Partida guardada correctamente')
                await loadSavesList()
            }
        } catch (error) {
            showNotification('❌ Error al guardar')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleLoadSave = async (slot: number = 1) => {
        if (!user || !game) return

        setLoading(true)
        try {
            const saveData = await saveService.loadFromCloud(game.id, slot)
            if (saveData && window.EJS_Emulator) {
                window.EJS_Emulator.gameLoad?.(saveData)
                showNotification('✅ Partida cargada')
                setSaveMenuOpen(false)
            } else {
                showNotification('⚠️ No se encontró partida guardada')
            }
        } catch (error) {
            showNotification('❌ Error al cargar')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteSave = async (slot: number = 1) => {
        if (!user || !game) return

        const confirm = window.confirm('¿Seguro que quieres eliminar esta partida?')
        if (!confirm) return

        setLoading(true)
        try {
            await saveService.deleteSave(game.id, slot)
            showNotification('🗑️ Partida eliminada')
            await loadSavesList()
        } catch (error) {
            showNotification('❌ Error al eliminar')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const showNotification = (message: string) => {
        const notification = document.createElement('div')
        notification.textContent = message
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #250e42;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            border: 2px solid #8a5cff;
            font-family: 'Early GameBoy', monospace;
            font-size: 14px;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `
        document.body.appendChild(notification)

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out'
            setTimeout(() => notification.remove(), 300)
        }, 3000)
    }

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            setSaveMenuOpen(false)
        }
    }

    if (!game) return null

    return (
        <div className="emulator">
            <div className="emulator-container">
                <div className="emulator-header">
                    <h1 className="emulator-title">{game.title}</h1>

                    {user && (
                        <div className="save-controls">
                            <button
                                className="save-button"
                                onClick={handleManualSave}
                                disabled={loading}
                                title="Guardar Partida"
                            >
                                💾
                            </button>
                            <button
                                className="load-button"
                                onClick={() => setSaveMenuOpen(!saveMenuOpen)}
                                disabled={loading}
                                title="Cargar/Gestionar Partidas"
                            >
                                📂
                            </button>
                        </div>
                    )}
                </div>

                <div className="emulator-wrapper">
                    <div id="emulator-target"></div>
                </div>
            </div>

            {user && saveMenuOpen && (
                <div className="save-backdrop" onClick={handleOverlayClick}>
                    <div className="save-menu" onClick={(e) => e.stopPropagation()}>
                        <button className="close-save-menu" onClick={() => setSaveMenuOpen(false)}>&times;</button>

                        <h3>Saves</h3>
                        {savedGames.length === 0 ? (
                            <p>No hay partidas guardadas</p>
                        ) : (
                            <div className="saves-list">
                                {savedGames.map((save) => (
                                    <div key={save.id} className="save-item">
                                        <div className="save-info">
                                            <span>Slot {save.save_slot}</span>
                                            <span className="save-date">
                                                {new Date(save.updated_at).toLocaleDateString('es-ES', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        <div className="save-actions">
                                            <button
                                                onClick={() => handleLoadSave(save.save_slot)}
                                                disabled={loading}
                                            >
                                                Cargar
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSave(save.save_slot)}
                                                disabled={loading}
                                                className="delete-btn"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    )
}

export default Emulator