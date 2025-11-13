// src/services/saveService.ts
import { supabase } from '../supabase/client'

export interface GameSave {
    id?: string
    user_id?: string
    game_id: string
    save_slot: number
    save_data?: string
    save_metadata?: {
        game_name: string
        timestamp: string
        size?: number
    }
    created_at?: string
    updated_at?: string
}

class SaveService {
    // Guardar partida en Supabase
    async saveToCloud(gameId: string, saveData: ArrayBuffer, slot: number = 1, gameName: string): Promise<boolean> {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Usuario no autenticado')

            console.log('💾 [SaveService] Guardando', saveData.byteLength, 'bytes')

            // Convertir ArrayBuffer a array de números
            const uint8Array = new Uint8Array(saveData)
            const dataArray = Array.from(uint8Array)

            console.log('💾 [SaveService] Array length:', dataArray.length)

            const saveRecord = {
                user_id: user.id,
                game_id: gameId,
                save_slot: slot,
                save_data: JSON.stringify(dataArray), // Guardamos el array como JSON string
                save_metadata: {
                    game_name: gameName,
                    timestamp: new Date().toISOString(),
                    size: saveData.byteLength
                },
                updated_at: new Date().toISOString()
            }

            const { error, data } = await supabase
                .from('game_saves')
                .upsert(saveRecord, {
                    onConflict: 'user_id,game_id,save_slot'
                })
                .select()

            if (error) {
                console.error('❌ [SaveService] Error de Supabase:', error)
                throw error
            }

            console.log('✅ [SaveService] Guardado exitoso en Supabase')
            console.log('📊 [SaveService] Datos guardados:', data)
            return true
        } catch (error) {
            console.error('❌ [SaveService] Error al guardar:', error)
            return false
        }
    }

    // Cargar partida desde Supabase
    async loadFromCloud(gameId: string, slot: number = 1): Promise<ArrayBuffer | null> {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Usuario no autenticado')

            console.log('📂 [SaveService] Buscando partida para:', gameId, 'slot:', slot)

            const { data, error } = await supabase
                .from('game_saves')
                .select('save_data, save_metadata')
                .eq('user_id', user.id)
                .eq('game_id', gameId)
                .eq('save_slot', slot)
                .single()

            if (error) {
                console.error('❌ [SaveService] Error al buscar:', error)
                throw error
            }

            if (!data) {
                console.log('⚠️ [SaveService] No se encontró partida guardada')
                return null
            }

            console.log('📂 [SaveService] Datos encontrados')
            console.log('📊 [SaveService] Metadata:', data.save_metadata)

            // Parsear el JSON string de vuelta a array
            const dataArray = JSON.parse(data.save_data)
            console.log('📂 [SaveService] Array parseado, length:', dataArray.length)

            // Convertir array a Uint8Array y luego a ArrayBuffer
            const uint8Array = new Uint8Array(dataArray)
            const arrayBuffer = uint8Array.buffer

            console.log('✅ [SaveService] ArrayBuffer reconstruido:', arrayBuffer.byteLength, 'bytes')
            return arrayBuffer
        } catch (error) {
            console.error('❌ [SaveService] Error al cargar:', error)
            return null
        }
    }

    // Listar todas las partidas guardadas de un usuario
    async listUserSaves(gameId?: string): Promise<GameSave[]> {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return []

            let query = supabase
                .from('game_saves')
                .select('id, game_id, save_slot, save_metadata, created_at, updated_at')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false })

            if (gameId) {
                query = query.eq('game_id', gameId)
            }

            const { data, error } = await query

            if (error) throw error
            return data || []
        } catch (error) {
            console.error('Error al listar partidas:', error)
            return []
        }
    }

    // Eliminar partida
    async deleteSave(gameId: string, slot: number = 1): Promise<boolean> {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Usuario no autenticado')

            const { error } = await supabase
                .from('game_saves')
                .delete()
                .eq('user_id', user.id)
                .eq('game_id', gameId)
                .eq('save_slot', slot)

            if (error) throw error
            return true
        } catch (error) {
            console.error('Error al eliminar partida:', error)
            return false
        }
    }

    // Exportar partida para descargar
    async exportSave(gameId: string, slot: number = 1): Promise<void> {
        try {
            const saveData = await this.loadFromCloud(gameId, slot)
            if (!saveData) {
                alert('No se encontró la partida guardada')
                return
            }

            const blob = new Blob([saveData])
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${gameId}_slot${slot}.sav`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Error al exportar partida:', error)
        }
    }
}

export const saveService = new SaveService()