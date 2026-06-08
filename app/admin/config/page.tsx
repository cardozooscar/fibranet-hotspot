import { supabase } from '@/lib/supabase';
import { Settings, User, Palette, ShieldCheck, Wifi } from 'lucide-react';
import FormPerfil from './FormPerfil';
import FormVisual from './FormVisual';

export default async function ConfigPage() {
  // Buscamos o tenant principal (Fibranet) para editar o visual
  const { data: tenant } = await supabase.from('tenants').select('*').single();

  if (!tenant) return <div className="p-8 text-white">Carregando configurações...</div>;

  return (
    <div className="p-4 md:p-8 bg-[#050a1f] min-h-screen text-white">
      {/* HEADER */}
      <header className="mb-10">
        <div className="flex items-center space-x-2 text-blue-500 mb-1">
          <Settings size={14} className="animate-spin-slow" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Configurações do Sistema</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic">
          Ajustes <span className="text-blue-600">Gerais</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* COLUNA 1: PERFIL E SEGURANÇA */}
        <div className="space-y-8">
          <div className="bg-[#0a0f2c] p-8 rounded-[2.5rem] border border-blue-900/20 shadow-2xl">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-3 bg-blue-600/10 text-blue-500 rounded-xl">
                <User size={20} />
              </div>
              <h2 className="text-xl font-black uppercase italic">Perfil Admin</h2>
            </div>
            <FormPerfil />
          </div>

          <div className="bg-gradient-to-br from-blue-900/20 to-transparent p-8 rounded-[2.5rem] border border-blue-900/20 shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <ShieldCheck size={20} className="text-blue-400" />
              <h3 className="text-sm font-black uppercase italic tracking-widest">Segurança</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Sua sessão está protegida por criptografia de ponta a ponta. 
              Mantenha suas credenciais seguras para evitar acessos não autorizados.
            </p>
            <button className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 hover:text-white transition-colors">
              Alterar Senha de Acesso →
            </button>
          </div>
        </div>

        {/* COLUNA 2: CUSTOMIZAÇÃO VISUAL (BRANDING) */}
        <div className="bg-[#0a0f2c] p-8 rounded-[2.5rem] border border-blue-900/20 shadow-2xl">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-3 bg-violet-600/10 text-violet-500 rounded-xl">
              <Palette size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase italic">Visual do Portal</h2>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Personalize a experiência do cliente</p>
            </div>
          </div>
          
          <FormVisual tenant={tenant} />
        </div>

      </div>
    </div>
  );
}