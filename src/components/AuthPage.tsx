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
    // Mock authentication - in production, implement actual OAuth
    const mockUser: User = {
      id: '1',
      name: 'John Developer',
      email: 'john@example.com',
      avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?w=150',
      provider: 'github'
    };
    setUser(mockUser);
  };

  const handleGoogleLogin = () => {
    // Mock authentication - in production, implement actual OAuth
    const mockUser: User = {
      id: '2',
      name: 'Jane Developer',
      email: 'jane@example.com',
      avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?w=150',
      provider: 'google'
    };
    setUser(mockUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md"
      >
        <Link 
          to="/"
          className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to TerraForge</h1>
          <p className="text-gray-400">Sign in to start building your infrastructure</p>
        </div>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGithubLogin}
            className="w-full bg-gray-900 hover:bg-black text-white p-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-3"
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
          <p className="text-sm text-gray-500">
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