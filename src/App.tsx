import { AnimatePresence, MotionConfig } from 'motion/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Cenario } from './componentes/Cenario';
import { armazenamento, type Preferencias } from './estado/armazenamento';
import { useAnfitriao } from './estado/useAnfitriao';
import { useConvidado } from './estado/useConvidado';
import { lerParametros } from './jogo/config';
import { gerarCodigoSala, normalizarCodigo } from './jogo/generos';
import type { GeneroId } from './jogo/tipos';
import { ComoJogar } from './telas/ComoJogar';
import { Configuracoes } from './telas/Configuracoes';
import { CriarSala } from './telas/CriarSala';
import { EntrarSala } from './telas/EntrarSala';
import { Inicio } from './telas/Inicio';
import { Partida } from './telas/Partida';

type Rota =
  | { tela: 'inicio' }
  | { tela: 'criar' }
  | { tela: 'entrar'; codigo: string }
  | { tela: 'config' }
  | { tela: 'ajuda' }
  | { tela: 'anfitriao'; codigo: string; nome: string; demo: boolean; retomar: boolean }
  | { tela: 'convidado'; codigo: string; nome: string };

const CPS: Record<Preferencias['velocidade'], number> = { lenta: 32, normal: 58, rapida: 120 };

function rotaInicial(): Rota {
  const m = location.hash.match(/#\/entrar\/([A-Za-z0-9]+)/);
  if (m) {
    history.replaceState(null, '', location.pathname + location.search);
    return { tela: 'entrar', codigo: normalizarCodigo(m[1]) };
  }
  return { tela: 'inicio' };
}

export default function App() {
  const [rota, setRota] = useState<Rota>(rotaInicial);
  const [prefs, setPrefs] = useState(armazenamento.prefs());
  const [genero, setGenero] = useState<GeneroId | null>(null);
  const { rapido } = useMemo(() => lerParametros(), []);
  const cps = rapido ? Infinity : CPS[prefs.velocidade];
  const inicio = useCallback(() => {
    setGenero(null);
    setRota({ tela: 'inicio' });
  }, []);

  let conteudo;
  switch (rota.tela) {
    case 'inicio':
      conteudo = (
        <Inicio
          key="inicio"
          aoCriar={() => setRota({ tela: 'criar' })}
          aoEntrar={() => setRota({ tela: 'entrar', codigo: '' })}
          aoContinuar={(codigo) => {
            const salva = armazenamento.partida();
            setRota({ tela: 'anfitriao', codigo, nome: salva?.estado.jogadores.j1?.nome ?? '', demo: !!salva?.demo, retomar: true });
          }}
          aoReentrar={(codigo, nome) => setRota({ tela: 'convidado', codigo, nome })}
          aoConfig={() => setRota({ tela: 'config' })}
          aoAjuda={() => setRota({ tela: 'ajuda' })}
        />
      );
      break;
    case 'criar':
      conteudo = (
        <CriarSala
          key="criar"
          aoVoltar={inicio}
          aoCriar={(nome, demo) => {
            armazenamento.salvarPartida(null);
            setRota({ tela: 'anfitriao', codigo: gerarCodigoSala(), nome, demo, retomar: false });
          }}
        />
      );
      break;
    case 'entrar':
      conteudo = <EntrarSala key="entrar" codigoInicial={rota.codigo} aoVoltar={inicio} aoEntrar={(codigo, nome) => setRota({ tela: 'convidado', codigo, nome })} />;
      break;
    case 'config':
      conteudo = <Configuracoes key="config" aoVoltar={inicio} aoMudarPrefs={setPrefs} />;
      break;
    case 'ajuda':
      conteudo = <ComoJogar key="ajuda" aoVoltar={inicio} />;
      break;
    case 'anfitriao':
      conteudo = <SessaoAnfitriao key={`a-${rota.codigo}`} {...rota} cps={cps} rapido={rapido} aoSair={inicio} aoGenero={setGenero} />;
      break;
    case 'convidado':
      conteudo = <SessaoConvidado key={`c-${rota.codigo}`} {...rota} cps={cps} rapido={rapido} aoSair={inicio} aoGenero={setGenero} />;
      break;
  }

  return (
    <MotionConfig reducedMotion="user">
      <Cenario genero={genero} />
      <AnimatePresence mode="wait">{conteudo}</AnimatePresence>
    </MotionConfig>
  );
}

interface PropsSessao {
  codigo: string;
  nome: string;
  cps: number;
  rapido: boolean;
  aoSair: () => void;
  aoGenero: (g: GeneroId | null) => void;
}

/** Leva o gênero sorteado para o cenário de fundo, que fica fora da partida. */
function useSincronizarGenero(genero: GeneroId | null | undefined, fase: string | undefined, aoGenero: (g: GeneroId | null) => void) {
  const g = fase && fase !== 'lobby' ? (genero ?? null) : null;
  useEffect(() => aoGenero(g), [g, aoGenero]);
}

function SessaoAnfitriao(p: PropsSessao & { demo: boolean; retomar: boolean }) {
  const op = useMemo(() => ({ codigo: p.codigo, nome: p.nome, demo: p.demo, retomar: p.retomar, aoSair: p.aoSair }), [p.codigo, p.nome, p.demo, p.retomar, p.aoSair]);
  const sessao = useAnfitriao(op);
  useSincronizarGenero(sessao.estado?.genero, sessao.estado?.fase, p.aoGenero);
  return <Partida sessao={sessao} cps={p.cps} rapido={p.rapido} />;
}

function SessaoConvidado(p: PropsSessao) {
  const op = useMemo(() => ({ codigo: p.codigo, nome: p.nome, aoSair: p.aoSair }), [p.codigo, p.nome, p.aoSair]);
  const sessao = useConvidado(op);
  useSincronizarGenero(sessao.estado?.genero, sessao.estado?.fase, p.aoGenero);
  return <Partida sessao={sessao} cps={p.cps} rapido={p.rapido} />;
}
