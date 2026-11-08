import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TextoMaquina } from './TextoMaquina';

describe('TextoMaquina', () => {
  it('mostra tudo de uma vez no modo instantâneo e avisa que terminou', () => {
    const fim = vi.fn();
    render(<TextoMaquina chave="t1" texto={'Olá\n\nMundo'} completo cps={50} instantaneo aoTerminar={fim} />);
    expect(screen.getByText('Olá')).toBeInTheDocument();
    expect(screen.getByText('Mundo')).toBeInTheDocument();
    expect(fim).toHaveBeenCalledOnce();
  });

  it('revela aos poucos e pula ao tocar', async () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'performance'] });
    const fim = vi.fn();
    const texto = 'Uma frase bastante longa para a máquina de escrever revelar aos poucos.';
    render(<TextoMaquina chave="t2" texto={texto} completo cps={10} aoTerminar={fim} />);
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    const el = screen.getByTestId('narracao');
    expect(el.textContent!.length).toBeLessThan(texto.length);
    fireEvent.click(el);
    expect(el).toHaveAttribute('data-completa', 'sim');
    expect(fim).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });
});
