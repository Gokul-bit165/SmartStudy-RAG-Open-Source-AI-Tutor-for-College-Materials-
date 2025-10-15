// frontend/src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ryauksaugbicstbbxvdz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5YXVrc2F1Z2JpY3N0YmJ4dmR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNDczNzIsImV4cCI6MjA3NTkyMzM3Mn0.nnJQwFC653fT1XYMaIYGtAO3l6Sfr4pOph8GKAYi_UM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)