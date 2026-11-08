import { useState } from 'react';
import { Botao, Campo, Cartao, TelaBase, Voltar } from '../componentes/Ui';
import { armazenamento, type Preferencias } from '../estado/armazenamento';
import { NOME_MODELO } from '../jogo/config';

export function Configuracoes({ aoVoltar, aoMudarPrefs }: { aoVoltar: () => void; aoMudarPrefs: (p: Preferencias) => void }) {
  const [chave, setChave] = useState('');
  const [salva, setSalva] = useState(armazenamento.chaveApi());
  const [msg, setMsg] = useState('');
  const [testando, setTestando] = useState(false);
  const [prefs, setPrefs] = useState(armazenamento.prefs());

  const salvar = async () => {
    setMsg('');
    setTestando(true);
    const { testarChave } = await import('../ia/claude');
    const r = await testarChave(chave.trim());
    setTestando(false);
    if (!r.ok) return setMsg(`❌ ${r.erro}`);
    armazenamento.salvarChaveApi(chave);
    setSalva(chave.trim());
    setChave('');
    setMsg('✅ Chave verificada e salva neste aparelho.');
  };

  const mudarVelocidade = (velocidade: Preferencias['velocidade']) => {
    const p = { ...prefs, velocidade };
    setPrefs(p);
    armazenamento.salvarPrefs(p);
    aoMudarPrefs(p);
  };

  return (
    <TelaBase>
      <Voltar onClick={aoVoltar} />
      <h1 className="font-titulo text-3xl font-extrabold">Configurações</h1>

      <Cartao className="mt-6">
        <h2 className="font-titulo text-lg">Chave da API</h2>
        <p className="mt-1 text-sm text-suave">
          Só o celular que cria a sala precisa dela. Modelo usado: <strong className="text-texto">{NOME_MODELO}</strong>.
        </p>
        {salva ? (
          <div className="mt-3 flex items-center justify-between rounded-2xl bg-black/30 px-4 py-3 text-sm">
            <span>🔑 …{salva.slice(-6)}</span>
            <button
              className="text-rose-300"
              onClick={() => {
                armazenamento.salvarChaveApi('');
                setSalva('');
                setMsg('Chave removida deste aparelho.');
              }}
            >
              Remover
            </button>
          </div>
        ) : null}
        <div className="mt-4 flex flex-col gap-3">
          <Campo rotulo={salva ? 'Trocar chave' : 'Nova chave'} type="password" value={chave} onChange={(e) => setChave(e.target.value)} placeholder="sk-ant-…" autoComplete="off" spellCheck={false} />
          <Botao variante="secundario" disabled={!chave.trim() || testando} onClick={salvar}>
            {testando ? 'Verificando…' : 'Verificar e salvar'}
          </Botao>
          {msg && <p className="text-sm text-suave">{msg}</p>}
        </div>
      </Cartao>

      <Cartao className="mt-4">
        <h2 className="font-titulo text-lg">Velocidade do texto</h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {(['lenta', 'normal', 'rapida'] as const).map((v) => (
            <button
              key={v}
              onClick={() => mudarVelocidade(v)}
              className={`rounded-xl border px-3 py-2.5 text-sm capitalize ${prefs.velocidade === v ? 'border-primaria bg-primaria/15 text-primaria' : 'border-borda text-suave'}`}
            >
              {v === 'rapida' ? 'rápida' : v}
            </button>
          ))}
        </div>
      </Cartao>

      <p className="mt-6 px-2 text-xs leading-relaxed text-suave/70">
        Este site é estático: não existe servidor próprio. A chave fica guardada apenas no navegador deste aparelho e é enviada só para a API da
        Anthropic. Os dois celulares conversam diretamente (WebRTC); o servidor público do PeerJS só ajuda a apresentá-los.
      </p>
    </TelaBase>
  );
}
