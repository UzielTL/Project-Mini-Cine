import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Sala {
  id: number;
  nombre: string;
  capacidad: number;
  tipo: 'pequena' | 'grande';
  precio: number;
  estado: 'disponible' | 'mantenimiento';
  descripcion: string;
  imagen: string;
  amenidades: string[];
  created_at?: string;
}

export interface Reserva {
  id: number;
  sala_id: number;
  sala_nombre?: string;
  cliente: string;
  email?: string;
  telefono?: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  total: number;
  estado: 'confirmada' | 'pendiente' | 'cancelada';
  created_at?: string;
  salas?: { nombre: string };
}
