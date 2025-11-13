// src/components/layout/Header.tsx
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import AuthModal from './auth/AuthModal' // Asumiendo que AuthModal está en components/layout/auth
import './Header.css'

const Header = () => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { user } = useAuth()
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

    useEffect(() => {
        if (user && user.user_metadata.avatar_url) {
            setAvatarUrl(user.user_metadata.avatar_url)
        } else {
            setAvatarUrl(null)
        }
    }, [user])

    return (
        <>
            <header className="header">
                <div className="header-container">
                    <div className="logo-container">
                        <a href="/">
                            <img src="/logo2.gif" alt="Logo GBA" className="logo" />
                        </a>
                    </div>

                    <nav className="nav-container">
                        <a href="/" className="nav-link">Home</a>
                        <a href="/catalogo" className="nav-link">Catalog</a>

                        <button
                            className="account-button"
                            title={user ? `Account: ${user.user_metadata.username || user.email}` : "Login"}
                            onClick={() => setIsModalOpen(true)}
                        >
                            {user ? (
                                // --- Vista si está logueado ---
                                <div className="circle user-active">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="header-avatar-img" />
                                    ) : (
                                        user.user_metadata.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'
                                    )}
                                </div>
                            ) : (
                                // --- ARREGLO AQUÍ: Vista si NO está logueado ---
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