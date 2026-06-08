'use client'

import { useState } from 'react';
import { atualizarConfiguracoes } from '../actions';
import { ImageIcon, CheckCircle2 } from 'lucide-react';

export default function FormVisual({ tenant }: { tenant: any }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleAction(formData: FormData) {
    setLoading(true);
    const result = await atualizarConfiguracoes(formData);
    setLoading(false);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(null), 3000);
    }
  }

  return (
    <form action={handleAction} className="space-y-6">
      <input type="hidden" name="tenant_id" value={tenant.id} />
      <input type="hidden" name="current_logo_url" value={tenant.config.logo_url} />

      <div className="space-y-6">
        {/* Preview da Logo Atual */}
        <div className="flex flex-col items-center p-6 bg-[#050a1f] rounded-3xl border border-dashed border-blue-900/30">
          {tenant.config.logo_url ? (
            <img src={tenant.config.logo_url} alt="Logo" className="h-12 w-auto mb-4" />
          ) : (
            <ImageIcon size={40} className="text-slate-800 mb-4" />
          )}
          <label className="cursor-pointer bg-blue-600/10 text-blue-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
            Trocar Logomarca
            <input name="logo" type="file" className="hidden" accept="image/*" />
          </label>
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Texto de Boas-vindas</label>
          <input name="welcome_text" type="text" defaultValue={tenant.config.welcome_text}
            className="w-full bg-[#050a1f] border border-blue-900/40 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition-all font-bold text-white" />
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Cor de Destaque (Botões)</label>
          <div className="flex items-center space-x-4 mt-2">
            <input name="primary_color" type="color" defaultValue={tenant.config.primary_color}
              className="h-12 w-20 bg-transparent border-none cursor-pointer" />
            <span className="text-xs font-mono font-black text-blue-400 uppercase">{tenant.config.primary_color}</span>
          </div>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className={`w-full font-black py-4 rounded-2xl uppercase tracking-widest transition-all flex items-center justify-center space-x-2 ${
          success ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
        }`}
      >
        {loading ? 'Processando...' : success ? (
          <>
            <CheckCircle2 size={18} />
            <span>Atualizado!</span>
          </>
        ) : 'Salvar Identidade'}
      </button>
    </form>
  );
}