import { useState } from 'react';
import { Botao, Campo, Cartao, TelaBase, Voltar } from '../componentes/Ui';
import { armazenamento } from '../estado/armazenamento';
import { lerParametros } from '../jogo/config';

export function CriarSala({ aoVoltar, aoCriar }: { aoVoltar: () => void; aoCriar: (nome: string, demo: boolean) => void }) {
  const [nome, setNome] = useState(armazenamento.nome());
  const [chave, setChave] = useState(armazenamento.chaveApi());
  const [demo, setDemo] = useState(lerParametros().iaSimulada);
  const [testando, setTestando] = useState(false);
  const [erro, setErro] = useState('');
  const temChaveSalva = !!armazenamento.chaveApi();

  const criar = async () => {
    setErro('');
    if (!nome.trim()) return setErro('Diga seu nome.');
    armazenamento.salvarNome(nome);
    if (demo) return aoCriar(nome.trim(), true);
    if (!chave.trim().startsWith('sk-')) return setErro('Cole uma chave de API válida (começa com “sk-”) ou use o modo demonstração.');
    if (chave.trim() !== armazenamento.chaveApi()) {
      setTestando(true);
      const { testarChave } = await import('../ia/claude');
      const r = await testarChave(chave.trim());
      setTestando(false);
      if (!r.ok) return setErro(r.erro);
      armazenamento.salvarChaveApi(chave);
    }
    aoCriar(nome.trim(), false);
  };

  return (
    <TelaBase>
      <Voltar onClick={aoVoltar} />
      <h1 className="font-titulo text-3xl font-extrabold">Criar sala</h1>
      <p className="mt-2 text-suave">Este celular vai narrar a história e criar o código para o seu par entrar.</p>

      <div className="mt-7 flex flex-col gap-5">
        <Campo
          rotulo="Seu nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          maxLength={24}
          autoComplete="given-name"
          placeholder="Como o narrador vai te chamar"
          data-testid="nome-anfitriao"
        />

        {!demo && (
          <Cartao className="!p-4">
            {temChaveSalva && chave === armazenamento.chaveApi() ? (
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-suave">
                  🔑 Chave da API salva neste aparelho <span className="text-texto/70">(…{chave.slice(-4)})</span>
                </p>
                <button className="text-sm text-primaria" onClick={() => setChave('')}>
                  Trocar
                </button>
              </div>
            ) : (
              <Campo
                rotulo="Chave da API da Anthropic"
                type="password"
                value={chave}
                onChange={(e) => setChave(e.target.value)}
                placeholder="sk-ant-…"
                autoComplete="off"
                spellCheck={false}
                dica={
                  <>
                    Crie em <a className="text-primaria underline" href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer">console.anthropic.com</a>.
                    Fica salva só neste celular e vai direto para a API da Anthropic. Defina um limite de gasto no Console.
                  </>
                }
              />
            )}
          </Cartao>
        )}

        <label className="flex items-start gap-3 rounded-2xl border border-borda bg-white/5 p-4">
          <input type="checkbox" className="mt-1 h-5 w-5 accent-[var(--primaria)]" checked={demo} onChange={(e) => setDemo(e.target.checked)} data-testid="modo-demo" />
          <span>
            <span className="block font-titulo">Modo demonstração</span>
            <span className="text-sm text-suave">Sem IA: uma história de exemplo para testar a conexão entre os celulares.</span>
          </span>
        </label>

        {erro && (
          <p className="rounded-2xl bg-rose-500/15 px-4 py-3 text-sm text-rose-200" role="alert">
            {erro}
          </p>
        )}
      </div>

      <div className="mt-auto pt-8">
        <Botao className="w-full" onClick={criar} disabled={testando} data-testid="confirmar-criar">
          {testando ? 'Verificando a chave…' : 'Abrir a sala'}
        </Botao>
      </div>
    </TelaBase>
  );
}
