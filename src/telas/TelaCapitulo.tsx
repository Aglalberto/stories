import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { TextoMaquina } from '../componentes/TextoMaquina';
import { Botao, Carregando, Cartao } from '../componentes/Ui';
import type { Sessao } from '../estado/sessao';
import { MAX_ACAO_LIVRE } from '../jogo/config';
import { NOMES_FINAL } from '../jogo/livro';
import { proximoEhEpilogo } from '../jogo/motor';
import type { Capitulo, Escolha, EstadoJogo, EstiloOpcao, IdJogador, Opcao } from '../jogo/tipos';
import { Pontos } from './Lobby';

const ESTILO_INFO: Record<EstiloOpcao | 'livre', { icone: string; rotulo: string }> = {
  ousadia: { icone: '⚔️', rotulo: 'Ousadia' },
  astucia: { icone: '🦊', rotulo: 'Astúcia' },
  cuidado: { icone: '🛡️', rotulo: 'Cuidado' },
  livre: { icone: '✍️', rotulo: 'Ação livre' },
};

export function TelaCapitulo({
  sessao,
  numero,
  cps,
  aoAbrirLivro,
}: {
  sessao: Sessao;
  numero: number;
  cps: number;
  aoAbrirLivro: () => void;
}) {
  const e = sessao.estado!;
  const cap: Capitulo | null = e.capitulos[numero - 1] ?? null;
  const epilogo = cap?.epilogo ?? (e.gerando && proximoEhEpilogo(e));
  const titulo = cap?.titulo ?? e.parcial?.titulo ?? '';
  const texto = cap?.narracao ?? e.parcial?.narracao ?? '';
  const meuId = sessao.meuId;
  const jaEscolhi = !!cap?.escolhas[meuId];
  const [lido, setLido] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [numero]);

  return (
    <div className="flex flex-1 flex-col" data-testid={`capitulo-${numero}`}>
      <header className="mb-4">
        <p className="font-titulo text-xs tracking-[0.3em] text-primaria/90 uppercase">
          {epilogo ? 'Epílogo' : `Capítulo ${numero} de ${e.totalCapitulos}`}
        </p>
        <AnimatePresence mode="wait">
          {titulo && (
            <motion.h1
              key={titulo}
              initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.6 }}
              className="mt-1 font-titulo text-[1.9rem] leading-tight font-extrabold"
              data-testid="titulo-capitulo"
            >
              {titulo}
            </motion.h1>
          )}
        </AnimatePresence>
        <Progresso total={e.totalCapitulos} atual={numero} epilogo={epilogo} />
      </header>

      {cap?.efeitos?.resumo && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-2xl border border-borda bg-white/5 px-4 py-2.5 text-sm text-suave italic"
        >
          ✦ {cap.efeitos.resumo}
        </motion.div>
      )}

      {!texto ? (
        <div className="py-10">
          <Pena />
        </div>
      ) : (
        <TextoMaquina
          key={`${e.idPartida}-${numero}`}
          chave={`${e.idPartida}-${numero}`}
          texto={texto}
          completo={!!cap}
          cps={cps}
          instantaneo={jaEscolhi}
          aoTerminar={() => setLido(true)}
        />
      )}

      <AnimatePresence>
        {cap && (lido || jaEscolhi) && !cap.epilogo && <Decisao key="decisao" sessao={sessao} cap={cap} />}
        {cap && lido && cap.epilogo && <Final key="final" sessao={sessao} aoAbrirLivro={aoAbrirLivro} />}
      </AnimatePresence>

      {e.erro && <AvisoErro sessao={sessao} />}
    </div>
  );
}

function Progresso({ total, atual, epilogo }: { total: number; atual: number; epilogo: boolean }) {
  return (
    <div className="mt-3 flex gap-1.5" aria-hidden>
      {Array.from({ length: total + 1 }, (_, i) => {
        const n = i + 1;
        const feito = epilogo || n < atual;
        const agora = !epilogo && n === atual;
        return (
          <motion.span
            key={i}
            className={`h-1 flex-1 rounded-full ${n === total + 1 ? 'max-w-4' : ''}`}
            initial={false}
            animate={{ backgroundColor: feito || (epilogo && n === total + 1) ? 'var(--primaria)' : agora ? 'var(--secundaria)' : 'rgba(255,255,255,0.12)' }}
          />
        );
      })}
    </div>
  );
}

