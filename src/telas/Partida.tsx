import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { aplicarTema } from '../componentes/Cenario';
import { Medidores } from '../componentes/Medidores';
import { Roleta } from '../componentes/Roleta';
import { Botao, Carregando, TelaBase } from '../componentes/Ui';
import type { Sessao } from '../estado/sessao';
import { GENEROS } from '../jogo/generos';
import { ambosEscolheram } from '../jogo/motor';
import type { EstadoJogo } from '../jogo/tipos';
import type { StatusRede } from '../rede/transporte';
import { LivroCompleto } from './LivroCompleto';
import { Lobby } from './Lobby';
import { TelaCapitulo } from './TelaCapitulo';

/** Número do capítulo que deve aparecer na tela agora. */
function alvoExibicao(e: EstadoJogo): number {
  if (e.fase === 'lobby') return 0;
  const n = e.capitulos.length;
  if (e.gerando && (n === 0 || (e.parcial?.narracao.length ?? 0) > 0)) return n + 1;
  return Math.max(n, 1);
}

/**
 * Segura a revelação das decisões na tela por alguns segundos
 * antes de virar a página para o próximo capítulo.
 */
function useCapituloExibido(e: EstadoJogo | null, segurarMs: number): number {
  const [exibido, setExibido] = useState(() => (e ? alvoExibicao(e) : 0));
  const reveladoEm = useRef<number | null>(null);
  const eRef = useRef(e);
  eRef.current = e;

  const capAtual = e?.capitulos[exibido - 1] ?? null;
  const revelado = ambosEscolheram(capAtual);
  if (revelado && reveladoEm.current === null) reveladoEm.current = Date.now();
  if (!revelado && reveladoEm.current !== null && e?.capitulos.length === exibido) reveladoEm.current = null;

  useEffect(() => {
    if (!e) return;
    const alvo = alvoExibicao(e);
    if (alvo === exibido) return;
    if (alvo > exibido && reveladoEm.current !== null) {
      const resta = segurarMs - (Date.now() - reveladoEm.current);
      if (resta > 0) {
        const t = setTimeout(() => {
          reveladoEm.current = null;
          if (eRef.current) setExibido(alvoExibicao(eRef.current));
        }, resta);
        return () => clearTimeout(t);
      }
    }
    reveladoEm.current = null;
    setExibido(alvo);
  }, [e, exibido, segurarMs]);

  return exibido;
}

const TEXTO_STATUS: Record<StatusRede, string> = {
  conectando: 'Conectando…',
  pronto: 'Sala aberta',
  conectado: 'Conectado',
  reconectando: 'Reconectando…',
  'sala-inexistente': 'Sala não encontrada',
  erro: 'Erro de conexão',
};

