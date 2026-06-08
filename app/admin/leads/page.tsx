import { supabase } from '@/lib/supabase';
import { Users, Search, Download, Filter } from 'lucide-react';
import TableLeads from '../TableLeads'; // Reaproveitando o componente inteligente que já criamos

export default async function LeadsMasterPage() {
  // Buscamos todos os leads com as informações das unidades (tenants)
  const { data: allLeads } = await supabase
    .from('hotspot_leads')
    .select('*, tenants(nome)')
    .order('created_at', { ascending: false });

  return (
    <div className="p-4 md:p-8 bg-[#050a1f] min-h-screen text-white">
      {/* Header com a mesma identidade */}
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-blue-500 mb-1">
            <Users size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Data Intelligence</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">
            Base de <span className="text-blue-600">Leads</span>
          </h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">
            Gestão completa de usuários capturados
          </p>
        </div>

        {/* Quick Stats de Leads */}
        <div className="flex space-x-4">
          <div className="bg-[#0a0f2c] border border-blue-900/20 px-6 py-3 rounded-[1.5rem] shadow-xl">
             <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Total na Base</p>
             <p className="text-2xl font-black text-blue-500 tracking-tighter italic">{allLeads?.length || 0}</p>
          </div>
        </div>
      </header>

      {/* O componente TableLeads que você já tem no admin agora assume a tela toda aqui */}
      <div className="w-full">
        <TableLeads initialLeads={allLeads || []} />
      </div>

      <div className="mt-8 bg-blue-600/5 border border-blue-900/20 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-600 rounded-xl">
            <Filter size={20} />
          </div>
          <div>
            <p className="text-sm font-black uppercase italic">Dica de Marketing</p>
            <p className="text-xs text-slate-500">Use o botão de exportar para alimentar sua ferramenta de disparo de WhatsApp ou E-mail.</p>
          </div>
        </div>
        <button className="text-[10px] font-black uppercase tracking-[0.2em] bg-white text-black px-6 py-3 rounded-xl hover:bg-blue-500 hover:text-white transition-all">
          Sincronizar com CRM
        </button>
      </div>
    </div>
  );
}