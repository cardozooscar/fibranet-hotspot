import { createClient } from '@supabase/supabase-js';

// Usamos uma string vazia como fallback para o VS Code não reclamar
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Se as variáveis estiverem vazias, o cliente vai dar erro só na hora de usar, 
// mas o VS Code vai ficar em paz.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);