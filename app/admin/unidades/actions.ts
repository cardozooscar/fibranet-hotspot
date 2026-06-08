'use server'

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function salvarUnidade(formData: FormData) {
  const nome = formData.get('nome') as string;
  const slug = formData.get('slug') as string;

  const { error } = await supabase
    .from('tenants')
    .insert([{ 
      nome, 
      slug, 
      config: { 
        primary_color: '#2563eb', 
        welcome_text: 'Bem-vindo ao Wi-Fi',
        logo_url: '' 
      } 
    }]);

  if (error) return { success: false };

  revalidatePath('/admin/unidades');
  return { success: true };
}

export async function deletarUnidade(id: string) {
  const { error } = await supabase.from('tenants').delete().eq('id', id);
  if (error) return { success: false };
  revalidatePath('/admin/unidades');
  return { success: true };
}