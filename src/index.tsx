import { createRoot } from 'react-dom/client';
import App from './App';
import './i18n';
import './assets/styles/style.css';
import 'react-photo-view/dist/react-photo-view.css';

if (!window.location.hash) {
  window.location.replace(window.location.pathname + '#');
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
