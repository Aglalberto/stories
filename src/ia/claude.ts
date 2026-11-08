import Anthropic from '@anthropic-ai/sdk';
import { MODELO } from '../jogo/config';
import { PROMPT_SISTEMA } from './prompt';
import { ErroGeracao, type GeradorHistoria, type PedidoGeracao } from './gerador';

/**
 * Gerador real usando o SDK oficial no navegador.
 * A chave fica só no aparelho de quem criou a sala (localStorage) e vai
 * direto para a API da Anthropic; o SDK exige `dangerouslyAllowBrowser`
 * para permitir esse uso, ciente de que a chave fica exposta naquele aparelho.
 */
export function criarGeradorClaude(apiKey: string): GeradorHistoria {
  const cliente = new Anthropic({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 2 });

  return {
    async gerar(pedido: PedidoGeracao, aoParcial, sinal) {
      const messages: Anthropic.Beta.BetaMessageParam[] = [
        ...pedido.historico.map((t) => ({ role: t.role, content: t.content })),
        { role: 'user', content: pedido.mensagem },
      ];
      try {
        const stream = cliente.beta.messages.stream(
          {
            model: MODELO,
            max_tokens: 8000,
            // Sem raciocínio estendido: queremos o primeiro trecho de texto o quanto antes.
            thinking: { type: 'between_tools' },
            // Cache automático: cada capítulo reaproveita o prefixo do anterior.
            cache_control: { type: 'ephemeral' },
            system: PROMPT_SISTEMA,
            messages,
            // Se um filtro de segurança recusar um trecho, a API tenta outro modelo na mesma chamada.
            betas: ['server-side-fallback-2026-07-01'],
            fallbacks: 'default',
          },
          { signal: sinal },
        );

        let acumulado = '';
        for await (const ev of stream) {
          if (ev.type === 'content_block_delta' && ev.delta.type === 'text_delta') {
            acumulado += ev.delta.text;
            aoParcial(acumulado);
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === 'refusal') {
          throw new ErroGeracao('A IA preferiu não continuar este trecho. Tente de novo ou escolha outra ação.');
        }
        return acumulado;
      } catch (e) {
        throw traduzirErro(e);
      }
    },
  };
}

export function traduzirErro(e: unknown): Error {
  if (e instanceof ErroGeracao) return e;
  if (e instanceof Anthropic.APIUserAbortError) return new ErroGeracao('Geração cancelada.');
  if (e instanceof Anthropic.AuthenticationError)
    return new ErroGeracao('Chave de API inválida. Confira a chave nas configurações.', false);
  if (e instanceof Anthropic.PermissionDeniedError)
    return new ErroGeracao('Esta chave não tem permissão para usar o modelo. Verifique sua conta na Anthropic.', false);
  if (e instanceof Anthropic.RateLimitError)
    return new ErroGeracao('Muitas requisições ou limite de gasto atingido. Aguarde um pouco e tente de novo.');
  if (e instanceof Anthropic.BadRequestError) {
    const msg = String(e.message || '');
    if (/credit|billing|balance/i.test(msg))
      return new ErroGeracao('Sem créditos na conta da API. Adicione créditos no Console da Anthropic.', false);
    return new ErroGeracao(`A API recusou o pedido: ${msg.slice(0, 160)}`);
  }
  if (e instanceof Anthropic.InternalServerError)
    return new ErroGeracao('A API está instável no momento. Tente de novo em instantes.');
  if (e instanceof Anthropic.APIConnectionError)
    return new ErroGeracao('Sem conexão com a API. Verifique a internet deste celular.');
  if (e instanceof Anthropic.APIError) return new ErroGeracao(`Erro da API: ${String(e.message).slice(0, 160)}`);
  return new ErroGeracao(e instanceof Error ? e.message : 'Erro inesperado ao gerar o capítulo.');
}

/** Faz uma chamada mínima para validar a chave. */
export async function testarChave(apiKey: string): Promise<{ ok: true } | { ok: false; erro: string }> {
  try {
    const cliente = new Anthropic({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 0 });
    await cliente.models.retrieve(MODELO);
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: traduzirErro(e).message };
  }
}
