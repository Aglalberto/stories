import { useCallback, useEffect, useRef, useState } from 'react';
import { lerParametros } from '../jogo/config';
import type { Escolha, EstadoJogo, SugestaoTema } from '../jogo/tipos';
import type { MsgAnfitriao } from '../rede/protocolo';
import { criarConvidadoLocal, criarConvidadoPeer, type LadoConvidado, type StatusRede } from '../rede/transporte';
import { armazenamento } from './armazenamento';
import type { Sessao } from './sessao';

export interface OpcoesConvidado {
  codigo: string;
  nome: string;
  aoSair(): void;
}

export function useConvidado(op: OpcoesConvidado): Sessao {
  const [estado, setEstado] = useState<EstadoJogo | null>(null);
  const [status, setStatus] = useState<StatusRede>('conectando');
  const rede = useRef<LadoConvidado | null>(null);
  const pendente = useRef<{ numero: number; escolha: Escolha } | null>(null);

  useEffect(() => {
    armazenamento.salvarConvidado({ codigo: op.codigo, nome: op.nome });
    const { transporteLocal } = lerParametros();
    const aoAbrir = () => rede.current?.enviar({ t: 'ola', nome: op.nome });
    const eventos = {
      aoReceber: (m: MsgAnfitriao) => {
        if (m.t === 'estado') {
          setEstado(m.estado);
          // Reenvia uma escolha que se perdeu numa queda de conexão.
          const p = pendente.current;
          const ult = m.estado.capitulos.at(-1);
          if (p && ult) {
            if (ult.numero !== p.numero || ult.escolhas.j2) pendente.current = null;
            else rede.current?.enviar({ t: 'escolha', ...p });
          }
        } else if (m.t === 'parcial') {
          setEstado((e) => (e ? { ...e, parcial: m.parcial } : e));
        }
      },
      aoStatus: setStatus,
    };
    // Na primeira renderização a ref ainda é nula; o "olá" sai quando a conexão abre.
    rede.current = transporteLocal
      ? criarConvidadoLocal(op.codigo, eventos, () => setTimeout(aoAbrir, 0))
      : criarConvidadoPeer(op.codigo, eventos, aoAbrir);
    return () => {
      rede.current?.fechar();
      rede.current = null;
    };
  }, [op.codigo, op.nome]);

  const escolher = useCallback((numero: number, escolha: Escolha) => {
    pendente.current = { numero, escolha };
    rede.current?.enviar({ t: 'escolha', numero, escolha });
    // Atualização otimista; o anfitrião confirma ao reenviar o estado.
    setEstado((e) => {
      if (!e) return e;
      const ult = e.capitulos.at(-1);
      if (!ult || ult.numero !== numero || ult.escolhas.j2) return e;
      return { ...e, capitulos: [...e.capitulos.slice(0, -1), { ...ult, escolhas: { ...ult.escolhas, j2: escolha } }] };
    });
  }, []);

  const sugerir = useCallback((s: SugestaoTema | null) => {
    rede.current?.enviar({ t: 'sugestao', sugestao: s });
    // Atualização otimista, confirmada pelo próximo estado do anfitrião.
    setEstado((e) => (e && e.fase === 'lobby' ? { ...e, sugestoes: { ...e.sugestoes, j2: s } } : e));
  }, []);

  const sair = useCallback(() => {
    armazenamento.salvarConvidado(null);
    op.aoSair();
  }, [op]);

  return { papel: 'convidado', meuId: 'j2', estado, status, demo: false, escolher, sugerir, sair };
}
