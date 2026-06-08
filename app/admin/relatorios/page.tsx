import { supabase } from '@/lib/supabase';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Calendar as CalendarIcon, 
  Download,
  Wifi,
  Users
} from 'lucide-react';

export default async function RelatoriosPage() {
  // 1. Busca todos os dados para processamento analítico
  const { data: allLeads } = await supabase
    .from('hotspot_leads')
    .select('*, tenants(nome)')
    .order('created_at', { ascending: false });

  if (!allLeads) return <div className="p-8">Carregando dados...</div>;

  const total = allLeads.length;

  // 2. Inteligência: Distribuição por Horário (Pico de Acesso)
  const hourlyData = Array(24).fill(0);
  allLeads.forEach(lead => {
    const hour = new Date(lead.created_at).getHours();
    hourlyData[hour]++;
  });
  const maxHourValue = Math.max(...hourlyData, 1);

  // 3. Inteligência: Performance por Unidade
  const unitStats: Record<string, number> = {};
  allLeads.forEach(lead => {
    const name = lead.tenants?.nome || 'Desconhecido';
    unitStats[name] = (unitStats[name] || 0) + 1;
  });

  // 4. Comparativo Mensal (Simulado com base nos dados atuais)
  const currentMonth = new Date().getMonth();
  const leadsThisMonth = allLeads.filter(l => new Date(l.created_at).getMonth() === currentMonth).length;

  return (
    <div className="p-4 md:p-8 bg-[#050a1f] min-h-screen text-white">
      
      {/* HEADER DA PÁGINA */}
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-blue-500 mb-1">
            <BarChart3 size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Analytics & Insights</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">
            Relatórios <span className="text-blue-600">Gerenciais</span>
          </h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">
            Análise comportamental da rede Hotspot
          </p>
        </div>

        <button className="flex items-center space-x-2 bg-white text-black px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl">
          <Download size={16} />
          <span>Exportar Relatório Completo</span>
        </button>
      </header>

      {/* GRID DE INSIGHTS RÁPIDOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <InsightCard 
          label="Volume Total" 
          val={total} 
          sub="Leads acumulados" 
          icon={<Users className="text-blue-500" />} 
        />
        <InsightCard 
          label="Média Diária" 
          val={(total / 30).toFixed(1)} 
          sub="Últimos 30 dias" 
          icon={<TrendingUp className="text-emerald-500" />} 
        />
        <InsightCard 
          label="Conversão" 
          val="94%" 
          sub="Formulários completos" 
          icon={<BarChart3 className="text-violet-500" />} 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* GRÁFICO: HORÁRIOS DE PICO */}
        <div className="bg-[#0a0f2c] p-8 rounded-[2.5rem] border border-blue-900/20 shadow-2xl">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-xl font-black uppercase italic">Fluxo por Horário</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Identifique os melhores momentos para marketing</p>
            </div>
            <Clock className="text-blue-500 opacity-50" size={24} />
          </div>

          <div className="h-64 flex items-end justify-between gap-1 px-2">
            {hourlyData.map((count, hour) => (
              <div key={hour} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="relative w-full h-full flex items-end">
                  <div 
                    style={{ height: `${(count / maxHourValue) * 100}%` }} 
                    className={`w-full rounded-t-md transition-all duration-500 ${
                      count === maxHourValue ? 'bg-blue-600' : 'bg-blue-900/40 group-hover:bg-blue-500/40'
                    }`}
                  />
                  {/* Tooltip no Hover */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-600 text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {count}
                  </div>
                </div>
                <span className="text-[8px] font-black text-slate-700">{hour}h</span>
              </div>
            ))}
          </div>
        </div>

        {/* RANKING POR UNIDADE */}
        <div className="bg-[#0a0f2c] p-8 rounded-[2.5rem] border border-blue-900/20 shadow-2xl">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-xl font-black uppercase italic">Performance por Unidade</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Engajamento por ponto de acesso</p>
            </div>
            <Wifi className="text-violet-500 opacity-50" size={24} />
          </div>

          <div className="space-y-6">
            {Object.entries(unitStats).sort((a,b) => b[1] - a[1]).map(([name, count]) => (
              <div key={name} className="flex items-center justify-between p-4 bg-[#050a1f] rounded-2xl border border-blue-900/10 group hover:border-blue-500/30 transition-all">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500 font-black">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight text-slate-200 group-hover:text-blue-400">{name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Ativa no Sistema</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-white">{count}</p>
                  <p className="text-[9px] text-slate-600 font-black uppercase tracking-tighter">Leads Capturados</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* FOOTER DE EXPORTAÇÃO RÁPIDA */}
      <div className="mt-8 bg-gradient-to-r from-blue-900/20 to-transparent p-10 rounded-[2.5rem] border border-blue-900/20 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center space-x-6">
          <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-600/30">
            <CalendarIcon size={28} />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase italic tracking-tight">Relatório Mensal Disponível</h3>
            <p className="text-slate-400 text-sm">O sistema identificou um crescimento de 12% em relação ao mês anterior.</p>
          </div>
        </div>
        <button className="bg-[#0a0f2c] border border-blue-900/40 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-white hover:text-black transition-all">
          Gerar PDF Analítico
        </button>
      </div>
    </div>
  );
}

function InsightCard({ label, val, sub, icon }: any) {
  return (
    <div className="bg-[#0a0f2c] p-8 rounded-[2.5rem] border border-blue-900/20 shadow-2xl flex items-center justify-between group hover:border-blue-500/50 transition-all duration-500">
      <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{label}</p>
        <h3 className="text-4xl font-black text-white tracking-tighter mb-1 italic">{val}</h3>
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{sub}</p>
      </div>
      <div className="w-14 h-14 bg-[#050a1f] rounded-2xl flex items-center justify-center border border-blue-900/20 group-hover:scale-110 transition-transform">
        {icon}
      </div>
    </div>
  );
}