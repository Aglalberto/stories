import { motion } from 'motion/react';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { Botao, Cartao } from '../componentes/Ui';
import type { Sessao } from '../estado/sessao';

export function linkDaSala(codigo: string): string {
  const base = `${location.origin}${location.pathname}`;
  return `${base}${location.search}#/entrar/${codigo}`;
}

function QrSala({ codigo }: { codigo: string }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    QRCode.toDataURL(linkDaSala(codigo), { margin: 1, width: 360, color: { dark: '#1a1208', light: '#fbf3e2' } })
      .then(setUrl)
      .catch(() => setUrl(''));
  }, [codigo]);
  if (!url) return <div className="h-44 w-44 animate-pulse rounded-2xl bg-white/10" />;
  return <img src={url} alt={`QR code para entrar na sala ${codigo}`} className="h-44 w-44 rounded-2xl" />;
}

export function Lobby({ sessao }: { sessao: Sessao }) {
  const e = sessao.estado!;
  const anfitriao = sessao.papel === 'anfitriao';
  const parceiro = e.jogadores.j2;
  const [copiado, setCopiado] = useState(false);

  const compartilhar = async () => {
    const url = linkDaSala(e.codigo);
    try {
      if (navigator.share) await navigator.share({ title: 'Livro-Jogo a Dois', text: `Entra na minha sala: ${e.codigo}`, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      }
    } catch {
      /* usuário cancelou */
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <h1 className="font-titulo text-3xl font-extrabold">{anfitriao ? 'Sua sala está aberta' : 'Você está na sala'}</h1>
      {sessao.demo && <p className="mt-1 text-sm text-secundaria">Modo demonstração — sem IA</p>}

      {anfitriao && (
        <Cartao className="mt-6 flex flex-col items-center text-center" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <p className="text-sm tracking-widest text-suave uppercase">Código da sala</p>
          <p className="my-2 font-titulo text-5xl font-extrabold tracking-[0.25em] text-primaria" data-testid="codigo-exibido">
            {e.codigo}
          </p>
          <QrSala codigo={e.codigo} />
          <button onClick={compartilhar} className="mt-4 text-sm text-primaria underline underline-offset-4">
            {copiado ? 'Link copiado!' : 'Enviar link para o meu par'}
          </button>
        </Cartao>
      )}

      <Cartao className="mt-4 flex flex-col gap-3">
        <Linha nome={e.jogadores.j1?.nome ?? ''} rotulo="narra a história" ok />
        {parceiro ? (
          <Linha nome={parceiro.nome} rotulo={parceiro.conectado ? 'conectado(a)' : 'reconectando…'} ok={parceiro.conectado} />
        ) : (
          <div className="flex items-center gap-3 text-suave">
            <Pontos />
            <span>Esperando seu par entrar…</span>
          </div>
        )}
      </Cartao>

      <div className="mt-auto pt-8">
        {anfitriao ? (
          <Botao className="w-full" disabled={!parceiro?.conectado} onClick={sessao.sortear} data-testid="sortear">
            🎲 Sortear a aventura
          </Botao>
        ) : (
          <p className="text-center font-titulo text-suave italic">
            Aguardando {e.jogadores.j1?.nome} sortear a aventura <Pontos />
          </p>
        )}
      </div>
    </div>
  );
}

function Linha({ nome, rotulo, ok }: { nome: string; rotulo: string; ok: boolean }) {
  return (
    <motion.div className="flex items-center gap-3" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
      <span className={`flex h-10 w-10 items-center justify-center rounded-full font-titulo text-lg ${ok ? 'bg-primaria text-[#1a1208]' : 'bg-white/10'}`}>
        {nome.slice(0, 1).toUpperCase()}
      </span>
      <div>
        <p className="font-titulo text-lg leading-tight">{nome}</p>
        <p className="text-xs text-suave">{rotulo}</p>
      </div>
    </motion.div>
  );
}

export function Pontos() {
  return (
    <span className="inline-flex gap-1 align-middle">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-current"
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </span>
  );
}
