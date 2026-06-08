'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, User, Phone, MapPin, BellRing, Wifi } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deletarLead } from './actions';

export default function TableLeads({ initialLeads }: { initialLeads: any[] }) {
  const [notification, setNotification] = useState<string | null>(null);
  const router = useRouter();

  // REALTIME + NOTIFICAÇÃO TOAST
  useEffect(() => {
    const channel = supabase
      .channel('realtime-leads')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'hotspot_leads' },
        (payload) => {
          setNotification(`Novo acesso detectado: ${payload.new.nome}`);
          setTimeout(() => setNotification(null), 5000);
          router.refresh();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [router]);

  // FUNÇÃO PARA DELETAR
  const handleDelete = async (id: string, nome: string) => {
    if (confirm(`Atenção: Deseja remover o registro de ${nome} da base de dados?`)) {
      await deletarLead(id);
      router.refresh();
    }
  };

  return (
    <div className="relative w-full">
      
      {/* NOTIFICAÇÃO FLUTUANTE ESTILO SISTEMA (TOAST) */}
      {notification && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[99] bg-[#1e293b] text-emerald-400 px-6 py-3 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.2)] border border-emerald-500/30 flex items-center space-x-3 animate-in fade-in slide-in-from-top-4">
          <Wifi size={16} className="animate-pulse" />
          <span className="font-bold uppercase text-[10px] tracking-widest">{notification}</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#090e17] text-slate-500 text-[10px] font-bold uppercase tracking-widest border-y border-slate-800">
            <tr>
              <th className="px-6 py-4 font-semibold">Usuário / Contato</th>
              <th className="px-6 py-4 font-semibold">Localização</th>
              <th className="px-6 py-4 text-center font-semibold">Unidade de Acesso</th>
              <th className="px-6 py-4 text-right font-semibold">Registro / Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-sm bg-[#111827]">
            {initialLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-[#1e293b]/50 transition-colors group">
                {/* COLUNA: USUÁRIO */}
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-[#090e17] border border-slate-800 flex items-center justify-center text-slate-500 group-hover:border-blue-500/30 group-hover:text-blue-400 transition-all">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-200 group-hover:text-white transition-colors capitalize tracking-tight">
                        {lead.nome}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium flex items-center mt-0.5 font-mono">
                        <Phone size={10} className="mr-1 opacity-70" /> 
                        {lead.whatsapp}
                      </p>
                    </div>
                  </div>
                </td>

                {/* COLUNA: LOCALIZAÇÃO */}
                <td className="px-6 py-4">
                  <div className="flex items-center text-slate-400 font-medium text-xs">
                    <MapPin size={12} className="mr-2 text-slate-600" />
                    {lead.cidade || 'Não informada'}
                  </div>
                </td>

                {/* COLUNA: UNIDADE */}
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center bg-[#090e17] text-blue-400 border border-slate-800 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 glow-brand"></div>
                    {lead.tenants?.nome || 'Fibranet'}
                  </span>
                </td>

                {/* COLUNA: AÇÕES E DATA */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end space-x-6">
                    <div className="text-right">
                      <p className="text-slate-300 font-medium text-xs font-mono">
                        {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {new Date(lead.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleDelete(lead.id, lead.nome)}
                      className="p-2 text-slate-600 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all border border-transparent hover:border-rose-400/20"
                      title="Remover Registro"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {initialLeads.length === 0 && (
          <div className="py-16 text-center bg-[#111827]">
            <BellRing size={24} className="mx-auto text-slate-700 mb-3" />
            <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.2em]">
              Nenhum registro de acesso encontrado
            </p>
          </div>
        )}
      </div>
    </div>
  );
}