import { AnimatePresence, motion } from 'motion/react';
import { memo, useEffect, useRef, useState } from 'react';
import type { EstadoJogo, IdJogador, Medidores as TMedidores } from '../jogo/tipos';

function Barra({ valor, max, cor, rotulo }: { valor: number; max: number; cor: string; rotulo: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10" role="meter" aria-label={rotulo} aria-valuenow={valor} aria-valuemin={0} aria-valuemax={max}>
      <motion.div
        className="h-full w-full origin-left rounded-full"
        style={{ background: cor }}
        initial={false}
        animate={{ scaleX: Math.max(0, Math.min(1, valor / max)) }}
        transition={{ type: 'spring', stiffness: 90, damping: 18 }}
      />
    </div>
  );
}

/** Mostra "+2" / "-1" flutuando quando um valor muda. */
function Variacao({ valor }: { valor: number }) {
  const anterior = useRef(valor);
  const [delta, setDelta] = useState<{ v: number; id: number } | null>(null);
  useEffect(() => {
    const d = valor - anterior.current;
    anterior.current = valor;
    if (d !== 0) {
      setDelta({ v: d, id: Date.now() });
      const t = setTimeout(() => setDelta(null), 1800);
      return () => clearTimeout(t);
    }
  }, [valor]);
  return (
    <AnimatePresence>
      {delta && (
        <motion.span
          key={delta.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: -22 }}
          transition={{ duration: 0.6 }}
          className={`absolute -top-1 right-0 text-xs font-bold ${delta.v > 0 ? 'text-emerald-300' : 'text-rose-300'}`}
        >
          {delta.v > 0 ? `+${delta.v}` : delta.v}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

function Item({ icone, rotulo, valor, max, cor, sufixo = '' }: { icone: string; rotulo: string; valor: number; max: number; cor: string; sufixo?: string }) {
  return (
    <div className="relative min-w-0 flex-1">
      <div className="mb-1 flex items-center justify-between gap-1 text-[0.7rem] leading-none text-suave">
        <span className="truncate">
          {icone} {rotulo}
        </span>
        <span className="tabular-nums text-texto/80">
          {valor}
          {sufixo}
        </span>
      </div>
      <Barra valor={valor} max={max} cor={cor} rotulo={rotulo} />
      <Variacao valor={valor} />
    </div>
  );
}

export const Medidores = memo(function Medidores({ estado, meuId }: { estado: EstadoJogo; meuId: IdJogador }) {
  const m: TMedidores = estado.medidores;
  const outro: IdJogador = meuId === 'j1' ? 'j2' : 'j1';
  const nome = (j: IdJogador) => estado.jogadores[j]?.nome ?? '';
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5" data-testid="medidores">
      <Item icone="❤️" rotulo={nome(meuId) || 'Você'} valor={m.vigor[meuId]} max={10} cor="linear-gradient(90deg,#ff7a8a,#ffb3a1)" />
      <Item icone="❤️" rotulo={nome(outro) || 'Parceiro'} valor={m.vigor[outro]} max={10} cor="linear-gradient(90deg,#ff7a8a,#ffb3a1)" />
      <Item icone="🔗" rotulo="Sintonia" valor={m.sintonia} max={10} cor="linear-gradient(90deg,var(--secundaria),#fff)" />
      <Item icone="🧭" rotulo="Missão" valor={m.missao} max={100} sufixo="%" cor="linear-gradient(90deg,var(--primaria),#fff3c9)" />
    </div>
  );
});
