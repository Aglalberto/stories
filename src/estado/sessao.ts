import type { StatusRede } from '../rede/transporte';
import type { Escolha, EstadoJogo, IdJogador, SugestaoTema } from '../jogo/tipos';

/** Interface comum que as telas usam, seja no celular anfitrião ou no convidado. */
export interface Sessao {
  papel: 'anfitriao' | 'convidado';
  meuId: IdJogador;
  estado: EstadoJogo | null;
  status: StatusRede;
  demo: boolean;
  escolher(numero: number, escolha: Escolha): void;
  /** Sugere (ou retira, com null) um tema na sala de espera. */
  sugerir(s: SugestaoTema | null): void;
  /** Apenas anfitrião: começa com a sugestão de um dos jogadores, ou sorteia entre as duas. */
  iniciar?(origem: IdJogador | 'sortearEntre'): void;
  /** Apenas anfitrião: liga/desliga o conteúdo adulto (18+). */
  definirAdulto?(adulto: boolean): void;
  tentarDeNovo?(): void;
  novaPartida?(): void;
  sair(): void;
}
