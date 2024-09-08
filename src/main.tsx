import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import './index.css';
import PaintApp from './rosslib';

PaintApp.Init(document.getElementById('appCanvas') as HTMLCanvasElement);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
