import { useState } from 'react';
import { Botao, Campo, TelaBase, Voltar } from '../componentes/Ui';
import { armazenamento } from '../estado/armazenamento';
import { normalizarCodigo } from '../jogo/generos';

export function EntrarSala({
  codigoInicial,
  aoVoltar,
  aoEntrar,
}: {
  codigoInicial: string;
  aoVoltar: () => void;
  aoEntrar: (codigo: string, nome: string) => void;
}) {
  const [codigo, setCodigo] = useState(codigoInicial);
  const [nome, setNome] = useState(armazenamento.nome());
  const [erro, setErro] = useState('');

  const entrar = () => {
    const c = normalizarCodigo(codigo);
    if (c.length < 4) return setErro('Digite o código que aparece no celular do seu par.');
    if (!nome.trim()) return setErro('Diga seu nome.');
    armazenamento.salvarNome(nome);
    aoEntrar(c, nome.trim());
  };

  return (
    <TelaBase>
      <Voltar onClick={aoVoltar} />
      <h1 className="font-titulo text-3xl font-extrabold">Entrar na sala</h1>
      <p className="mt-2 text-suave">Digite o código mostrado no celular de quem criou a sala, ou aponte a câmera para o QR code.</p>
      <div className="mt-7 flex flex-col gap-5">
        <Campo
          rotulo="Código da sala"
          value={codigo}
          onChange={(e) => setCodigo(normalizarCodigo(e.target.value))}
          placeholder="K7QF2"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          inputMode="text"
          className="w-full rounded-2xl border border-borda bg-black/30 px-4 py-3.5 text-center font-titulo text-3xl tracking-[0.35em] text-primaria outline-none placeholder:text-white/20 focus:border-primaria"
          data-testid="codigo-sala"
        />
        <Campo
          rotulo="Seu nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          maxLength={24}
          autoComplete="given-name"
          placeholder="Como o narrador vai te chamar"
          data-testid="nome-convidado"
        />
        {erro && (
          <p className="rounded-2xl bg-rose-500/15 px-4 py-3 text-sm text-rose-200" role="alert">
            {erro}
          </p>
        )}
      </div>
      <div className="mt-auto pt-8">
        <Botao className="w-full" onClick={entrar} data-testid="confirmar-entrar">
          Entrar
        </Botao>
      </div>
    </TelaBase>
  );
}
