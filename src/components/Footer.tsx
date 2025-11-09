import './Footer.css'

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <p className="footer-text">
                    dev by{' '}
                    <a
                        href="https://github.com/Lucasz-py"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-link"
                    >
                        Lucasz-py
                    </a>
                </p>
            </div>
        </footer>
    )
}

export default Footer