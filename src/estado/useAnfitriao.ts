import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { lerParametros } from '../jogo/config';
import { aleatorioSeguro, mesmaSugestao, resolverTema } from '../jogo/generos';
import { criarEstadoInicial, motor, precisaGerar, type Acao } from '../jogo/motor';
import type { Escolha, EstadoJogo, IdJogador, SugestaoTema } from '../jogo/tipos';
import { ErroFormato, extrairParcial, interpretarResposta } from '../ia/parser';
import { montarPedido } from '../ia/prompt';
import type { GeradorHistoria, Turno } from '../ia/gerador';
import { criarGeradorSimulado } from '../ia/simulada';
import {
  criarAnfitriaoLocal,
  criarAnfitriaoPeer,
  type LadoAnfitriao,
  type StatusRede,
} from '../rede/transporte';
import type { MsgConvidado } from '../rede/protocolo';
import { armazenamento } from './armazenamento';
import type { Sessao } from './sessao';

export interface OpcoesAnfitriao {
  codigo: string;
  nome: string;
  demo: boolean;
  retomar: boolean;
  aoSair(): void;
}

async function obterGerador(demo: boolean): Promise<GeradorHistoria> {
  const { rapido } = lerParametros();
  if (demo) return criarGeradorSimulado({ atrasoMs: rapido ? 0 : 18 });
  // O SDK só é carregado no celular que gera a história.
  const { criarGeradorClaude } = await import('../ia/claude');
  return criarGeradorClaude(armazenamento.chaveApi());
}

