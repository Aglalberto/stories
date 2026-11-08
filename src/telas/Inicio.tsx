import { motion } from 'motion/react';
import { Botao, TelaBase } from '../componentes/Ui';
import { armazenamento } from '../estado/armazenamento';

export function Inicio({
  aoCriar,
  aoEntrar,
  aoContinuar,
  aoReentrar,
  aoConfig,
  aoAjuda,
}: {
  aoCriar: () => void;
  aoEntrar: () => void;
  aoContinuar: (codigo: string) => void;
  aoReentrar: (codigo: string, nome: string) => void;
  aoConfig: () => void;
  aoAjuda: () => void;
}) {
  const salva = armazenamento.partida();
  const convidado = armazenamento.convidado();

  return (
    <TelaBase className="justify-between">
      <div className="flex justify-end gap-2">
        <button onClick={aoAjuda} className="rounded-full border border-borda bg-white/5 px-3 py-1.5 text-sm text-suave">
          Como jogar
        </button>
        <button onClick={aoConfig} aria-label="Configurações" className="rounded-full border border-borda bg-white/5 px-3 py-1.5 text-sm text-suave">
          ⚙︎
        </button>
      </div>

      <div className="flex flex-col items-center text-center">
        <Livro />
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="mt-8 font-titulo text-[2.6rem] leading-[1.05] font-extrabold"
        >
          Livro-Jogo
          <span className="block text-primaria italic">a Dois</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="mt-4 max-w-xs text-[1.02rem] leading-relaxed text-suave"
        >
          Uma aventura cooperativa escrita na hora para vocês dois. Cada um no seu celular, cada um decide pelo seu personagem.
        </motion.p>
      </div>

      <motion.div
        className="flex flex-col gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        {salva && (
          <Botao variante="secundario" onClick={() => aoContinuar(salva.estado.codigo)}>
            Continuar partida <span className="text-primaria">({salva.estado.codigo})</span>
          </Botao>
        )}
        {!salva && convidado && (
          <Botao variante="secundario" onClick={() => aoReentrar(convidado.codigo, convidado.nome)}>
            Voltar à sala <span className="text-primaria">{convidado.codigo}</span>
          </Botao>
        )}
        <Botao onClick={aoCriar} data-testid="criar-sala">
          Criar sala
        </Botao>
        <Botao variante="secundario" onClick={aoEntrar} data-testid="entrar-sala">
          Entrar na sala do meu par
        </Botao>
      </motion.div>
    </TelaBase>
  );
}

/** Livro que se abre, com um coração brilhando entre as páginas. */
function Livro() {
  return (
    <div className="relative h-36 w-48" style={{ perspective: 700 }}>
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--primaria) 35%, transparent), transparent 65%)' }}
        animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1.08, 0.95] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute right-1/2 bottom-4 h-28 w-[5.5rem] origin-right rounded-l-xl bg-gradient-to-l from-[#f6ead2] to-[#e8d3a8] shadow-xl" />
      <motion.div
        className="absolute bottom-4 left-1/2 h-28 w-[5.5rem] origin-left rounded-r-xl bg-gradient-to-r from-[#f6ead2] to-[#e2c896] shadow-xl"
        initial={{ rotateY: -170 }}
        animate={{ rotateY: 0 }}
        transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        style={{ transformStyle: 'preserve-3d' }}
      />
      <div className="absolute bottom-[1.6rem] left-1/2 h-[6.4rem] w-px -translate-x-1/2 bg-black/20" />
      <motion.div
        className="absolute bottom-14 left-1/2 -translate-x-1/2 text-3xl"
        initial={{ opacity: 0, y: 10, scale: 0.5 }}
        animate={{ opacity: 1, y: -18, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.8, type: 'spring' }}
      >
        <motion.span className="block" animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
          💞
        </motion.span>
      </motion.div>
    </div>
  );
}
