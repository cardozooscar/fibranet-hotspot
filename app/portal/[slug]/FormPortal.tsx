'use client'

import { salvarLead } from './actions';
import { useState } from 'react';

export default function FormPortal({ tenant, slug }: { tenant: any, slug: string }) {
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await salvarLead(formData);
    setLoading(false);
    
    if (result.success) {
      setEnviado(true);
      // Aqui você pode colocar um redirecionamento após 3 segundos se quiser
      // setTimeout(() => window.location.href = 'https://google.com', 3000);
    }
  }

  if (enviado) {
    return (
      <div className="text-center p-10 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
        <h2 className="text-xl font-bold text-emerald-400 mb-2">Sucesso!</h2>
        <p className="text-slate-400 text-sm">Seus dados foram registrados. Aproveite a conexão!</p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="tenant_id" value={tenant.id} />
      <input type="hidden" name="slug" value={slug} />

      <div className="space-y-3">
        <input name="nome" type="text" placeholder="Nome Completo" required 
          className="w-full bg-[#050a1f] border border-blue-900/50 rounded-xl p-4 text-white placeholder:text-gray-600 outline-none focus:border-blue-500 transition-all" />
        
        <input name="email" type="email" placeholder="E-mail" required 
          className="w-full bg-[#050a1f] border border-blue-900/50 rounded-xl p-4 text-white placeholder:text-gray-600 outline-none focus:border-blue-500 transition-all" />

        <input name="whatsapp" type="tel" placeholder="WhatsApp" required 
          className="w-full bg-[#050a1f] border border-blue-900/50 rounded-xl p-4 text-white placeholder:text-gray-600 outline-none focus:border-blue-500 transition-all" />

        <input name="cidade" type="text" placeholder="Cidade" required 
          className="w-full bg-[#050a1f] border border-blue-900/50 rounded-xl p-4 text-white placeholder:text-gray-600 outline-none focus:border-blue-500 transition-all" />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        style={{ backgroundColor: tenant.config.primary_color }}
        className="w-full text-white font-black py-4 rounded-xl uppercase tracking-widest shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all active:scale-[0.98]"
      >
        {loading ? 'Processando...' : 'Conectar'}
      </button>
    </form>
  );
}