export function Partida({ sessao, cps, rapido }: { sessao: Sessao; cps: number; rapido: boolean }) {
  const e = sessao.estado;
  const genero = e?.genero ?? null;
  const [livroAberto, setLivroAberto] = useState(false);
  const [roletaVista, setRoletaVista] = useState<number | null>(null);
  const exibido = useCapituloExibido(e, rapido ? 300 : 4200);

  useEffect(() => {
    aplicarTema(e?.fase === 'lobby' ? null : genero);
  }, [genero, e?.fase]);
  useEffect(() => () => aplicarTema(null), []);

  // Mantém a tela ligada durante a partida.
  useEffect(() => {
    let trava: WakeLockSentinel | null = null;
    const pedir = async () => {
      try {
        trava = (await navigator.wakeLock?.request('screen')) ?? null;
      } catch {
        /* não suportado */
      }
    };
    void pedir();
    const aoVisivel = () => document.visibilityState === 'visible' && void pedir();
    document.addEventListener('visibilitychange', aoVisivel);
    return () => {
      document.removeEventListener('visibilitychange', aoVisivel);
      void trava?.release();
    };
  }, []);

  const fecharRoleta = useCallback(() => setRoletaVista(e?.idPartida ?? null), [e?.idPartida]);

  if (!e) return <Conectando sessao={sessao} />;

  const mostrarRoleta =
    e.fase === 'jogando' &&
    !!e.genero &&
    roletaVista !== e.idPartida &&
    (e.capitulos.length === 0 || (e.capitulos.length === 1 && !e.capitulos[0].escolhas[sessao.meuId]));

  const outro = sessao.meuId === 'j1' ? 'j2' : 'j1';
  const parceiroCaiu = e.jogadores[outro] && !e.jogadores[outro]!.conectado;
  const statusRuim = sessao.status !== 'conectado' && !(sessao.papel === 'anfitriao' && sessao.status === 'pronto' && !e.jogadores.j2);

  return (
    <TelaBase>
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="min-w-0 truncate font-titulo text-sm text-suave">
          {e.fase !== 'lobby' && genero ? `${GENEROS[genero].icone} ${e.tituloHistoria || GENEROS[genero].nome}` : 'Livro-Jogo a Dois'}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          {(statusRuim || parceiroCaiu) && (
            <span className="rounded-full bg-amber-400/15 px-2.5 py-1 text-[0.7rem] text-amber-200" data-testid="status-rede">
              {parceiroCaiu && !statusRuim ? `${e.jogadores[outro]!.nome} desconectou` : TEXTO_STATUS[sessao.status]}
            </span>
          )}
          {e.capitulos.length > 0 && (
            <button onClick={() => setLivroAberto(true)} className="rounded-full border border-borda bg-white/5 px-2.5 py-1 text-sm" aria-label="Ver o livro">
              📖
            </button>
          )}
          <button
            onClick={() => {
              if (confirm(sessao.papel === 'anfitriao' ? 'Encerrar a sala? A partida será perdida.' : 'Sair da sala?')) sessao.sair();
            }}
            className="rounded-full border border-borda bg-white/5 px-2.5 py-1 text-sm text-suave"
            aria-label="Sair"
          >
            ✕
          </button>
        </div>
      </div>

      {e.fase !== 'lobby' && (
        <div className="sticky top-0 z-20 -mx-4 mb-5 border-b border-borda bg-[color-mix(in_srgb,var(--fundo1)_82%,transparent)] px-4 py-3 backdrop-blur-md">
          <Medidores estado={e} meuId={sessao.meuId} />
        </div>
      )}

      <AnimatePresence mode="wait">
        {e.fase === 'lobby' ? (
          <motion.div key="lobby" className="flex flex-1 flex-col" exit={{ opacity: 0 }}>
            <Lobby sessao={sessao} />
          </motion.div>
        ) : (
          <motion.div
            key={`${e.idPartida}-${exibido}`}
            className="flex flex-1 flex-col"
            initial={{ opacity: 0, x: 40, rotateY: -12 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: -40, rotateY: 12 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformPerspective: 1000 }}
          >
            <TelaCapitulo sessao={sessao} numero={exibido} cps={cps} aoAbrirLivro={() => setLivroAberto(true)} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mostrarRoleta && e.genero && <Roleta key="roleta" genero={e.genero} semente={e.semente} rapido={rapido} aoTerminar={fecharRoleta} />}
        {livroAberto && <LivroCompleto key="livro" estado={e} aoFechar={() => setLivroAberto(false)} />}
      </AnimatePresence>
    </TelaBase>
  );
}

function Conectando({ sessao }: { sessao: Sessao }) {
  const texto =
    sessao.status === 'sala-inexistente'
      ? 'Não encontramos essa sala. Confira o código e se o celular do seu par está com a sala aberta. Continuamos tentando…'
      : sessao.status === 'reconectando'
        ? 'Reconectando ao celular do seu par…'
        : 'Conectando ao celular do seu par…';
  return (
    <TelaBase className="items-center justify-center text-center">
      <Carregando texto={TEXTO_STATUS[sessao.status]} />
      <p className="mt-4 max-w-xs text-suave" data-testid="conectando">
        {texto}
      </p>
      <Botao variante="fantasma" className="mt-8" onClick={sessao.sair}>
        Cancelar
      </Botao>
    </TelaBase>
  );
}
