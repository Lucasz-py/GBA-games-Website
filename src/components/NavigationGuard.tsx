// src/components/NavigationGuard.tsx
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const NavigationGuard = () => {
    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        const isEmulatorPage = location.pathname.includes('/emulator/')

        if (isEmulatorPage) {
            // Marcar que estamos en el emulador
            sessionStorage.setItem('wasInEmulator', 'true')

            // Interceptar navegación del navegador (botón atrás/adelante)
            const handlePopState = (e: PopStateEvent) => {
                e.preventDefault()
                console.log('🛑 Navegación interceptada - Limpiando emulador...')

                // Destruir emulador
                try {
                    const emu = (window as any).EJS_emulator || (window as any).EJS_Emulator
                    if (emu && typeof emu.destroy === 'function') {
                        console.log('🎮 Destruyendo emulador...')
                        emu.destroy()
                    }
                } catch (err) {
                    console.warn('Error al destruir:', err)
                }

                // Detener todos los AudioContexts
                try {
                    // @ts-ignore
                    if (window.audioContext) {
                        // @ts-ignore
                        window.audioContext.close()
                    }
                } catch (err) {
                    console.warn('Error al cerrar audio:', err)
                }

                // Limpiar DOM
                const target = document.getElementById('emulator-target')
                if (target) {
                    target.innerHTML = ''
                }

                // Marcar salida
                sessionStorage.setItem('wasInEmulator', 'false')

                // Forzar navegación con recarga
                const targetPath = e.state?.path || '/catalogo'
                window.location.href = targetPath
            }

            window.addEventListener('popstate', handlePopState)

            return () => {
                window.removeEventListener('popstate', handlePopState)
            }
        } else {
            // No estamos en emulador - verificar si venimos de allí
            const wasInEmulator = sessionStorage.getItem('wasInEmulator') === 'true'

            if (wasInEmulator) {
                console.log('🔄 Detectado regreso del emulador - Recargando...')
                sessionStorage.setItem('wasInEmulator', 'false')

                // Pequeño delay para que React Router actualice primero
                setTimeout(() => {
                    window.location.reload()
                }, 50)
            }
        }
    }, [location.pathname])

    return null // Este componente no renderiza nada
}

export default NavigationGuard