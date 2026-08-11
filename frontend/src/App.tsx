import { useState, useEffect } from 'react';
import './App.css';

interface HealthResponse {
  success: boolean;
  message: string;
  timestamp: string;
  environment: string;
}

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data: HealthResponse) => setHealth(data))
      .catch(() => setApiError(true));
  }, []);

  return (
    <div className="app">
      <div className="app__logo">
        <span className="app__logo-icon">⚡</span>
      </div>

      <h1 className="app__title">Mini ERP + CRM</h1>
      <p className="app__subtitle">Operations Portal</p>

      <div className="app__status">
        <div className="app__status-card">
          <span className="app__status-indicator app__status-indicator--active" />
          <span className="app__status-label">Frontend</span>
          <span className="app__status-value">Running</span>
        </div>

        <div className="app__status-card">
          <span
            className={`app__status-indicator ${
              health ? 'app__status-indicator--active' : 'app__status-indicator--pending'
            }`}
          />
          <span className="app__status-label">Backend API</span>
          <span className="app__status-value">
            {health ? health.message : apiError ? 'Unreachable' : 'Checking…'}
          </span>
        </div>

        <div className="app__status-card">
          <span className="app__status-indicator app__status-indicator--pending" />
          <span className="app__status-label">Database</span>
          <span className="app__status-value">Not connected yet</span>
        </div>
      </div>
    </div>
  );
}

export default App;
