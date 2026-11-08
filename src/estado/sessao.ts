import type { StatusRede } from '../rede/transporte';
import type { Escolha, EstadoJogo, IdJogador } from '../jogo/tipos';

/** Interface comum que as telas usam, seja no celular anfitrião ou no convidado. */
export interface Sessao {
  papel: 'anfitriao' | 'convidado';
  meuId: IdJogador;
  estado: EstadoJogo | null;
  status: StatusRede;
  demo: boolean;
  escolher(numero: number, escolha: Escolha): void;
  /** Apenas anfitrião. */
  sortear?(): void;
  tentarDeNovo?(): void;
  novaPartida?(): void;
  sair(): void;
}
