import { describe, expect, it } from 'vitest';
import { ErroFormato, extrairParcial, extrairTag, interpretarResposta } from './parser';

const nomes = { j1: 'Ana', j2: 'Beto' };

const respostaCap1 = `<titulo>A Torre Partida</titulo>
<narracao>Ana e Beto chegaram às ruínas.

— Cuidado — disse Beto.</narracao>
<cena_j1>Você ouve um sussurro.</cena_j1>
<cena_j2>Você vê um brilho.</cena_j2>
<dados>{"titulo_historia":"O Mapa Vivo","personagens":{"j1":{"nome":"Ana","papel":"Cartógrafa","descricao":"Curiosa."},"j2":{"nome":"Beto","papel":"Ladrão","descricao":"Ágil."}},
"opcoes_j1":[{"texto":"Subir a torre","estilo":"ousadia"},{"texto":"Ler as runas","estilo":"astucia"},{"texto":"Proteger Beto","estilo":"cuidado"}],
"opcoes_j2":[{"texto":"Pular o muro","estilo":"ousadia"},{"texto":"Distrair o guarda","estilo":"astucia"},{"texto":"Esperar Ana","estilo":"cuidado"}]}</dados>`;

describe('extrairTag', () => {
  it('extrai tag fechada', () => {
    expect(extrairTag('<a> oi </a>', 'a')).toEqual({ conteudo: 'oi', fechada: true });
  });
  it('extrai tag aberta durante o streaming e remove fechamento parcial', () => {
    expect(extrairTag('<narracao>Era uma vez</narr', 'narracao')).toEqual({ conteudo: 'Era uma vez', fechada: false });
  });
  it('retorna null se a tag não começou', () => {
    expect(extrairTag('<titulo>x</titulo>', 'narracao')).toBeNull();
  });
});

describe('extrairParcial', () => {
  it('mostra título e narração conforme chegam', () => {
    expect(extrairParcial('<titulo>Noite</ti')).toEqual({ titulo: 'Noite', narracao: '' });
    expect(extrairParcial('<titulo>Noite</titulo>\n<narracao>A chuva cai')).toEqual({ titulo: 'Noite', narracao: 'A chuva cai' });
  });
});

describe('interpretarResposta', () => {
  it('interpreta o capítulo 1 completo', () => {
    const r = interpretarResposta(respostaCap1, { numero: 1, epilogo: false, nomes });
    expect(r.titulo).toBe('A Torre Partida');
    expect(r.narracao).toContain('— Cuidado');
    expect(r.cenas).toEqual({ j1: 'Você ouve um sussurro.', j2: 'Você vê um brilho.' });
    expect(r.opcoes.j1).toHaveLength(3);
    expect(r.opcoes.j1[0]).toEqual({ id: 'c1-j1-0', texto: 'Subir a torre', estilo: 'ousadia' });
    expect(r.tituloHistoria).toBe('O Mapa Vivo');
    expect(r.personagens?.j2.papel).toBe('Ladrão');
    expect(r.efeitos).toBeNull();
    expect(r.final).toBeNull();
  });

  it('aceita JSON dentro de cerca de código e estilos ausentes', () => {
    const texto = `<titulo>T</titulo><narracao>N</narracao><cena_j1>a</cena_j1><cena_j2>b</cena_j2>
<dados>\`\`\`json
{"opcoes_j1":["Correr","Pensar","Abraçar"],"opcoes_j2":[{"texto":"X"},{"texto":"Y"}],"efeitos":{"vigor_j1":-2,"vigor_j2":"1","sintonia":1,"missao":10,"resumo":"Ok"}}
\`\`\`</dados>`;
    const r = interpretarResposta(texto, { numero: 3, epilogo: false, nomes });
    expect(r.opcoes.j1.map((o) => o.estilo)).toEqual(['ousadia', 'astucia', 'cuidado']);
    expect(r.opcoes.j2).toHaveLength(2);
    expect(r.efeitos).toEqual({ vigor: { j1: -2, j2: 1 }, sintonia: 1, missao: 10, resumo: 'Ok' });
    expect(r.personagens).toBeNull();
  });

  it('interpreta o epílogo sem opções', () => {
    const texto = `<titulo>Fim</titulo><narracao>Acabou.</narracao><cena_j1></cena_j1><cena_j2></cena_j2>
<dados>{"opcoes_j1":[],"opcoes_j2":[],"efeitos":{"vigor_j1":0,"vigor_j2":0,"sintonia":2,"missao":20,"resumo":"Vitória"},"final":"trágico"}</dados>`;
    const r = interpretarResposta(texto, { numero: 8, epilogo: true, nomes });
    expect(r.final).toBe('tragico');
    expect(r.opcoes.j1).toEqual([]);
  });

  it('falha com formato inválido', () => {
    expect(() => interpretarResposta('texto solto', { numero: 1, epilogo: false, nomes })).toThrow(ErroFormato);
    expect(() =>
      interpretarResposta('<narracao>x</narracao><dados>{quebrado</dados>', { numero: 2, epilogo: false, nomes }),
    ).toThrow(ErroFormato);
    expect(() =>
      interpretarResposta('<narracao>x</narracao><dados>{"opcoes_j1":["a"],"opcoes_j2":["b"]}</dados>', { numero: 2, epilogo: false, nomes }),
    ).toThrow(/Opções/);
  });
});
