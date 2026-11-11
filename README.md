# Livro-Jogo a Dois

Aventura interativa **cooperativa** para um casal: cada pessoa joga no próprio celular, cada uma decide pelo próprio personagem, e a história é escrita na hora pela IA (Claude Sonnet 5.5), em português do Brasil.

**Jogar:** https://aglalberto.github.io/stories/

## Como funciona

1. Um celular **cria a sala** e mostra um código e um QR code. É ele que narra a história, então precisa da chave da API da Anthropic.
2. O outro celular **entra na sala** pelo código ou pelo QR code.
3. **Cada um sugere um tema** na sala de espera:
   - um dos 6 gêneros (Fantasia Épica, Ficção Científica, Mistério Noir, Terror Sobrenatural, Aventura Pirata ou Pós-Apocalipse);
   - 🎲 **Surpresa**, para sortear (sem repetir o gênero da partida anterior);
   - ✍️ **tema livre**, digitado por vocês (ex.: “Férias em Paris que viram espionagem”). Nesse caso, a IA inventa o cenário e escolhe o clima visual mais próximo para o fundo animado.

   Quem criou a sala vê as duas sugestões e começa com uma delas ou sorteia entre as duas. Nos gêneros prontos, também são sorteados o cenário inicial, um elemento misterioso e o objetivo da dupla.
4. São **7 capítulos com escolhas e um epílogo** (cerca de 20 a 30 minutos). Em cada capítulo:
   - uma narração compartilhada aparece com efeito de máquina de escrever, em streaming;
   - cada um recebe uma **cena secreta** ("Só você vê");
   - cada um escolhe uma de três opções (⚔️ ousadia, 🦊 astúcia, 🛡️ cuidado) ou escreve uma **ação livre**;
   - a escolha do par só é revelada quando os dois decidem.
5. Os **medidores** são o vigor de cada um (0–10), a sintonia da dupla (0–10) e o progresso da missão (0–100%). Eles definem o desfecho: 🏆 triunfo, 🌗 agridoce ou 🥀 trágico. Se o vigor de alguém zerar, a história vai para o epílogo depois de uma última escolha.
6. No fim dá para ler o livro completo e compartilhar ou baixar a história.

Também há um **modo demonstração**, sem IA e sem chave, para testar a conexão entre os celulares.

## Arquitetura (100% estática)

- **Sem servidor próprio e sem segredos no repositório.**
- **IA:** o SDK oficial `@anthropic-ai/sdk` roda no navegador do anfitrião com `dangerouslyAllowBrowser: true`. A chave é digitada no celular, fica só no `localStorage` dele e é enviada apenas para a API da Anthropic. Recomenda-se criar uma chave exclusiva e definir um limite de gasto no Console.
  - Modelo: `claude-sonnet-5-5`, em streaming, sem raciocínio estendido para o texto começar a aparecer logo.
  - O pedido usa cache automático de prompt: cada capítulo reaproveita o histórico já enviado.
  - Fallback no servidor (`fallbacks: "default"`) caso um filtro de segurança recuse um trecho.
  - A resposta vem em tags (`<titulo>`, `<narracao>`, `<cena_j1>`, `<cena_j2>`, `<dados>{JSON}</dados>`). A narração é exibida enquanto chega; o JSON traz opções, efeitos nos medidores e personagens. Os efeitos são limitados no código para manter o jogo justo.
- **Rede:** WebRTC com [PeerJS](https://peerjs.com/). O servidor público gratuito do PeerJS só apresenta os dois aparelhos; depois os dados vão direto de um celular ao outro. O anfitrião guarda o estado oficial do jogo e envia tudo ao convidado. Há reconexão automática, e o anfitrião salva a partida no aparelho, então dá para recarregar a página e continuar.
- **Visual:** React, Tailwind CSS 4 e `motion`. Os cenários animados de cada gênero usam só `transform`/`opacity`, para manter 60 fps.

## Desenvolvimento

```bash
npm install
npm run dev        # servidor local
npm test           # testes unitários (vitest)
npm run build      # build de produção em dist/
npm run e2e        # teste ponta a ponta (Playwright) — requer build
```

Parâmetros de URL úteis para testes:

| Parâmetro | Efeito |
|---|---|
| `?ia=simulada` | narrador de exemplo, sem chamar a API |
| `?transporte=local` | conecta duas abas do mesmo navegador (BroadcastChannel) em vez de WebRTC |
| `?rapido=1` | texto e animações instantâneos |

O teste ponta a ponta abre dois "celulares" e joga uma partida completa com `?transporte=local&ia=simulada&rapido=1`.

## Publicação

O workflow `.github/workflows/deploy.yml` roda a cada push: checagem de tipos, testes unitários, build e teste ponta a ponta. Pushes no branch padrão também publicam no GitHub Pages.

Para ativar uma única vez: **Settings › Pages › Source: GitHub Actions**.

## Estrutura

```
src/
  jogo/      tipos, gêneros e sementes, motor de regras (puro), livro
  ia/        prompt, parser das respostas, cliente Claude e narrador simulado
  rede/      protocolo e transportes (PeerJS e canal local)
  estado/    hooks do anfitrião e do convidado, armazenamento local
  componentes/  cenário animado, máquina de escrever, medidores, roleta
  telas/     início, criar/entrar, sala, capítulo, livro completo
e2e/         teste Playwright com dois celulares
```
