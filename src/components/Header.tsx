// src/components/layout/Header.tsx
import './Header.css'
// Ya no necesitamos importar Link de react-router-dom

const Header = () => {
    return (
        <header className="header">
            <div className="header-container">
                <div className="logo-container">
                    {/* Usamos <a> para forzar recarga limpia */}
                    <a href="/">
                        <img src="/logo2.gif" alt="Logo GBA" className="logo" />
                    </a>
                </div>

                <nav className="nav-container">
                    {/* Estos enlaces ahora "matarán" el emulador al 100% al hacer clic */}
                    <a href="/" className="nav-link">
                        Home
                    </a>
                    <a href="/catalogo" className="nav-link">
                        Catalog
                    </a>
                    <button className="account-button" title="Cuenta">
                        <div className="circle"></div>
                    </button>
                </nav>
            </div>
        </header>
    )
}

export default Header