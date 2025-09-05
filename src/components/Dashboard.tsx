import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Cloud, 
  Code, 
  Plus, 
  Settings, 
  LogOut,
  Zap,
  Shield,
  Server
} from 'lucide-react';
import { User } from '../types';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const providers = [
    { 
      id: 'aws', 
      name: 'Amazon Web Services', 
      icon: '🚀', 
      connected: false,
      color: 'from-orange-500 to-yellow-500'
    },
    { 
      id: 'gcp', 
      name: 'Google Cloud Platform', 
      icon: '☁️', 
      connected: false,
      color: 'from-blue-500 to-green-500'
    },
    { 
      id: 'azure', 
      name: 'Microsoft Azure', 
      icon: '⚡', 
      connected: false,
      color: 'from-blue-600 to-purple-600'
    }
  ];

  const quickActions = [
    { name: 'Generate Code', icon: Code, path: '/generate', desc: 'Create Terraform configurations' },
    { name: 'Deploy Infrastructure', icon: Zap, path: '/deploy', desc: 'Deploy to your cloud account' },
    { name: 'Manage Resources', icon: Server, path: '/resources', desc: 'View and manage resources' }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Cloud className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">TerraForge</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <img 
              src={user.avatar} 
              alt={user.name}
              className="h-10 w-10 rounded-full"
            />
            <div className="text-sm">
              <div className="text-white font-medium">{user.name}</div>
              <div className="text-gray-400">{user.email}</div>
            </div>
            <button className="text-gray-400 hover:text-white">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-400 text-lg">
            Ready to build some amazing infrastructure? Let's get started.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.name}
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-gray-800 p-6 rounded-xl hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <Link to={action.path} className="block">
                  <action.icon className="h-12 w-12 text-blue-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">{action.name}</h3>
                  <p className="text-gray-400">{action.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Cloud Providers */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Cloud Provider Accounts</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {providers.map((provider, index) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`bg-gradient-to-br ${provider.color} p-6 rounded-xl text-white relative overflow-hidden`}
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-4xl">{provider.icon}</div>
                    {provider.connected ? (
                      <div className="bg-green-500 px-3 py-1 rounded-full text-xs font-medium">
                        Connected
                      </div>
                    ) : (
                      <div className="bg-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                        Not Connected
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{provider.name}</h3>
                  
                  {provider.connected ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm opacity-90">
                        <Shield className="h-4 w-4" />
                        <span>Securely connected</span>
                      </div>
                      <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">
                        <Settings className="h-4 w-4 inline mr-2" />
                        Manage
                      </button>
                    </div>
                  ) : (
                    <Link 
                      to={`/connect/${provider.id}`}
                      className="inline-flex items-center bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Connect Account
                    </Link>
                  )}
                </div>
                
                <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full transform translate-x-16 -translate-y-16"></div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Getting Started Guide */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-gray-800 p-8 rounded-xl"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Getting Started</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Next Steps:</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-300">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <span>Connect your cloud provider accounts</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <span>Generate your first Terraform configuration</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <span>Deploy infrastructure with one click</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg">
              <h4 className="text-white font-medium mb-3">💡 Pro Tip</h4>
              <p className="text-gray-400 text-sm">
                Start with a simple EC2 instance. Our intelligent dependency resolver 
                will automatically create the VPC, subnet, security group, and other 
                required resources for you.
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Dashboard;