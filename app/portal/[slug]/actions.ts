'use server'

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function salvarLead(formData: FormData) {
  const nome = formData.get('nome') as string;
  const email = formData.get('email') as string;
  const whatsapp = formData.get('whatsapp') as string;
  const cidade = formData.get('cidade') as string;
  const tenant_id = formData.get('tenant_id') as string;
  const slug = formData.get('slug') as string;

  const { error } = await supabase
    .from('hotspot_leads')
    .insert([
      { 
        nome, 
        email, 
        whatsapp, 
        cidade, 
        tenant_id 
      }
    ]);

  if (error) {
    console.error('Erro ao salvar lead:', error.message);
    return { success: false };
  }

  revalidatePath(`/portal/${slug}`);
  revalidatePath('/admin'); // Atualiza o dashboard do gestor na hora
  
  return { success: true };
}