export function useAnfitriao(op: OpcoesAnfitriao): Sessao {
  const salvo = useMemo(() => (op.retomar ? armazenamento.partida() : null), [op.retomar]);
  const historico = useRef<Turno[]>(salvo?.historico ?? []);
  const [estado, dispatch] = useReducer(motor, null, () => {
    if (salvo) {
      // Uma geração interrompida pelo recarregamento recomeça do zero.
      return { ...criarEstadoInicial(salvo.estado.codigo, op.nome), ...salvo.estado, gerando: false, parcial: null, jogadores: { ...salvo.estado.jogadores, j2: salvo.estado.jogadores.j2 && { ...salvo.estado.jogadores.j2, conectado: false } } };
    }
    return criarEstadoInicial(op.codigo, op.nome);
  });
  const [status, setStatus] = useState<StatusRede>('conectando');
  const rede = useRef<LadoAnfitriao | null>(null);
  const estadoRef = useRef<EstadoJogo>(estado);
  estadoRef.current = estado;

  // Revisão estrutural: muda em toda ação, exceto nos trechos parciais do streaming.
  const revisao = useRef(0);
  const despachar = useCallback((a: Acao) => {
    if (a.tipo !== 'parcial') revisao.current++;
    dispatch(a);
  }, []);

  /* ---------------- Rede ---------------- */
  useEffect(() => {
    const { transporteLocal } = lerParametros();
    const eventos = {
      aoReceber: (m: MsgConvidado) => {
        if (m.t === 'ola') {
          despachar({ tipo: 'convidadoEntrou', nome: m.nome });
          // Garante que o convidado receba o estado completo mesmo sem mudança.
          setTimeout(() => rede.current?.enviar({ t: 'estado', estado: estadoRef.current }), 50);
        } else if (m.t === 'escolha') {
          despachar({ tipo: 'escolha', jogador: 'j2', numero: m.numero, escolha: m.escolha });
          navigator.vibrate?.(40);
        } else if (m.t === 'sugestao') {
          despachar({ tipo: 'sugerir', jogador: 'j2', sugestao: m.sugestao });
        }
      },
      aoStatus: setStatus,
      aoConvidado: (conectado: boolean) => despachar({ tipo: 'conexao', jogador: 'j2', conectado }),
    };
    rede.current = transporteLocal ? criarAnfitriaoLocal(op.codigo, eventos) : criarAnfitriaoPeer(op.codigo, eventos);
    return () => {
      rede.current?.fechar();
      rede.current = null;
    };
  }, [op.codigo, despachar]);

  /* ---------- Transmissão e persistência ---------- */
  const revisaoEnviada = useRef(-1);
  const ultimoParcial = useRef(0);
  const parcialPendente = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (revisaoEnviada.current !== revisao.current) {
      revisaoEnviada.current = revisao.current;
      rede.current?.enviar({ t: 'estado', estado });
      armazenamento.salvarPartida({ estado, historico: historico.current, demo: op.demo });
      return;
    }
    // Só o texto parcial mudou: envia no máximo a cada 150 ms.
    const enviarParcial = () => {
      ultimoParcial.current = Date.now();
      parcialPendente.current = null;
      const p = estadoRef.current.parcial;
      if (p) rede.current?.enviar({ t: 'parcial', parcial: p });
    };
    if (Date.now() - ultimoParcial.current > 150) enviarParcial();
    else if (!parcialPendente.current) parcialPendente.current = setTimeout(enviarParcial, 150);
  }, [estado, op.demo]);

  /* ---------------- Geração ---------------- */
  const gerandoRef = useRef(false);
  const abortar = useRef<AbortController | null>(null);
  useEffect(() => {
    if (!precisaGerar(estado) || gerandoRef.current) return;
    gerandoRef.current = true;
    const ctrl = new AbortController();
    abortar.current = ctrl;
    const pedido = montarPedido(estado);
    const nomes = { j1: estado.jogadores.j1?.nome ?? 'J1', j2: estado.jogadores.j2?.nome ?? 'J2' };
    despachar({ tipo: 'geracaoIniciada' });

    (async () => {
      const gerador = await obterGerador(op.demo);
      let ultimo = 0;
      const aoParcial = (acc: string) => {
        const agora = Date.now();
        if (agora - ultimo < 60) return;
        ultimo = agora;
        despachar({ tipo: 'parcial', parcial: extrairParcial(acc) });
      };
      for (let tentativa = 0; ; tentativa++) {
        const texto = await gerador.gerar(
          {
            historico: historico.current,
            mensagem: pedido.mensagem,
            contexto: { numero: pedido.numero, epilogo: pedido.epilogo, genero: estado.genero, temaLivre: estado.temaLivre, adulto: estado.adulto, nomes, totalCapitulos: estado.totalCapitulos },
          },
          aoParcial,
          ctrl.signal,
        );
        try {
          const resposta = interpretarResposta(texto, { numero: pedido.numero, epilogo: pedido.epilogo, nomes });
          historico.current = [...historico.current, { role: 'user', content: pedido.mensagem }, { role: 'assistant', content: texto }];
          despachar({ tipo: 'capituloGerado', resposta });
          return;
        } catch (e) {
          // Formato inesperado: pede de novo uma vez antes de desistir.
          if (!(e instanceof ErroFormato) || tentativa >= 1) throw e;
        }
      }
    })()
      .catch((e: unknown) => {
        if (ctrl.signal.aborted) return;
        const msg =
          e instanceof ErroFormato
            ? 'A IA respondeu num formato inesperado. Tente de novo.'
            : e instanceof Error
              ? e.message
              : 'Erro ao gerar o capítulo.';
        despachar({ tipo: 'erro', mensagem: msg });
      })
      .finally(() => {
        gerandoRef.current = false;
      });
  }, [estado, despachar, op.demo]);

  useEffect(() => () => abortar.current?.abort(), []);

  /* ---------------- Ações ---------------- */
  const escolher = useCallback(
    (numero: number, escolha: Escolha) => despachar({ tipo: 'escolha', jogador: 'j1', numero, escolha }),
    [despachar],
  );
  const definirAdulto = useCallback((adulto: boolean) => despachar({ tipo: 'definirAdulto', adulto }), [despachar]);
  const sugerir = useCallback((s: SugestaoTema | null) => despachar({ tipo: 'sugerir', jogador: 'j1', sugestao: s }), [despachar]);
  const iniciar = useCallback(
    (origem: IdJogador | 'sortearEntre') => {
      const e = estadoRef.current;
      const { j1, j2 } = e.sugestoes;
      let sugestao: SugestaoTema | null;
      if (origem === 'sortearEntre') sugestao = mesmaSugestao(j1, j2) || aleatorioSeguro() < 0.5 ? j1 : j2;
      else sugestao = e.sugestoes[origem];
      historico.current = [];
      despachar({ tipo: 'iniciar', tema: resolverTema(sugestao, e.generoAnterior), idPartida: Date.now() });
    },
    [despachar],
  );
  const tentarDeNovo = useCallback(() => despachar({ tipo: 'limparErro' }), [despachar]);
  const novaPartida = useCallback(() => {
    abortar.current?.abort();
    historico.current = [];
    despachar({ tipo: 'novaPartida' });
  }, [despachar]);
  const sair = useCallback(() => {
    abortar.current?.abort();
    armazenamento.salvarPartida(null);
    op.aoSair();
  }, [op]);

  return {
    papel: 'anfitriao',
    meuId: 'j1',
    estado,
    status,
    demo: op.demo,
    escolher,
    sugerir,
    iniciar,
    definirAdulto,
    tentarDeNovo,
    novaPartida,
    sair,
  };
}
