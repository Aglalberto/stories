export type IdJogador = 'j1' | 'j2';
export const JOGADORES: readonly IdJogador[] = ['j1', 'j2'] as const;

export type GeneroId = 'fantasia' | 'scifi' | 'noir' | 'terror' | 'piratas' | 'apocalipse';

/** Estilo de uma opção: orienta o tom da escolha e as consequências. */
export type EstiloOpcao = 'ousadia' | 'astucia' | 'cuidado';

export interface Opcao {
  id: string;
  texto: string;
  estilo: EstiloOpcao;
}

export interface Escolha {
  /** id da opção escolhida, ou null para ação livre. */
  opcaoId: string | null;
  texto: string;
  estilo: EstiloOpcao | 'livre';
}

export interface Personagem {
  nome: string;
  papel: string;
  descricao: string;
}

export interface Medidores {
  vigor: Record<IdJogador, number>;
  sintonia: number;
  missao: number;
}

/** Variações nos medidores propostas pela IA (já limitadas pelo motor). */
export interface Efeitos {
  vigor: Record<IdJogador, number>;
  sintonia: number;
  missao: number;
  resumo: string;
}

export interface Capitulo {
  numero: number;
  titulo: string;
  narracao: string;
  cenas: Record<IdJogador, string>;
  opcoes: Record<IdJogador, Opcao[]>;
  escolhas: Partial<Record<IdJogador, Escolha>>;
  /** Consequências das escolhas do capítulo anterior, aplicadas ao chegar aqui. */
  efeitos: Efeitos | null;
  epilogo: boolean;
}

export type TipoFinal = 'triunfo' | 'agridoce' | 'tragico';

export type Fase = 'lobby' | 'jogando' | 'final';

export interface Semente {
  lugar: string;
  elemento: string;
  objetivo: string;
}

export interface InfoJogador {
  nome: string;
  conectado: boolean;
}

export interface EstadoJogo {
  versao: 1;
  codigo: string;
  /** Identifica a partida atual (muda a cada sorteio). */
  idPartida: number;
  fase: Fase;
  jogadores: Record<IdJogador, InfoJogador | null>;
  genero: GeneroId | null;
  semente: Semente | null;
  tituloHistoria: string;
  personagens: Record<IdJogador, Personagem> | null;
  capitulos: Capitulo[];
  medidores: Medidores;
  totalCapitulos: number;
  gerando: boolean;
  parcial: TextoParcial | null;
  erro: string | null;
  final: TipoFinal | null;
  /** Gênero da partida anterior, para o sorteio não repetir. */
  generoAnterior: GeneroId | null;
}

export interface TextoParcial {
  titulo: string;
  narracao: string;
}

/** Resposta da IA já interpretada e validada. */
export interface RespostaCapitulo {
  titulo: string;
  narracao: string;
  cenas: Record<IdJogador, string>;
  opcoes: Record<IdJogador, Opcao[]>;
  efeitos: Efeitos | null;
  tituloHistoria: string | null;
  personagens: Record<IdJogador, Personagem> | null;
  final: TipoFinal | null;
}
