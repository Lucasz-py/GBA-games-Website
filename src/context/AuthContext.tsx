// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../supabase/client'

interface AuthContextType {
    session: Session | null
    user: User | null
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({ session: null, user: null, signOut: async () => { } })

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // 1. Verificar sesión inicial al cargar la página
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        })

        // 2. Escuchar cambios (login, logout) automáticamente
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const signOut = async () => {
        await supabase.auth.signOut()
    }

    return (
        <AuthContext.Provider value={{ session, user, signOut }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

// Hook personalizado para usar el contexto fácilmente
export const useAuth = () => useContext(AuthContext)