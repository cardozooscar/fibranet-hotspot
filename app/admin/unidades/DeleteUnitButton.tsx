'use client'

import { Trash2 } from 'lucide-react';
import { deletarUnidade } from './actions';

export default function DeleteUnitButton({ id, nome }: { id: string, nome: string }) {
  const handleDelete = async () => {
    if (confirm(`Remover a unidade "${nome}" e todos os seus dados?`)) {
      await deletarUnidade(id);
    }
  };

  return (
    <button onClick={handleDelete} className="p-3 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all">
      <Trash2 size={18} />
    </button>
  );
}