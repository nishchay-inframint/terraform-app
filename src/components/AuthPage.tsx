import React from 'react';
import { motion } from 'framer-motion';
import { Github, Chrome, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { User } from '../types';

interface AuthPageProps {
  setUser: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ setUser }) => {
  const handleGithubLogin = () => {
    const clientId = 'Ov23lirFHb0j2Sdleix8';
    const redirectUri = `${window.location.origin}/auth/github/callback`;
    const scope = 'user:email';
    
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  };

  const handleGoogleLogin = () => {
    const clientId = '90927507397-npd3aaijqog4hrtnq1lhj894c55u1r7r.apps.googleusercontent.com';
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/google/callback`);
    const scope = encodeURIComponent('openid email profile');
    
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&access_type=offline`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white bg-opacity-90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200"
      >
        <Link 
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to TerraForge</h1>
          <p className="text-gray-600">Sign in to start building your infrastructure</p>
        </div>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGithubLogin}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white p-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-3 shadow-lg"
          >
            <Github className="h-5 w-5" />
            <span>Continue with GitHub</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleLogin}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 p-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-3"
          >
            <Chrome className="h-5 w-5" />
            <span>Continue with Google</span>
          </motion.button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            By signing in, you agree to our{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300">Privacy Policy</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;