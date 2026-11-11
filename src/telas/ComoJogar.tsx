import { Cartao, TelaBase, Voltar } from '../componentes/Ui';
import { TOTAL_CAPITULOS } from '../jogo/config';

const PASSOS = [
  ['📱', 'Um celular cria a sala', 'Quem tem a chave da API cria a sala. O outro entra pelo código ou pelo QR code.'],
  ['🎨', 'Vocês escolhem o tema', 'Cada um sugere: fantasia, ficção científica, noir, terror, piratas, pós-apocalipse, um tema inventado por vocês ou “Surpresa” para sortear. Quem criou a sala decide.'],
  ['📖', `${TOTAL_CAPITULOS} capítulos + epílogo`, 'A IA escreve cada capítulo na hora, a partir do que vocês decidiram. Uma partida leva uns 20 a 30 minutos.'],
  ['🤫', 'Cenas secretas', 'Cada um recebe um trecho que só ele vê. Contem um ao outro — ou não.'],
  ['🎭', 'Cada um decide por si', 'Escolha uma das três opções ou escreva sua própria ação. A escolha do par só aparece quando os dois decidirem.'],
  ['❤️', 'Medidores', 'Vigor de cada um, Sintonia da dupla e progresso da Missão definem o desfecho: triunfo, agridoce ou trágico.'],
] as const;

export function ComoJogar({ aoVoltar }: { aoVoltar: () => void }) {
  return (
    <TelaBase>
      <Voltar onClick={aoVoltar} />
      <h1 className="font-titulo text-3xl font-extrabold">Como jogar</h1>
      <div className="mt-6 flex flex-col gap-3">
        {PASSOS.map(([icone, titulo, texto], i) => (
          <Cartao key={titulo} className="flex gap-4 !p-4" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
            <span className="text-3xl">{icone}</span>
            <div>
              <h2 className="font-titulo text-lg">{titulo}</h2>
              <p className="text-sm leading-relaxed text-suave">{texto}</p>
            </div>
          </Cartao>
        ))}
      </div>
      <p className="mt-6 px-2 text-sm leading-relaxed text-suave">
        Dica: a conexão entre os celulares funciona melhor na mesma rede Wi-Fi. Mantenham a tela ligada durante a partida.
      </p>
    </TelaBase>
  );
}
