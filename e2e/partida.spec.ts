import { expect, test, type Page } from '@playwright/test';

// Dois "celulares" no mesmo navegador: o canal local (BroadcastChannel)
// substitui o WebRTC e o narrador simulado substitui a IA.
const URL_TESTE = './?transporte=local&ia=simulada&rapido=1';

async function escolher(p: Page, numero: number, livre?: string) {
  const cap = p.getByTestId(`capitulo-${numero}`);
  await expect(cap.getByTestId('opcoes')).toBeVisible({ timeout: 20_000 });
  await expect(cap.getByTestId('cena-privada')).toBeVisible();
  if (livre) {
    await cap.getByText('Outra ação…').click();
    await cap.getByTestId('acao-livre').fill(livre);
  } else {
    await cap.getByTestId('opcao').first().click();
  }
  await cap.getByTestId('confirmar-escolha').click();
}

async function abrirSala(browser: import('@playwright/test').Browser) {
  const contexto = await browser.newContext();
  const ana = await contexto.newPage();
  const beto = await contexto.newPage();

  await ana.goto(URL_TESTE);
  await ana.getByTestId('criar-sala').click();
  await ana.getByTestId('nome-anfitriao').fill('Ana');
  await expect(ana.getByTestId('modo-demo')).toBeChecked();
  await ana.getByTestId('confirmar-criar').click();
  const codigo = (await ana.getByTestId('codigo-exibido').textContent())!.trim();
  expect(codigo).toMatch(/^[A-Z0-9]{5}$/);

  await beto.goto(URL_TESTE);
  await beto.getByTestId('entrar-sala').click();
  await beto.getByTestId('codigo-sala').fill(codigo.toLowerCase());
  await beto.getByTestId('nome-convidado').fill('Beto');
  await beto.getByTestId('confirmar-entrar').click();
  await expect(beto.getByText('Aguardando Ana começar a aventura')).toBeVisible();
  await expect(ana.getByTestId('escolha-tema')).toBeVisible();
  return { contexto, ana, beto };
}

test('um casal joga uma partida completa, cada um no seu celular', async ({ browser }) => {
  const { contexto, ana, beto } = await abrirSala(browser);

  // Cada um sugere um tema; Ana (anfitriã) decide usar o tema livre do Beto.
  await beto.getByTestId('tema-livre').click();
  await beto.getByTestId('texto-tema-livre').fill('Férias em Paris que viram espionagem');
  await beto.getByTestId('sugerir-tema-livre').click();
  await ana.getByTestId('tema-terror').click();
  await expect(ana.getByTestId('sugestoes')).toContainText('Férias em Paris que viram espionagem');
  await expect(beto.getByTestId('sugestoes')).toContainText('Terror Sobrenatural');
  await ana.getByTestId('comecar-j2').click();

  // O tema escolhido aparece igual nos dois aparelhos.
  for (const p of [ana, beto]) {
    await expect(p.getByTestId('tema-escolhido')).toHaveText('“Férias em Paris que viram espionagem”');
  }

  for (let n = 1; n <= 7; n++) {
    await escolher(ana, n);
    // A escolha de um só aparece para o outro quando os dois decidirem.
    await expect(ana.getByTestId(`capitulo-${n}`).getByTestId('aguardando-parceiro')).toBeVisible();
    await escolher(beto, n, n === 2 ? 'Tocar a flauta encantada' : undefined);
  }

  for (const p of [ana, beto]) {
    await expect(p.getByTestId('final')).toBeVisible({ timeout: 20_000 });
    await expect(p.getByTestId('tipo-final')).toHaveText('Final agridoce');
  }

  // A ação livre aparece no livro completo.
  await beto.getByRole('button', { name: /Ler o livro completo/ }).click();
  await expect(beto.getByRole('dialog').getByText('Tocar a flauta encantada')).toBeVisible();

  // Nova aventura volta os dois para a sala.
  await ana.getByTestId('nova-aventura').click();
  await expect(ana.getByTestId('escolha-tema')).toBeVisible();
  await expect(beto.getByText('Aguardando Ana começar a aventura')).toBeVisible();

  await contexto.close();
});

test('com os dois em "Surpresa", o gênero é sorteado igual nos dois celulares', async ({ browser }) => {
  const { contexto, ana, beto } = await abrirSala(browser);
  await ana.getByTestId('comecar').click();
  const genero = await ana.getByTestId('genero-sorteado').textContent();
  await expect(beto.getByTestId('genero-sorteado')).toHaveText(genero!);
  for (const p of [ana, beto]) await expect(p.getByTestId('capitulo-1').getByTestId('opcoes')).toBeVisible({ timeout: 20_000 });
  await contexto.close();
});
