import { useState } from 'react';
import Auth from './components/Auth';
import Chat from './components/Chat';
import YouTubeDownload from './components/YouTubeDownload';
import './App.css';

function App() {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('chatapp_user');
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.username) return parsed;
    } catch {
      return { username: raw, firstName: '', lastName: '' };
    }
    return null;
  });
  const [tab, setTab] = useState('chat');

  const handleLogin = (loggedInUser) => {
    localStorage.setItem('chatapp_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('chatapp_user');
    setUser(null);
  };

  if (user) {
    return (
      <div className="app-shell">
        <header className="app-tabs">
          <button
            className={tab === 'chat' ? 'active' : ''}
            onClick={() => setTab('chat')}
            type="button"
          >
            Chat
          </button>
          <button
            className={tab === 'youtube' ? 'active' : ''}
            onClick={() => setTab('youtube')}
            type="button"
          >
            YouTube Channel Download
          </button>
        </header>
        {tab === 'chat' ? (
          <Chat user={user} onLogout={handleLogout} />
        ) : (
          <YouTubeDownload user={user} onLogout={handleLogout} />
        )}
      </div>
    );
  }
  return <Auth onLogin={handleLogin} />;
}

export default App;
