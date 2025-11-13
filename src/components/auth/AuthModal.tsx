import { useState, useEffect } from 'react'
import { supabase } from '../../supabase/client'
import { useAuth } from '../../context/AuthContext'
import './AuthModal.css'

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
    const { user, signOut } = useAuth()
    const [isLoginView, setIsLoginView] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // --- ESTADOS SEPARADOS PARA MENSAJES ---
    const [profileSuccessMsg, setProfileSuccessMsg] = useState('') // Para la subida de avatar
    const [authSuccessMsg, setAuthSuccessMsg] = useState('') // Para el registro

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

    useEffect(() => {
        if (user && user.user_metadata.avatar_url) {
            setAvatarUrl(user.user_metadata.avatar_url)
        } else {
            setAvatarUrl(null)
        }
    }, [user])

    // Limpiar estados al abrir/cerrar
    useEffect(() => {
        if (isOpen) {
            setError('')
            setAuthSuccessMsg('')
            setProfileSuccessMsg('')
            setEmail('')
            setPassword('')
            setUsername('')
            setIsLoginView(true) // Siempre empezar en Login
        }
    }, [isOpen])

    // Limpiar mensajes al cambiar entre Login/Registro
    useEffect(() => {
        setError('')
        setAuthSuccessMsg('')
    }, [isLoginView])


    if (!isOpen) return null

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setAuthSuccessMsg('')

        try {
            if (isLoginView) {
                // --- LOGIN ---
                const { error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) throw error
                onClose() // Cerrar al loguear
            } else {
                // --- SIGN UP (REGISTRO) ---
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { username: username, avatar_url: null } }
                })
                if (error) throw error

                // --- ¡CAMBIO AQUÍ! ---
                // Mostramos el mensaje de éxito y cerramos el modal después de un tiempo
                setAuthSuccessMsg(`Account created! We sent a confirmation email to ${email}.`)

                setTimeout(() => {
                    onClose() // Cierra el modal automáticamente
                }, 4000) // 4 segundos para leer el mensaje
            }
        } catch (err: any) {
            setError(err.message || 'Authentication error')
        } finally {
            setLoading(false)
        }
    }

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        // ... (Esta función no cambia, sigue igual que antes)
        if (!user) return
        const file = event.target.files?.[0]
        if (!file) return
        setLoading(true)
        setError('')
        setProfileSuccessMsg('')
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}.${fileExt}`
            const filePath = `${fileName}`
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true })
            if (uploadError) throw uploadError
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)
            const newAvatarUrl = `${publicUrl}?t=${new Date().getTime()}`
            const { error: updateError } = await supabase.auth.updateUser({
                data: { avatar_url: newAvatarUrl }
            })
            if (updateError) throw updateError
            setAvatarUrl(newAvatarUrl)
            setProfileSuccessMsg('Profile picture updated!')
            setTimeout(() => setProfileSuccessMsg(''), 3000)
        } catch (err: any) {
            setError(err.message || 'Error uploading image')
        } finally {
            setLoading(false)
        }
    }

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }

    return (
        <div className="auth-backdrop" onClick={handleOverlayClick}>
            <div className="auth-modal">
                <button className="close-button" onClick={onClose}>&times;</button>

                {user ? (
                    // --- VISTA DE PERFIL ---
                    <div className="profile-container">
                        <label htmlFor="avatar-upload" className="profile-avatar-large">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="profile-avatar-img" />
                            ) : (
                                <span>{user.user_metadata.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}</span>
                            )}
                            <div className="avatar-overlay"></div>
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                disabled={loading}
                                style={{ display: 'none' }}
                            />
                        </label>
                        {loading && <p style={{ color: '#8a5cff' }}>Uploading image...</p>}
                        <h2 className="profile-username">
                            {user.user_metadata.username || 'Usuario'}
                        </h2>
                        <p className="profile-email">{user.email}</p>
                        {error && <p className="error-message">{error}</p>}
                        {profileSuccessMsg && <p className="success-message">{profileSuccessMsg}</p>}
                        <button className="logout-button" onClick={() => { signOut(); onClose(); }}>
                            Log Out
                        </button>
                    </div>
                ) : (
                    // --- VISTA DE LOGIN/REGISTRO ---
                    <>
                        {/* --- ARREGLO: VISTA DE ÉXITO O FORMULARIO --- */}
                        {authSuccessMsg ? (
                            // Muestra solo el mensaje de éxito
                            <>
                                <h2 className="auth-title">Check your email!</h2>
                                <p className="success-message" style={{ textAlign: 'center', lineHeight: 1.6 }}>
                                    {authSuccessMsg}
                                </p>
                            </>
                        ) : (
                            // Muestra el formulario normal
                            <>
                                <h2 className="auth-title">{isLoginView ? 'Login' : 'Create account'}</h2>
                                {error && <p className="error-message">{error}</p>}
                                <form className="auth-form" onSubmit={handleAuth}>
                                    {!isLoginView && (
                                        <input
                                            type="text" placeholder="User name" className="auth-input"
                                            value={username} onChange={(e) => setUsername(e.target.value)} required={!isLoginView}
                                        />
                                    )}
                                    <input
                                        type="email" placeholder="Email" className="auth-input"
                                        value={email} onChange={(e) => setEmail(e.target.value)} required
                                    />
                                    <input
                                        type="password" placeholder="Password" className="auth-input"
                                        value={password} onChange={(e) => setPassword(e.target.value)} required
                                    />
                                    <button type="submit" className="auth-submit" disabled={loading}>
                                        {loading ? 'Loading...' : (isLoginView ? 'ENTER' : 'REGISTER')}
                                    </button>
                                </form>
                                <p className="auth-toggle">
                                    {isLoginView ? 'Don´t have an account?' : 'Do you already have an account?'}
                                    <span onClick={() => setIsLoginView(!isLoginView)}>
                                        {isLoginView ? 'Register' : 'Login'}
                                    </span>
                                </p>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default AuthModal