/** Pena escrevendo enquanto a IA não manda o primeiro trecho. */
function Pena() {
  return (
    <div className="flex flex-col items-center gap-4 text-suave">
      <motion.span
        className="text-5xl"
        animate={{ rotate: [-12, 8, -12], x: [-10, 10, -10], y: [0, -4, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        🪶
      </motion.span>
      <p className="font-titulo italic">O narrador está escrevendo <Pontos /></p>
    </div>
  );
}

function nomeDe(e: EstadoJogo, j: IdJogador) {
  return e.jogadores[j]?.nome ?? (j === 'j1' ? 'J1' : 'J2');
}

function Decisao({ sessao, cap }: { sessao: Sessao; cap: Capitulo }) {
  const e = sessao.estado!;
  const meuId = sessao.meuId;
  const outro: IdJogador = meuId === 'j1' ? 'j2' : 'j1';
  const minha = cap.escolhas[meuId];
  const dele = cap.escolhas[outro];
  const cena = cap.cenas[meuId];
  const ambos = !!minha && !!dele;

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 flex flex-col gap-4">
      {cena && (
        <motion.div
          initial={{ opacity: 0, rotateX: -80 }}
          animate={{ opacity: 1, rotateX: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformPerspective: 800, transformOrigin: 'top' }}
          className="rounded-3xl border border-secundaria/40 bg-gradient-to-br from-secundaria/15 to-transparent p-5"
          data-testid="cena-privada"
        >
          <p className="mb-2 font-titulo text-xs tracking-[0.25em] text-secundaria uppercase">🤫 Só você vê</p>
          <p className="leading-relaxed text-texto/90 italic">{cena}</p>
        </motion.div>
      )}

      {!minha && <Opcoes sessao={sessao} cap={cap} />}

      {minha && !ambos && (
        <Cartao initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} data-testid="aguardando-parceiro">
          <p className="text-xs tracking-widest text-suave uppercase">Sua decisão</p>
          <p className="mt-1 font-titulo text-lg">{minha.texto}</p>
          <div className="mt-4 flex items-center gap-2 text-suave">
            <Pontos /> <span>{nomeDe(e, outro)} está decidindo…</span>
          </div>
        </Cartao>
      )}

      {ambos && <Revelacao e={e} cap={cap} meuId={meuId} />}
    </motion.section>
  );
}

function Opcoes({ sessao, cap }: { sessao: Sessao; cap: Capitulo }) {
  const e = sessao.estado!;
  const meuId = sessao.meuId;
  const outro: IdJogador = meuId === 'j1' ? 'j2' : 'j1';
  const opcoes = cap.opcoes[meuId];
  const [sel, setSel] = useState<string | null>(null);
  const [livre, setLivre] = useState('');
  const parceiroJa = !!cap.escolhas[outro];

  const confirmar = () => {
    let escolha: Escolha | null = null;
    if (sel === 'livre') {
      if (!livre.trim()) return;
      escolha = { opcaoId: null, texto: livre.trim().slice(0, MAX_ACAO_LIVRE), estilo: 'livre' };
    } else {
      const o = opcoes.find((x) => x.id === sel);
      if (o) escolha = { opcaoId: o.id, texto: o.texto, estilo: o.estilo };
    }
    if (escolha) {
      navigator.vibrate?.(25);
      sessao.escolher(cap.numero, escolha);
    }
  };

  return (
    <div className="flex flex-col gap-2.5" data-testid="opcoes">
      <div className="flex items-baseline justify-between">
        <h2 className="font-titulo text-xl">O que você faz?</h2>
        {parceiroJa && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xs text-emerald-300">
            {nomeDe(e, outro)} já decidiu ✓
          </motion.span>
        )}
      </div>
      {opcoes.map((o, i) => (
        <CartaoOpcao key={o.id} opcao={o} indice={i} selecionada={sel === o.id} aoTocar={() => setSel(o.id)} />
      ))}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: opcoes.length * 0.08 }}
        className={`rounded-2xl border p-4 transition-colors ${sel === 'livre' ? 'border-primaria bg-primaria/10' : 'border-borda border-dashed bg-white/[0.03]'}`}
        onClick={() => setSel('livre')}
      >
        <p className="text-sm text-suave">✍️ Outra ação…</p>
        {sel === 'livre' && (
          <>
            <textarea
              autoFocus
              value={livre}
              onChange={(ev) => setLivre(ev.target.value.slice(0, MAX_ACAO_LIVRE))}
              rows={2}
              placeholder="Descreva o que seu personagem faz"
              className="mt-2 w-full resize-none rounded-xl bg-black/30 p-3 text-texto outline-none placeholder:text-white/25"
              data-testid="acao-livre"
            />
            <p className="text-right text-xs text-suave/60">
              {livre.length}/{MAX_ACAO_LIVRE}
            </p>
          </>
        )}
      </motion.div>
      <AnimatePresence>
        {sel && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="sticky bottom-3 pt-2">
            <Botao className="w-full" onClick={confirmar} disabled={sel === 'livre' && !livre.trim()} data-testid="confirmar-escolha">
              Decidir
            </Botao>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CartaoOpcao({ opcao, indice, selecionada, aoTocar }: { opcao: Opcao; indice: number; selecionada: boolean; aoTocar: () => void }) {
  const info = ESTILO_INFO[opcao.estilo];
  return (
    <motion.button
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0, scale: selecionada ? 1.02 : 1 }}
      transition={{ delay: indice * 0.08, type: 'spring', stiffness: 260, damping: 22 }}
      whileTap={{ scale: 0.98 }}
      onClick={aoTocar}
      className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${selecionada ? 'border-primaria bg-primaria/12 shadow-[0_0_30px_-10px_var(--primaria)]' : 'border-borda bg-white/[0.05]'}`}
      data-testid="opcao"
    >
      <span className="text-xl leading-none">{info.icone}</span>
      <span className="flex-1">
        <span className="block leading-snug">{opcao.texto}</span>
        <span className="mt-1 block text-[0.7rem] tracking-widest text-suave/70 uppercase">{info.rotulo}</span>
      </span>
    </motion.button>
  );
}

function Revelacao({ e, cap, meuId }: { e: EstadoJogo; cap: Capitulo; meuId: IdJogador }) {
  const ordem: IdJogador[] = meuId === 'j1' ? ['j1', 'j2'] : ['j2', 'j1'];
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);
  return (
    <div ref={ref} className="flex flex-col gap-3" data-testid="revelacao">
      <p className="text-center font-titulo text-xs tracking-[0.3em] text-suave uppercase">As decisões</p>
      {ordem.map((j, i) => {
        const esc = cap.escolhas[j]!;
        const info = ESTILO_INFO[esc.estilo];
        return (
          <motion.div
            key={j}
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            transition={{ delay: 0.15 + i * 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformPerspective: 900 }}
            className={`rounded-2xl border p-4 ${j === meuId ? 'border-primaria/50 bg-primaria/10' : 'border-secundaria/50 bg-secundaria/10'}`}
          >
            <p className="text-xs text-suave">
              {info.icone} {nomeDe(e, j)}
              {j === meuId ? ' (você)' : ''}
            </p>
            <p className="mt-1 font-titulo text-[1.05rem] leading-snug">{esc.texto}</p>
          </motion.div>
        );
      })}
      <div className="mt-3 flex justify-center">
        {e.erro ? null : <Carregando texto="A história continua…" />}
      </div>
    </div>
  );
}

function Final({ sessao, aoAbrirLivro }: { sessao: Sessao; aoAbrirLivro: () => void }) {
  const e = sessao.estado!;
  const f = NOMES_FINAL[e.final ?? 'agridoce'];
  return (
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mt-4 flex flex-col gap-4" data-testid="final">
      <Cartao className="text-center">
        <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', delay: 0.3 }} className="text-6xl">
          {f.icone}
        </motion.div>
        <h2 className="mt-2 font-titulo text-3xl font-extrabold text-primaria" data-testid="tipo-final">
          {f.titulo}
        </h2>
        <p className="mt-1 text-suave">{f.frase}</p>
        {e.tituloHistoria && <p className="mt-4 text-sm text-texto/70 italic">“{e.tituloHistoria}”</p>}
      </Cartao>
      <Botao variante="secundario" onClick={aoAbrirLivro}>
        📖 Ler o livro completo
      </Botao>
      {sessao.novaPartida ? (
        <Botao onClick={sessao.novaPartida} data-testid="nova-aventura">
          ✨ Nova aventura
        </Botao>
      ) : (
        <p className="text-center text-sm text-suave">
          {nomeDe(e, 'j1')} pode começar uma nova aventura quando vocês quiserem.
        </p>
      )}
    </motion.section>
  );
}

function AvisoErro({ sessao }: { sessao: Sessao }) {
  const e = sessao.estado!;
  return (
    <Cartao className="mt-5 border-rose-400/40" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} role="alert">
      <p className="font-titulo text-lg">😵 O narrador tropeçou</p>
      {sessao.tentarDeNovo ? (
        <>
          <p className="mt-1 text-sm text-suave">{e.erro}</p>
          <Botao className="mt-4 w-full" onClick={sessao.tentarDeNovo} data-testid="tentar-de-novo">
            Tentar de novo
          </Botao>
        </>
      ) : (
        <p className="mt-1 text-sm text-suave">
          Algo deu errado no celular de {nomeDe(e, 'j1')}: {e.erro}
        </p>
      )}
    </Cartao>
  );
}
