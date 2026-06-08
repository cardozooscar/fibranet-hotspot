'use client'

export default function FormPerfil() {
  return (
    <form className="space-y-5">
      <div>
        <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Nome do Administrador</label>
        <input 
          type="text" 
          defaultValue="Administrador Fibranet"
          className="w-full bg-[#050a1f] border border-blue-900/40 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition-all font-bold text-white" 
        />
      </div>
      <div>
        <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">E-mail de Contato</label>
        <input 
          type="email" 
          defaultValue="admin@fibranet.com.br"
          className="w-full bg-[#050a1f] border border-blue-900/40 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition-all font-bold text-white" 
        />
      </div>
      <button disabled className="w-full bg-slate-800 text-slate-500 font-black py-4 rounded-2xl uppercase tracking-widest cursor-not-allowed border border-slate-700">
        Salvar Perfil
      </button>
    </form>
  );
}