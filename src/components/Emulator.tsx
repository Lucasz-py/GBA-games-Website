import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { saveService, GameSave } from '../services/saveService'
import './Emulator.css'

// Interfaz actualizada para que TypeScript conozca gameManager
interface IEmulatorInstance {
    destroy?: () => void
    gameManager?: {
        getState: () => ArrayBuffer | null
        loadState: (data: Uint8Array) => void
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
        EJS_emulator?: IEmulatorInstance | null
        EJS_onSaveState?: (data: { state: ArrayBuffer }) => void
        EJS_onLoadState?: () => ArrayBuffer | null
    }
}

// Definimos los slots que mostraremos
const SAVE_SLOTS = [1, 2, 3];

const Emulator = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { user } = useAuth()
    const game = location.state?.game
    const didInitRef = useRef(false)
    const [saveMenuOpen, setSaveMenuOpen] = useState(false)
    const [savedGames, setSavedGames] = useState<GameSave[]>([])
    const [loading, setLoading] = useState(false)

    // Estados para los modales de confirmación
    const [confirmDeleteSlot, setConfirmDeleteSlot] = useState<number | null>(null)
    const [confirmSaveSlot, setConfirmSaveSlot] = useState<number | null>(null)

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

    // Función auxiliar para encontrar la instancia real
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

        // Hook de guardado (corregido para leer data.state)
        window.EJS_onSaveState = (data: { state: ArrayBuffer }) => {
            if (user && game && data.state) {
                console.log(`🎮 Guardado (Hook) detectado, ${data.state.byteLength} bytes. Subiendo...`)
                // El hook siempre guarda en el Slot 1 (Quick Save)
                saveService.saveToCloud(game.id, data.state, 1, game.title)
                    .then(() => {
                        showNotification('✅ Game saved in the cloud (Slot 1)')
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

    // Guardado manual (botón 💾) -> Quick Save Slot 1
    const handleManualSave = async () => {
        const slot = 1;
        if (!user) {
            showNotification('⚠️ Debes iniciar sesión para guardar')
            return
        }

        const emu = getEmuInstance();
        if (!emu || !game) {
            showNotification('❌ Emulator not ready')
            return
        }

        const existingSave = savedGames.find(s => s.save_slot === slot);
        if (existingSave) {
            setConfirmSaveSlot(slot); // Pedir confirmación para sobrescribir
        } else {
            executeSave(slot); // Guardar directamente
        }
    }

    // Manejador para los botones del modal de Saves
    const handleSaveClick = (slot: number) => {
        const existingSave = savedGames.find(s => s.save_slot === slot);
        if (existingSave) {
            setConfirmSaveSlot(slot); // Pedir confirmación
        } else {
            executeSave(slot); // Guardar directamente
        }
    }

    // Función que realmente ejecuta el guardado
    const executeSave = async (slot: number) => {
        const emu = getEmuInstance();
        if (!emu || !game || !user) {
            showNotification('❌ Error: Emulador o usuario no encontrado');
            return;
        }

        setLoading(true)
        try {
            if (emu.gameManager && typeof emu.gameManager.getState === 'function') {
                const saveData = emu.gameManager.getState()
                if (saveData && saveData.byteLength > 0) {
                    await saveService.saveToCloud(game.id, saveData, slot, game.title)
                    showNotification(`✅ Game saved to Slot ${slot}`)
                    await loadSavesList()
                } else {
                    showNotification('❌ The game could not be extracted (0 bytes)')
                }
            } else {
                showNotification('❌ Error: Function (getState) not found')
            }
        } catch (error) {
            showNotification('❌ Error saving')
            console.error(error)
        } finally {
            setLoading(false)
            setConfirmSaveSlot(null)
            setSaveMenuOpen(false)
        }
    }

    // Carga (botón 📂) usa gameManager.loadState
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

                    showNotification(`✅ Game loaded from Slot ${slot}`)
                    setSaveMenuOpen(false)
                } else {
                    showNotification('❌ Error: Function (loadState) not found')
                }
            } else if (!saveData) {
                showNotification('⚠️ No saved game found in this slot')
            } else {
                showNotification('❌ Emulador not ready')
            }
        } catch (error) {
            showNotification('❌ Error loading')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    // Abre el modal de confirmación de borrado
    const handleDeleteSave = async (slot: number = 1) => {
        if (!user || !game) return
        setConfirmDeleteSlot(slot);
    }

    // Ejecuta el borrado
    const executeDelete = async () => {
        if (confirmDeleteSlot === null) return;

        setLoading(true)
        try {
            await saveService.deleteSave(game.id, confirmDeleteSlot)
            showNotification(`🗑️ Game deleted from Slot ${confirmDeleteSlot}`)
            await loadSavesList()
        } catch (error) {
            showNotification('❌ Error deleting')
            console.error(error)
        } finally {
            setLoading(false)
            setConfirmDeleteSlot(null)
        }
    }

    // Muestra notificaciones
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

    // Cierra modales al hacer clic en el fondo
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            setSaveMenuOpen(false);
            setConfirmDeleteSlot(null);
            setConfirmSaveSlot(null);
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
                                title="Quick Save (Slot 1)"
                            >
                                💾
                            </button>
                            <button
                                className="load-button"
                                onClick={() => setSaveMenuOpen(true)}
                                disabled={loading}
                                title="Load/Manage Cloud Saves"
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

            {/* Tarjeta de "Inicie Sesión" (Solo si NO hay usuario) */}
            {!user && (
                <div className="login-prompt-card">
                    <p>Login to save your game to the cloud☁️</p>
                </div>
            )}

            {/* Modal de Saves (Solo si hay usuario) */}
            {user && saveMenuOpen && (
                <div className="save-backdrop" onClick={handleOverlayClick}>
                    <div className="save-menu" onClick={(e) => e.stopPropagation()}>
                        <button className="close-save-menu" onClick={() => setSaveMenuOpen(false)}>&times;</button>
                        <h3>Cloud Saves</h3>

                        <div className="saves-list">
                            {SAVE_SLOTS.map((slotNumber) => {
                                const save = savedGames.find(s => s.save_slot === slotNumber);

                                return (
                                    <div key={slotNumber} className={`save-item ${!save ? 'empty-slot' : ''}`}>
                                        <div className="save-info">
                                            <span>Slot {slotNumber}</span>
                                            <span className="save-date">
                                                {save && save.updated_at
                                                    ? new Date(save.updated_at).toLocaleString('es-ES', {
                                                        day: '2-digit', month: '2-digit', year: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })
                                                    : '--- Empty ---'
                                                }
                                            </span>
                                        </div>
                                        <div className="save-actions">
                                            {save ? (
                                                <>
                                                    <button
                                                        onClick={() => handleLoadSave(save.save_slot)}
                                                        disabled={loading}
                                                    >
                                                        Load
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteSave(save.save_slot)}
                                                        disabled={loading}
                                                        className="delete-btn"
                                                    >
                                                        🗑️
                                                    </button>
                                                    <button
                                                        onClick={() => handleSaveClick(save.save_slot)}
                                                        disabled={loading}
                                                        className="save-overwrite-btn"
                                                        title="Overwrite this slot"
                                                    >
                                                        Overwrite
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => handleSaveClick(slotNumber)}
                                                    disabled={loading}
                                                    className="save-new-btn"
                                                >
                                                    Save Here
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación de BORRADO */}
            {user && confirmDeleteSlot !== null && (
                <div className="save-backdrop" onClick={() => setConfirmDeleteSlot(null)}>
                    <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <h3 className="confirm-title">Are you sure?</h3>
                        <p>
                            This action will permanently delete the save in Slot {confirmDeleteSlot}.
                            This cannot be undone.
                        </p>
                        <div className="confirm-actions">
                            <button
                                onClick={() => setConfirmDeleteSlot(null)}
                                className="confirm-btn cancel-btn"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeDelete}
                                className="confirm-btn delete-btn"
                                disabled={loading}
                            >
                                {loading ? "Deleting..." : "Yes, Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación de SOBRESCRITURA */}
            {user && confirmSaveSlot !== null && (
                <div className="save-backdrop" onClick={() => setConfirmSaveSlot(null)}>
                    <div className="confirm-modal save" onClick={(e) => e.stopPropagation()}>
                        <h3 className="confirm-title save">Overwrite Save?</h3>
                        <p>
                            A save file already exists in Slot {confirmSaveSlot}.
                            Do you want to overwrite it?
                        </p>
                        <div className="confirm-actions">
                            <button
                                onClick={() => setConfirmSaveSlot(null)}
                                className="confirm-btn cancel-btn"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => executeSave(confirmSaveSlot)}
                                className="confirm-btn save-btn"
                                disabled={loading}
                            >
                                {loading ? "Saving..." : "Yes, Overwrite"}
                            </button>
                        </div>
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