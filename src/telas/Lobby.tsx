import { AnimatePresence, motion } from 'motion/react';
import QRCode from 'qrcode';
import { Fragment, useEffect, useState } from 'react';
import { Botao, Cartao } from '../componentes/Ui';
import type { Sessao } from '../estado/sessao';
import { MAX_TEMA_LIVRE } from '../jogo/config';
import { GENEROS, LISTA_GENEROS, TROPOS, limparTemaLivre, mesmaSugestao, rotuloSugestao } from '../jogo/generos';
import type { IdJogador, SugestaoTema } from '../jogo/tipos';

export function linkDaSala(codigo: string): string {
  const base = `${location.origin}${location.pathname}`;
  return `${base}${location.search}#/entrar/${codigo}`;
}

const EXEMPLOS_TEMA = [
  'Férias em Paris que viram caso de espionagem',
  'Um reality show de culinária numa estação espacial',
  'Contos de fadas no sertão nordestino',
  'Ladrões de joias num cruzeiro dos anos 1920',
];

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
  const conectados = !!parceiro?.conectado;
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

      {anfitriao &&
        (conectados ? (
          <p className="mt-2 text-sm text-suave">
            Sala <span className="font-titulo tracking-widest text-primaria" data-testid="codigo-exibido">{e.codigo}</span>
          </p>
        ) : (
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
        ))}

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

      <EscolhaTema sessao={sessao} />

      <div className="mt-auto flex flex-col gap-2 pt-8">
        {anfitriao ? <BotoesInicio sessao={sessao} /> : (
          <p className="text-center font-titulo text-suave italic">
            Aguardando {e.jogadores.j1?.nome} começar a aventura <Pontos />
          </p>
        )}
      </div>
    </div>
  );
}

/** Cada jogador sugere um gênero, "Surpresa" ou um tema livre. */
function EscolhaTema({ sessao }: { sessao: Sessao }) {
  const e = sessao.estado!;
  const meuId = sessao.meuId;
  const outro: IdJogador = meuId === 'j1' ? 'j2' : 'j1';
  const sugestoes = e.sugestoes ?? { j1: null, j2: null };
  const minha = sugestoes[meuId];
  const daOutra = sugestoes[outro];
  const [livreAberto, setLivreAberto] = useState(minha?.tipo === 'livre');
  const [texto, setTexto] = useState(minha?.tipo === 'livre' ? minha.texto : '');

  const escolher = (s: SugestaoTema) => {
    navigator.vibrate?.(15);
    setLivreAberto(false);
    sessao.sugerir(s);
  };
  const enviarLivre = () => {
    const t = limparTemaLivre(texto);
    if (t) sessao.sugerir({ tipo: 'livre', texto: t });
  };
  const ativo = (s: SugestaoTema) => !livreAberto && mesmaSugestao(minha, s) && (minha !== null || s.tipo === 'sortear');

  return (
    <Cartao className="mt-4" data-testid="escolha-tema">
      <h2 className="font-titulo text-lg">Tema da aventura</h2>
      <p className="text-sm text-suave">Sugira um tema. {sessao.papel === 'anfitriao' ? 'Você decide qual usar.' : `${e.jogadores.j1?.nome ?? 'Quem criou a sala'} decide qual usar.`}</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Chip ativo={ativo({ tipo: 'sortear' })} onClick={() => escolher({ tipo: 'sortear' })} testid="tema-sortear" largo>
          🎲 Surpresa <span className="text-suave/80">— sortear</span>
        </Chip>
        {[false, true].map((romance) => (
          <Fragment key={String(romance)}>
            <p className="col-span-2 mt-2 text-[0.7rem] tracking-[0.25em] text-suave uppercase">{romance ? 'Romance' : 'Aventura'}</p>
            {LISTA_GENEROS.filter((g) => !!g.romance === romance).map((g) => (
              <Chip
                key={g.id}
                ativo={!livreAberto && minha?.tipo === 'genero' && minha.genero === g.id}
                onClick={() => escolher({ tipo: 'genero', genero: g.id })}
                testid={`tema-${g.id}`}
              >
                <span className="text-lg">{g.icone}</span> {g.nome}
              </Chip>
            ))}
          </Fragment>
        ))}
        <Chip ativo={livreAberto || minha?.tipo === 'livre'} onClick={() => setLivreAberto(true)} testid="tema-livre" largo>
          ✍️ Tema livre <span className="text-suave/80">— vocês inventam</span>
        </Chip>
      </div>

      <AnimatePresence initial={false}>
        {!livreAberto && minha?.tipo === 'genero' && GENEROS[minha.genero].romance && (
          <motion.div key="tropos" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <p className="mt-4 mb-2 text-sm text-suave">Tropo romântico</p>
            <div className="flex flex-wrap gap-1.5" data-testid="tropos">
              <TropoChip ativo={!minha.tropo} onClick={() => sessao.sugerir({ tipo: 'genero', genero: minha.genero })} testid="tropo-qualquer">
                🎲 Qualquer
              </TropoChip>
              {TROPOS.map((t) => (
                <TropoChip key={t.id} ativo={minha.tropo === t.id} onClick={() => sessao.sugerir({ tipo: 'genero', genero: minha.genero, tropo: t.id })} testid={`tropo-${t.id}`}>
                  {t.nome}
                </TropoChip>
              ))}
            </div>
          </motion.div>
        )}
        {livreAberto && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <textarea
              autoFocus
              value={texto}
              onChange={(ev) => setTexto(ev.target.value.slice(0, MAX_TEMA_LIVRE))}
              rows={2}
              placeholder="Ex.: um casamento numa vila de bruxas"
              className="mt-3 w-full resize-none rounded-xl bg-black/30 p-3 text-texto outline-none placeholder:text-white/25"
              data-testid="texto-tema-livre"
            />
            <div className="mt-1 flex flex-wrap gap-1.5">
              {EXEMPLOS_TEMA.map((ex) => (
                <button key={ex} onClick={() => setTexto(ex)} className="rounded-full border border-borda px-2.5 py-1 text-[0.7rem] text-suave">
                  {ex}
                </button>
              ))}
            </div>
            <Botao variante="secundario" className="mt-3 w-full !py-2.5" disabled={!limparTemaLivre(texto)} onClick={enviarLivre} data-testid="sugerir-tema-livre">
              {minha?.tipo === 'livre' && minha.texto === limparTemaLivre(texto) ? 'Sugerido ✓' : 'Sugerir este tema'}
            </Botao>
          </motion.div>
        )}
      </AnimatePresence>

      <ConteudoAdulto sessao={sessao} />

      <div className="mt-4 space-y-1.5 border-t border-borda pt-3 text-sm" data-testid="sugestoes">
        <LinhaSugestao nome="Você" sugestao={minha} />
        {e.jogadores[outro] && <LinhaSugestao nome={e.jogadores[outro]!.nome} sugestao={daOutra} />}
      </div>
    </Cartao>
  );
}

