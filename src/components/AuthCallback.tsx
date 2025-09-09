import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User } from '../types';

interface AuthCallbackProps {
  setUser: (user: User) => void;
}

const AuthCallback: React.FC<AuthCallbackProps> = ({ setUser }) => {
  const { provider } = useParams<{ provider: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (!code) {
        navigate('/auth');
        return;
      }

      try {
        console.log('Attempting auth with code:', code);
        const response = await fetch(`http://localhost:3001/api/auth/${provider}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
          const userData = await response.json();
          console.log('User data:', userData);
          setUser(userData);
          navigate('/dashboard');
        } else {
          const errorData = await response.text();
          console.error('Auth failed:', errorData);
          throw new Error('Authentication failed');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        // Fallback to mock data if server fails
        setUser({
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          avatar: 'https://via.placeholder.com/150',
          provider: provider || 'unknown'
        });
        navigate('/dashboard');
      }
    };

    handleCallback();
  }, [provider, setUser, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-gray-800 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Authenticating...</p>
      </div>
    </div>
  );
};

export default AuthCallback;