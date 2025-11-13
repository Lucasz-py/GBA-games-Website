import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { saveService } from '../services/saveService'
import './Emulator.css'

// 1. Interfaz actualizada para que TypeScript conozca gameManager
interface IEmulatorInstance {
    destroy?: () => void
    gameManager?: {
        getState: () => ArrayBuffer | null
        loadState: (data: Uint8Array) => void // Acepta Uint8Array
    }
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
        EJS_emulator?: IEmulatorInstance | null // La instancia real (minúscula)
        EJS_onSaveState?: (data: { state: ArrayBuffer }) => void
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

    // 2. Función auxiliar para encontrar la instancia real (EJS_emulator)
    const getEmuInstance = (): IEmulatorInstance | null => {
        const emu = (window as any).EJS_emulator || window.EJS_Emulator
        if (emu && emu.gameManager) {
            return emu;
        }
        return null;
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

        // 3. Hook de guardado (corregido para leer data.state)
        window.EJS_onSaveState = (data: { state: ArrayBuffer }) => {
            if (user && game && data.state) {
                console.log(`🎮 Guardado (Hook) detectado, ${data.state.byteLength} bytes. Subiendo...`)
                saveService.saveToCloud(game.id, data.state, 1, game.title)
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
                const emu = getEmuInstance()
                if (emu && typeof emu.destroy === 'function') {
                    emu.destroy()
                }
            } catch (e) {
                console.warn(e)
            }
            window.EJS_Emulator = null
                ; (window as any).EJS_emulator = null
        }
    }, [game, navigate, user])

    // 4. Guardado manual (botón 💾) usa gameManager.getState
    const handleManualSave = async () => {
        if (!user) {
            showNotification('⚠️ Debes iniciar sesion para guardar')
            return
        }

        const emu = getEmuInstance();

        if (!emu || !game) {
            showNotification('❌ Emulador no listo')
            return
        }

        setLoading(true)
        try {
            if (emu.gameManager && typeof emu.gameManager.getState === 'function') {
                const saveData = emu.gameManager.getState()
                if (saveData && saveData.byteLength > 0) {
                    await saveService.saveToCloud(game.id, saveData, 1, game.title)
                    showNotification('✅ Partida guardada correctamente')
                    await loadSavesList()
                } else {
                    showNotification('❌ No se pudo extraer la partida (0 bytes)')
                }
            } else {
                showNotification('❌ Error: Función (getState) no encontrada')
            }
        } catch (error) {
            showNotification('❌ Error al guardar')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    // 5. Carga (botón 📂) usa gameManager.loadState
    const handleLoadSave = async (slot: number = 1) => {
        if (!user || !game) return

        setLoading(true)
        try {
            const saveData = await saveService.loadFromCloud(game.id, slot)
            const emu = getEmuInstance();

            if (saveData && emu) {
                if (emu.gameManager && typeof emu.gameManager.loadState === 'function') {
                    const uint8Array = new Uint8Array(saveData);
                    emu.gameManager.loadState(uint8Array);

                    showNotification('✅ Partida cargada')
                    setSaveMenuOpen(false)
                } else {
                    showNotification('❌ Error: Función (loadState) no encontrada')
                }
            } else if (!saveData) {
                showNotification('⚠️ No se encontró partida guardada')
            } else {
                showNotification('❌ Emulador no listo')
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
            setSaveMenuOpen(false);
        }
    }

    if (!game) return null

    return (
        <div className="emulator">
            <div className="emulator-container">
                <div className="emulator-header">
                    <h1 className="emulator-title">{game.title}</h1>

                    {/* Muestra los botones 💾 y 📂 solo si el usuario está logueado */}
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
                                onClick={() => setSaveMenuOpen(true)}
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

            {/* --- 6. TARJETA DE AVISO (Solo si NO hay usuario) --- */}
            {!user && (
                <div className="login-prompt-card">
                    <p>Login to save your game to the cloud😉</p>
                </div>
            )}

            {/* Modal de Saves (Solo si hay usuario) */}
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
                                                    day: '2-digit', month: '2-digit', year: '2-digit',
                                                    hour: '2-digit', minute: '2-digit'
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
                    from { transform: translateX(400px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(400px); opacity: 0; }
                }
            `}</style>
        </div>
    )
}

export default Emulator