function TropoChip({ ativo, onClick, children, testid }: { ativo: boolean; onClick: () => void; children: React.ReactNode; testid: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={ativo}
      data-testid={testid}
      className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${ativo ? 'border-secundaria bg-secundaria/20 text-texto' : 'border-borda text-suave'}`}
    >
      {children}
    </button>
  );
}

/** Anfitrião liga o modo 18+ (com confirmação); o convidado só vê o estado. */
function ConteudoAdulto({ sessao }: { sessao: Sessao }) {
  const adulto = !!sessao.estado?.adulto;
  if (!sessao.definirAdulto) {
    return adulto ? (
      <p className="mt-4 rounded-xl bg-rose-500/15 px-3 py-2 text-sm text-rose-100" data-testid="aviso-adulto">
        🔞 Conteúdo adulto ativado nesta sala
      </p>
    ) : null;
  }
  const alternar = () => {
    if (adulto) return sessao.definirAdulto!(false);
    if (confirm('Conteúdo adulto (18+): romance sensual, linguagem forte e temas maduros, sem cenas explícitas. Vocês dois confirmam que são maiores de 18 anos?')) {
      sessao.definirAdulto!(true);
    }
  };
  return (
    <label className="mt-4 flex items-center gap-3 rounded-xl border border-borda bg-white/[0.03] px-3 py-2.5">
      <input type="checkbox" className="h-5 w-5 accent-[var(--primaria)]" checked={adulto} onChange={alternar} data-testid="modo-adulto" />
      <span className="text-sm">
        🔞 Conteúdo adulto (18+)
        <span className="block text-xs text-suave">Romance sensual e temas maduros; cenas íntimas sem descrição explícita.</span>
      </span>
    </label>
  );
}

function LinhaSugestao({ nome, sugestao }: { nome: string; sugestao: SugestaoTema | null }) {
  return (
    <p className="flex gap-2">
      <span className="shrink-0 text-suave">{nome}:</span>
      <AnimatePresence mode="wait">
        <motion.span key={rotuloSugestao(sugestao)} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="min-w-0 break-words">
          {sugestao ? rotuloSugestao(sugestao) : <span className="text-suave/60 italic">ainda não sugeriu (surpresa)</span>}
        </motion.span>
      </AnimatePresence>
    </p>
  );
}

function BotoesInicio({ sessao }: { sessao: Sessao }) {
  const e = sessao.estado!;
  const parceiro = e.jogadores.j2;
  const { j1, j2 } = e.sugestoes ?? { j1: null, j2: null };
  if (!parceiro?.conectado) {
    return (
      <Botao className="w-full" disabled data-testid="comecar">
        Esperando seu par…
      </Botao>
    );
  }
  if (mesmaSugestao(j1, j2)) {
    return (
      <Botao className="w-full" onClick={() => sessao.iniciar?.('j1')} data-testid="comecar">
        Começar: <span className="font-normal">{rotuloSugestao(j1 ?? j2)}</span>
      </Botao>
    );
  }
  return (
    <>
      <p className="text-center text-xs tracking-widest text-suave uppercase">Vocês sugeriram temas diferentes</p>
      <Botao className="w-full" onClick={() => sessao.iniciar?.('j1')} data-testid="comecar-j1">
        <span className="line-clamp-2">Usar a minha: <span className="font-normal">{rotuloSugestao(j1)}</span></span>
      </Botao>
      <Botao className="w-full" onClick={() => sessao.iniciar?.('j2')} data-testid="comecar-j2">
        <span className="line-clamp-2">Usar a de {parceiro.nome}: <span className="font-normal">{rotuloSugestao(j2)}</span></span>
      </Botao>
      <Botao variante="secundario" className="w-full" onClick={() => sessao.iniciar?.('sortearEntre')} data-testid="sortear-entre">
        🎲 Sortear entre as duas
      </Botao>
    </>
  );
}

function Chip({ ativo, onClick, children, testid, largo }: { ativo: boolean; onClick: () => void; children: React.ReactNode; testid: string; largo?: boolean }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      aria-pressed={ativo}
      data-testid={testid}
      className={`flex items-center gap-1.5 rounded-2xl border px-3 py-2.5 text-left text-sm leading-tight transition-colors ${largo ? 'col-span-2' : ''} ${
        ativo ? 'border-primaria bg-primaria/15 text-texto shadow-[0_0_24px_-10px_var(--primaria)]' : 'border-borda bg-white/[0.04] text-texto/85'
      }`}
    >
      {children}
    </motion.button>
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
