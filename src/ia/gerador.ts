import type { GeneroId, IdJogador } from '../jogo/tipos';

/** Uma troca do histórico enviado à IA (sempre só acrescentado, nunca editado). */
export interface Turno {
  role: 'user' | 'assistant';
  content: string;
}

export interface PedidoGeracao {
  historico: Turno[];
  mensagem: string;
  contexto: {
    numero: number;
    epilogo: boolean;
    /** Gênero da partida (null no tema livre, antes do capítulo 1). */
    genero: GeneroId | null;
    temaLivre: string | null;
    adulto: boolean;
    nomes: Record<IdJogador, string>;
    totalCapitulos: number;
  };
}

export interface GeradorHistoria {
  /** Gera o texto bruto (com tags) do capítulo, informando o texto acumulado a cada trecho. */
  gerar(pedido: PedidoGeracao, aoParcial: (acumulado: string) => void, sinal: AbortSignal): Promise<string>;
}

export class ErroGeracao extends Error {
  constructor(
    msg: string,
    readonly recuperavel = true,
  ) {
    super(msg);
    this.name = 'ErroGeracao';
  }
}
