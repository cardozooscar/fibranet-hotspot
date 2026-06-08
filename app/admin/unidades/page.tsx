import { supabase } from '@/lib/supabase';
import { Wifi, Globe, ExternalLink } from 'lucide-react';
import FormUnidades from './FormUnidades';
import DeleteUnitButton from './DeleteUnitButton';

export default async function UnidadesPage() {
  // Buscamos as unidades e contamos os leads de cada uma via subquery do Supabase
  const { data: units } = await supabase
    .from('tenants')
    .select(`
      *,
      hotspot_leads (count)
    `)
    .order('nome');

  return (
    <div className="p-4 md:p-8 bg-[#050a1f] min-h-screen text-white">
      {/* HEADER */}
      <header className="mb-10">
        <div className="flex items-center space-x-2 text-blue-500 mb-1">
          <Wifi size={14} className="animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Infraestrutura Fibranet</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic">
          Gestão de <span className="text-blue-600">Unidades</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA: FORMULÁRIO (Componente Cliente) */}
        <FormUnidades />

        {/* COLUNA DIREITA: LISTA DE UNIDADES ATIVAS */}
        <div className="lg:col-span-2 space-y-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-2">
            Pontos de Acesso Ativos ({units?.length || 0})
          </p>

          {units?.map((unit: any) => (
            <div 
              key={unit.id} 
              className="bg-[#0a0f2c] p-6 rounded-[2rem] border border-blue-900/20 flex flex-col sm:flex-row items-center justify-between group hover:border-blue-500/40 transition-all gap-4 shadow-xl"
            >
              <div className="flex items-center space-x-5 w-full sm:w-auto">
                <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                  <Globe size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white group-hover:text-blue-400 transition-colors">
                    {unit.nome}
                  </h3>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                      <ExternalLink size={10} className="mr-1" /> /{unit.slug}
                    </span>
                    <span className="bg-blue-600/20 text-blue-400 px-3 py-0.5 rounded-full text-[9px] font-black uppercase border border-blue-500/10">
                      {unit.hotspot_leads?.[0]?.count || 0} Leads Capturados
                    </span>
                  </div>
                </div>
              </div>

              {/* BOTÕES DE AÇÃO */}
              <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                <a 
                  href={`/portal/${unit.slug}`} 
                  target="_blank" 
                  className="p-3 bg-[#050a1f] border border-blue-900/30 text-slate-400 rounded-xl hover:text-white hover:border-blue-500 transition-all"
                  title="Visualizar Portal"
                >
                  <ExternalLink size={20} />
                </a>
                <DeleteUnitButton id={unit.id} nome={unit.nome} />
              </div>
            </div>
          ))}

          {(!units || units.length === 0) && (
            <div className="p-20 text-center border-2 border-dashed border-blue-900/20 rounded-[2.5rem]">
              <p className="text-slate-600 font-black uppercase text-xs tracking-[0.3em]">
                Nenhum ponto de acesso cadastrado
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}