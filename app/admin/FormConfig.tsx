'use client'

import { atualizarConfiguracoes } from './actions';
import { useState } from 'react';

export default function FormConfig({ tenant }: { tenant: any }) {
  const [loading, setLoading] = useState(false);

  async function handleAction(formData: FormData) {
    setLoading(true);
    const result = await atualizarConfiguracoes(formData);
    setLoading(false);

    if (result.success) {
      alert("Configurações atualizadas com sucesso! O portal já deve estar com a cara nova.");
    } else {
      alert("Erro ao salvar. Verifique se a logo não é muito grande.");
    }
  }

  return (
    <form action={handleAction} className="space-y-6">
      <input type="hidden" name="tenant_id" value={tenant.id} />
      <input type="hidden" name="current_logo_url" value={tenant.config.logo_url} />

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase">Nome da Unidade</label>
          <input name="nome" type="text" defaultValue={tenant.nome} required
            className="w-full mt-1 border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800" />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase">Texto de Boas-vindas</label>
          <input name="welcome_text" type="text" defaultValue={tenant.config.welcome_text} required
            className="w-full mt-1 border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center space-y-6 md:space-y-0 md:space-x-6">
          <div className="flex-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Cor do Botão</label>
            <div className="flex items-center mt-1 space-x-3">
              <input name="primary_color" type="color" defaultValue={tenant.config.primary_color}
                className="h-10 w-10 border-none rounded cursor-pointer" />
              <span className="text-sm text-slate-500 font-mono font-bold">{tenant.config.primary_color}</span>
            </div>
          </div>

          <div className="flex-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Trocar Logo</label>
            <input name="logo" type="file" accept="image/*"
              className="w-full mt-1 text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>
        </div>
      </div>

      <button 
        type="submit"
        disabled={loading}
        className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all uppercase tracking-widest mt-4 disabled:opacity-50"
      >
        {loading ? 'Salvando Alterações...' : 'Salvar Configurações'}
      </button>
    </form>
  );
}