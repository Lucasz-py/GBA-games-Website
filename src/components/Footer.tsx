import './Footer.css'

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <p className="footer-text">
                    Dev by{' '}
                    <a
                        href="https://github.com/Lucasz-py"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-link"
                    >
                        Lucasz-py
                    </a>
                    {' & Emulator: '}
                    <a
                        href="https://github.com/EmulatorJS/EmulatorJS"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-link"
                    >
                        EmulatorJS
                    </a>
                </p>
            </div>
        </footer>
    )
}

export default Footer