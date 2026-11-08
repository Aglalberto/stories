import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Sem StrictMode de propósito: em desenvolvimento ele montaria a conexão
// WebRTC duas vezes e o id da sala ficaria "ocupado" por alguns segundos.
createRoot(document.getElementById('root')!).render(<App />);
