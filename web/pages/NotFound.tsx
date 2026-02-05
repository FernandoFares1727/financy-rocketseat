import React from 'react';

const NotFound: React.FC = () => {
  return (
    <div style={styles.container}>
      <div style={styles.card} role="alert">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" aria-hidden style={{ margin: '0 auto 12px', display: 'block' }}>
          <circle cx="12" cy="12" r="10" fill="#FEF3C7" />
          <path d="M12 7v6" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 16h.01" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <h1 style={styles.title}>Conexão indisponível</h1>

        <p style={styles.message}>
          Não foi possível estabelecer comunicação com o servidor. Isso pode ocorrer quando o backend está desligado
          ou inacessível. Por favor, tente novamente mais tarde.
        </p>

        <div style={styles.actions}>
          <button
            style={styles.button}
            onClick={() => {
              window.location.href = 'http://localhost:3000/';
            }}
          >
            Recarregar
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 720,
    background: '#ffffff',
    borderRadius: 12,
    boxShadow: '0 10px 30px rgba(2,6,23,0.08)',
    padding: '36px 32px',
    textAlign: 'center',
    border: '1px solid rgba(15,23,42,0.04)'
  },
  title: {
    margin: 0,
    fontSize: 22,
    color: '#0f172a'
  },
  message: {
    color: '#475569',
    marginTop: 12,
    marginBottom: 20,
    lineHeight: 1.5
  },
  actions: {
    display: 'flex',
    justifyContent: 'center'
  },
  button: {
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    padding: '10px 18px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14
  }
};

export default NotFound;
