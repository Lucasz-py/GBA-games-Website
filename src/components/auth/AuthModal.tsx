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
    // Nuevo estado para mensaje de éxito temporal
    const [successMsg, setSuccessMsg] = useState('')

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

    // Limpiar mensajes al abrir/cerrar
    useEffect(() => {
        if (isOpen) {
            setError('')
            setSuccessMsg('')
        }
    }, [isOpen])

    if (!isOpen) return null

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            if (isLoginView) {
                const { error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) throw error
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { username: username, avatar_url: null } }
                })
                if (error) throw error
            }
            onClose()
        } catch (err: any) {
            setError(err.message || 'Error en la autenticacion')
        } finally {
            setLoading(false)
        }
    }

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!user) return
        const file = event.target.files?.[0]
        if (!file) return

        setLoading(true)
        setError('')
        setSuccessMsg('') // Limpiar mensaje anterior

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

            // Truco para forzar que el navegador recargue la imagen si tiene el mismo nombre
            // Añadimos un timestamp ?t=... al final de la URL
            const newAvatarUrl = `${publicUrl}?t=${new Date().getTime()}`

            const { error: updateError } = await supabase.auth.updateUser({
                data: { avatar_url: newAvatarUrl }
            })

            if (updateError) throw updateError

            setAvatarUrl(newAvatarUrl)
            // EN LUGAR DE ALERT, USAMOS EL ESTADO PARA MOSTRAR UN MENSAJE BONITO
            setSuccessMsg('¡Foto de perfil actualizada!')

            // Opcional: limpiar el mensaje después de 3 segundos
            setTimeout(() => setSuccessMsg(''), 3000)

        } catch (err: any) {
            setError(err.message || 'Error al subir imagen')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="auth-modal">
                <button className="close-button" onClick={onClose}>&times;</button>

                {user ? (
                    <div className="profile-container">
                        {/* Label que actúa como boton de upload */}
                        <label htmlFor="avatar-upload" className="profile-avatar-large">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="profile-avatar-img" />
                            ) : (
                                <span>{user.user_metadata.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}</span>
                            )}

                            {/* Capa negra con el lápiz (aparece en hover gracias al CSS) */}
                            <div className="avatar-overlay"></div>

                            {/* Input invisible */}
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                disabled={loading}
                                style={{ display: 'none' }}
                            />
                        </label>

                        {loading && <p style={{ color: '#8a5cff' }}>Subiendo imagen...</p>}

                        <h2 className="profile-username">
                            {user.user_metadata.username || 'Usuario'}
                        </h2>
                        <p className="profile-email">{user.email}</p>

                        {error && <p className="error-message">{error}</p>}

                        <button className="logout-button" onClick={() => { signOut(); onClose(); }}>
                            Cerrar Sesion
                        </button>

                        {/* Mensaje de éxito flotante */}
                        {successMsg && <div className="success-message">{successMsg}</div>}
                    </div>
                ) : (
                    <>
                        <h2 className="auth-title">{isLoginView ? 'Iniciar Sesion' : 'Crear Cuenta'}</h2>
                        {error && <p className="error-message">{error}</p>}
                        <form className="auth-form" onSubmit={handleAuth}>
                            {!isLoginView && (
                                <input
                                    type="text" placeholder="Nombre de usuario" className="auth-input"
                                    value={username} onChange={(e) => setUsername(e.target.value)} required={!isLoginView}
                                />
                            )}
                            <input
                                type="email" placeholder="Correo electronico" className="auth-input"
                                value={email} onChange={(e) => setEmail(e.target.value)} required
                            />
                            <input
                                type="password" placeholder="Contraseña" className="auth-input"
                                value={password} onChange={(e) => setPassword(e.target.value)} required
                            />
                            <button type="submit" className="auth-submit" disabled={loading}>
                                {loading ? 'Cargando...' : (isLoginView ? 'ENTRAR' : 'REGISTRARSE')}
                            </button>
                        </form>
                        <p className="auth-toggle">
                            {isLoginView ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                            <span onClick={() => setIsLoginView(!isLoginView)}>
                                {isLoginView ? 'Regístrate' : 'Inicia sesion'}
                            </span>
                        </p>
                    </>
                )}
            </div>
        </div>
    )
}

export default AuthModal