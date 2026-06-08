'use client'

import { useRouter, useSearchParams } from 'next/navigation';
import { Wifi } from 'lucide-react';

export default function FilterUnit({ units }: { units: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUnit = searchParams.get('unit') || 'all';

  const handleChange = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id === 'all') {
      params.delete('unit');
    } else {
      params.set('unit', id);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center space-x-3 bg-[#0a0f2c] border border-blue-900/30 px-4 py-2 rounded-2xl shadow-xl">
      <Wifi size={16} className="text-blue-500" />
      <select 
        value={currentUnit}
        onChange={(e) => handleChange(e.target.value)}
        className="bg-transparent text-xs font-black uppercase tracking-widest text-slate-200 outline-none cursor-pointer"
      >
        <option value="all" className="bg-[#0a0f2c]">Todas as Unidades</option>
        {units.map((unit) => (
          <option key={unit.id} value={unit.id} className="bg-[#0a0f2c]">
            {unit.nome}
          </option>
        ))}
      </select>
    </div>
  );
}