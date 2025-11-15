import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthModal from './auth/AuthModal'
import './Header.css'

const Header = () => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { user } = useAuth()
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        if (user && user.user_metadata.avatar_url) {
            setAvatarUrl(user.user_metadata.avatar_url)
        } else {
            setAvatarUrl(null)
        }
    }, [user])

    // Función para navegar con limpieza del emulador
    const handleNavigation = (path: string, e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault()

        // Si estamos en la página del emulador, forzar recarga completa
        if (location.pathname.includes('/emulator/')) {
            console.log('Saliendo del emulador, forzando recarga...')
            window.location.href = path
        } else {
            // Navegación normal con React Router
            navigate(path)
        }
    }

    return (
        <>
            <header className="header">
                <div className="header-container">
                    <div className="logo-container">
                        <a href="/" onClick={(e) => handleNavigation('/', e)}>
                            <img src="/logo2.gif" alt="Logo GBA" className="logo" />
                        </a>
                    </div>

                    <nav className="nav-container">
                        <a
                            href="/"
                            className="nav-link"
                            onClick={(e) => handleNavigation('/', e)}
                        >
                            Home
                        </a>
                        <a
                            href="/catalogo"
                            className="nav-link"
                            onClick={(e) => handleNavigation('/catalogo', e)}
                        >
                            Catalog
                        </a>

                        <button
                            className="account-button"
                            title={user ? `Account: ${user.user_metadata.username || user.email}` : "Login"}
                            onClick={() => setIsModalOpen(true)}
                        >
                            {user ? (
                                <div className="circle user-active">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="header-avatar-img" />
                                    ) : (
                                        user.user_metadata.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'
                                    )}
                                </div>
                            ) : (
                                <div className="circle">
                                    <img src="/nouser.png" alt="Login" />
                                </div>
                            )}
                        </button>
                    </nav>
                </div>
            </header>

            <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    )
}

export default Header