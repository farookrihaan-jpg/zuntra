import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e1e1e',
            color:      '#f0ede8',
            border:     '1px solid #2a2a2a',
            borderRadius: '10px',
            fontSize:   '13px',
            fontFamily: "'DM Sans', sans-serif",
          },
          success: { iconTheme: { primary: '#5cbf87', secondary: '#1e1e1e' } },
          error:   { iconTheme: { primary: '#e05c5c', secondary: '#1e1e1e' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
