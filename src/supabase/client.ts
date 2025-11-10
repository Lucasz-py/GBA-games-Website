// src/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wktkjqsfvirpdtflpacf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrdGtqcXNmdmlycGR0ZmxwYWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MDU1OTgsImV4cCI6MjA3ODM4MTU5OH0.tGmtqYzyhcTgDvAmv0sBUj9ro43eXn9Vv8D0bWHbe4E'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)