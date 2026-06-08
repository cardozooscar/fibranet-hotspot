'use client'

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { salvarUnidade } from './actions';

export default function FormUnidades() {
  const [loading, setLoading] = useState(false);

  async function handleAction(formData: FormData) {
    setLoading(true);
    const result = await salvarUnidade(formData);
    setLoading(false);

    if (result.success) {
      // Limpa o formulário após o sucesso
      const form = document.getElementById('form-unidade') as HTMLFormElement;
      form?.reset();
    } else {
      alert("Erro ao cadastrar unidade. Verifique se o slug já existe.");
    }
  }

  return (
    <div className="bg-[#0a0f2c] p-8 rounded-[2.5rem] border border-blue-900/20 shadow-2xl h-fit">
      <h2 className="text-xl font-black mb-6 uppercase italic flex items-center text-white">
        <Plus className="mr-2 text-blue-500" size={20} /> Nova Unidade
      </h2>
      
      <form id="form-unidade" action={handleAction} className="space-y-5">
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Nome da Unidade</label>
          <input 
            name="nome" 
            type="text" 
            placeholder="Ex: Filial Centro" 
            required
            className="w-full bg-[#050a1f] border border-blue-900/40 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition-all font-bold text-white placeholder:text-slate-700" 
          />
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">URL Slug (Identificador)</label>
          <input 
            name="slug" 
            type="text" 
            placeholder="ex: filial-centro" 
            required
            className="w-full bg-[#050a1f] border border-blue-900/40 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition-all font-bold text-white placeholder:text-slate-700" 
          />
          <p className="text-[9px] text-slate-600 mt-2 px-1 italic">* A URL será: seusistema.com/portal/slug</p>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Cadastrando...' : 'Cadastrar Ponto'}
        </button>
      </form>
    </div>
  );
}