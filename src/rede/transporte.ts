import Peer, { type DataConnection } from 'peerjs';
import { ehMsgAnfitriao, ehMsgConvidado, type MsgAnfitriao, type MsgConvidado } from './protocolo';

export type StatusRede = 'conectando' | 'pronto' | 'conectado' | 'reconectando' | 'sala-inexistente' | 'erro';

export interface LadoAnfitriao {
  enviar(m: MsgAnfitriao): void;
  fechar(): void;
}
export interface LadoConvidado {
  enviar(m: MsgConvidado): void;
  fechar(): void;
}

export interface EventosAnfitriao {
  aoReceber(m: MsgConvidado): void;
  aoStatus(s: StatusRede, detalhe?: string): void;
  aoConvidado(conectado: boolean): void;
}
export interface EventosConvidado {
  aoReceber(m: MsgAnfitriao): void;
  aoStatus(s: StatusRede, detalhe?: string): void;
}

const PREFIXO = 'livrojogo-a-dois-v1-';
export const idDoPeer = (codigo: string) => PREFIXO + codigo.toLowerCase();

const INTERVALO_PING = 4000;
const LIMITE_SILENCIO = 13000;

/* ------------------------------------------------------------------ */
/* PeerJS (WebRTC): o servidor público do PeerJS só faz a apresentação  */
/* dos dois aparelhos; depois os dados vão direto de um celular ao outro. */
/* ------------------------------------------------------------------ */

export function criarAnfitriaoPeer(codigo: string, ev: EventosAnfitriao): LadoAnfitriao {
  let fechado = false;
  let peer: Peer | null = null;
  let conexao: DataConnection | null = null;
  let ultimoContato = 0;
  let tentativas = 0;

  const definirConexao = (c: DataConnection | null) => {
    if (conexao && conexao !== c) {
      try {
        conexao.close();
      } catch {
        /* ignora */
      }
    }
    conexao = c;
  };

  const iniciar = () => {
    if (fechado) return;
    ev.aoStatus(tentativas ? 'reconectando' : 'conectando');
    peer = new Peer(idDoPeer(codigo), { debug: 0 });
    peer.on('open', () => {
      tentativas = 0;
      ev.aoStatus('pronto');
    });
    peer.on('connection', (c) => {
      c.on('open', () => {
        definirConexao(c);
        ultimoContato = Date.now();
        ev.aoStatus('conectado');
        ev.aoConvidado(true);
      });
      c.on('data', (d) => {
        if (c !== conexao) return;
        ultimoContato = Date.now();
        if (ehMsgConvidado(d)) ev.aoReceber(d);
      });
      c.on('close', () => {
        if (c === conexao) {
          conexao = null;
          ev.aoConvidado(false);
          ev.aoStatus('pronto');
        }
      });
      c.on('error', () => undefined);
    });
    peer.on('disconnected', () => {
      if (!fechado && peer && !peer.destroyed) {
        try {
          peer.reconnect();
        } catch {
          /* ignora */
        }
      }
    });
    peer.on('error', (err: { type?: string }) => {
      if (fechado) return;
      // O id pode continuar "ocupado" por alguns segundos depois de recarregar a página.
      const tipo = err?.type ?? '';
      if (['unavailable-id', 'network', 'server-error', 'socket-error', 'socket-closed'].includes(tipo)) {
        tentativas++;
        peer?.destroy();
        ev.aoStatus('reconectando', tipo);
        setTimeout(iniciar, Math.min(2000 * tentativas, 8000));
      } else if (tipo !== 'peer-unavailable') {
        ev.aoStatus('erro', tipo);
      }
    });
  };
  iniciar();

  const relogio = setInterval(() => {
    if (!conexao) return;
    try {
      conexao.send({ t: 'ping' } satisfies MsgAnfitriao);
    } catch {
      /* ignora */
    }
    if (Date.now() - ultimoContato > LIMITE_SILENCIO) {
      definirConexao(null);
      ev.aoConvidado(false);
      ev.aoStatus('pronto');
    }
  }, INTERVALO_PING);

  return {
    enviar(m) {
      if (conexao?.open) {
        try {
          conexao.send(m);
        } catch {
          /* ignora */
        }
      }
    },
    fechar() {
      fechado = true;
      clearInterval(relogio);
      definirConexao(null);
      peer?.destroy();
    },
  };
}

export function criarConvidadoPeer(codigo: string, ev: EventosConvidado, aoAbrir: () => void): LadoConvidado {
  let fechado = false;
  let peer: Peer | null = null;
  let conexao: DataConnection | null = null;
  let ultimoContato = 0;
  let agendado: ReturnType<typeof setTimeout> | null = null;

  const agendar = (fn: () => void, ms: number) => {
    if (agendado) clearTimeout(agendado);
    agendado = setTimeout(fn, ms);
  };

  const conectar = () => {
    if (fechado || !peer || peer.destroyed) return;
    if (peer.disconnected) {
      try {
        peer.reconnect();
      } catch {
        /* ignora */
      }
      agendar(conectar, 1500);
      return;
    }
    const c = peer.connect(idDoPeer(codigo), { reliable: true });
    conexao = c;
    const tempoLimite = setTimeout(() => {
      if (c === conexao && !c.open) {
        c.close();
        conexao = null;
        ev.aoStatus('reconectando');
        agendar(conectar, 1500);
      }
    }, 10000);
    c.on('open', () => {
      clearTimeout(tempoLimite);
      ultimoContato = Date.now();
      ev.aoStatus('conectado');
      aoAbrir();
    });
    c.on('data', (d) => {
      if (c !== conexao) return;
      ultimoContato = Date.now();
      if (ehMsgAnfitriao(d)) ev.aoReceber(d);
    });
    c.on('close', () => {
      clearTimeout(tempoLimite);
      if (c !== conexao || fechado) return;
      conexao = null;
      ev.aoStatus('reconectando');
      agendar(conectar, 1500);
    });
    c.on('error', () => undefined);
  };

  const iniciar = () => {
    if (fechado) return;
    ev.aoStatus('conectando');
    peer = new Peer({ debug: 0 });
    peer.on('open', conectar);
    peer.on('error', (err: { type?: string }) => {
      if (fechado) return;
      const tipo = err?.type ?? '';
      if (tipo === 'peer-unavailable') {
        conexao = null;
        ev.aoStatus('sala-inexistente');
        agendar(conectar, 3000);
      } else if (['network', 'server-error', 'socket-error', 'socket-closed'].includes(tipo)) {
        ev.aoStatus('reconectando', tipo);
        peer?.destroy();
        agendar(iniciar, 3000);
      }
    });
    peer.on('disconnected', () => {
      if (!fechado && peer && !peer.destroyed) {
        try {
          peer.reconnect();
        } catch {
          /* ignora */
        }
      }
    });
  };
  iniciar();

  const relogio = setInterval(() => {
    if (!conexao?.open) return;
    try {
      conexao.send({ t: 'ping' } satisfies MsgConvidado);
    } catch {
      /* ignora */
    }
    if (Date.now() - ultimoContato > LIMITE_SILENCIO) {
      const c = conexao;
      conexao = null;
      c.close();
      ev.aoStatus('reconectando');
      agendar(conectar, 500);
    }
  }, INTERVALO_PING);

  // Ao voltar do segundo plano, tenta reconectar logo.
  const aoVisivel = () => {
    if (document.visibilityState === 'visible' && !conexao?.open && !fechado) agendar(conectar, 200);
  };
  document.addEventListener('visibilitychange', aoVisivel);

  return {
    enviar(m) {
      if (conexao?.open) {
        try {
          conexao.send(m);
        } catch {
          /* ignora */
        }
      }
    },
    fechar() {
      fechado = true;
      clearInterval(relogio);
      if (agendado) clearTimeout(agendado);
      document.removeEventListener('visibilitychange', aoVisivel);
      conexao?.close();
      peer?.destroy();
    },
  };
}

/* ------------------------------------------------------------------ */
/* Canal local (BroadcastChannel): duas abas do mesmo navegador.        */
/* Usado nos testes ponta a ponta e para depuração (?transporte=local). */
/* ------------------------------------------------------------------ */

type Envelope = { de: 'anfitriao' | 'convidado'; m: unknown };

export function criarAnfitriaoLocal(codigo: string, ev: EventosAnfitriao): LadoAnfitriao {
  const canal = new BroadcastChannel(idDoPeer(codigo));
  let conectado = false;
  canal.onmessage = (e: MessageEvent<Envelope>) => {
    if (e.data?.de !== 'convidado' || !ehMsgConvidado(e.data.m)) return;
    if (!conectado) {
      conectado = true;
      ev.aoStatus('conectado');
      ev.aoConvidado(true);
    }
    ev.aoReceber(e.data.m);
  };
  setTimeout(() => ev.aoStatus('pronto'), 0);
  return {
    enviar: (m) => canal.postMessage({ de: 'anfitriao', m } satisfies Envelope),
    fechar: () => canal.close(),
  };
}

export function criarConvidadoLocal(codigo: string, ev: EventosConvidado, aoAbrir: () => void): LadoConvidado {
  const canal = new BroadcastChannel(idDoPeer(codigo));
  let conectado = false;
  canal.onmessage = (e: MessageEvent<Envelope>) => {
    if (e.data?.de !== 'anfitriao' || !ehMsgAnfitriao(e.data.m)) return;
    if (!conectado) {
      conectado = true;
      ev.aoStatus('conectado');
    }
    ev.aoReceber(e.data.m);
  };
  setTimeout(() => {
    ev.aoStatus('conectando');
    aoAbrir();
  }, 0);
  // Repete o "olá" até o anfitrião responder.
  const repetir = setInterval(() => {
    if (!conectado) aoAbrir();
    else clearInterval(repetir);
  }, 700);
  return {
    enviar: (m) => canal.postMessage({ de: 'convidado', m } satisfies Envelope),
    fechar: () => {
      clearInterval(repetir);
      canal.close();
    },
  };
}
