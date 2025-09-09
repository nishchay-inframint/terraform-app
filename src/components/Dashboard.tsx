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
import { FaAws } from 'react-icons/fa';
import { SiGooglecloud } from 'react-icons/si';
import { Icon } from '@iconify/react';
import { User } from '../types';

interface DashboardProps {
  user: User;
  setUser?: (user: User | null) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, setUser }) => {
  const [awsStatus, setAwsStatus] = React.useState({ connected: false, accountId: null });
  
  React.useEffect(() => {
    // Check AWS connection status
    fetch(`http://localhost:3001/api/aws/status/${user.id}`)
      .then(res => res.json())
      .then(data => setAwsStatus(data))
      .catch(console.error);
  }, [user.id]);
  
  const handleLogout = () => {
    if (setUser) {
      setUser(null);
    }
  };
  const providers = [
    { 
      id: 'aws', 
      name: 'Amazon Web Services', 
      icon: () => <FaAws className="text-4xl text-white" />, 
      connected: awsStatus.connected,
      accountId: awsStatus.accountId,
      color: 'from-orange-500 to-yellow-500'
    },
    { 
      id: 'gcp', 
      name: 'Google Cloud Platform', 
      icon: () => <SiGooglecloud className="text-4xl text-white" />, 
      connected: false,
      color: 'from-blue-500 to-green-500'
    },
    { 
      id: 'azure', 
      name: 'Microsoft Azure', 
      icon: () => <Icon icon="logos:microsoft-azure" className="text-4xl" />, 
      connected: false,
      color: 'from-blue-600 to-purple-600'
    }
  ];

  const quickActions = [
    { name: 'Generate Code', icon: Code, path: '/generate', desc: 'Create Terraform configurations', color: 'from-purple-500 to-pink-500', iconColor: 'text-purple-100' },
    { name: 'Deploy Infrastructure', icon: Zap, path: '/deploy', desc: 'Deploy to your cloud account', color: 'from-green-500 to-emerald-500', iconColor: 'text-green-100' },
    { name: 'Manage Resources', icon: Server, path: '/resources', desc: 'View and manage resources', color: 'from-blue-500 to-cyan-500', iconColor: 'text-blue-100' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white bg-opacity-90 backdrop-blur-sm border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Cloud className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-gray-800">TerraForge</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <img 
              src={user.avatar} 
              alt={user.name}
              className="h-10 w-10 rounded-full"
            />
            <div className="text-sm">
              <div className="text-gray-800 font-medium">{user.name}</div>
              <div className="text-gray-600">{user.email}</div>
            </div>
            <button 
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-800 transition-colors"
              title="Logout"
            >
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
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome back, {user.name?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="text-gray-600 text-lg">
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Zap className="h-7 w-7 text-yellow-500 mr-3" />
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`bg-gradient-to-br ${action.color} p-6 rounded-xl cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden`}
              >
                <Link to={action.path} className="block relative z-10">
                  <action.icon className={`h-12 w-12 ${action.iconColor} mb-4`} />
                  <h3 className="text-xl font-semibold text-white mb-2">{action.name}</h3>
                  <p className="text-white text-opacity-90">{action.desc}</p>
                </Link>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white bg-opacity-10 rounded-full transform translate-x-8 -translate-y-8"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white bg-opacity-5 rounded-full transform -translate-x-4 translate-y-4"></div>
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Cloud Provider Accounts</h2>
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
                    <provider.icon />
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
                  {provider.accountId && (
                    <p className="text-sm opacity-75 mb-2">Account: {provider.accountId}</p>
                  )}
                  
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
          className="mt-12 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8 rounded-xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-lg">🚀</span>
              </div>
              Getting Started
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <span className="text-xl mr-2">📋</span>
                  Next Steps:
                </h3>
                <div className="space-y-4">
                  <motion.div 
                    whileHover={{ x: 5 }}
                    className="flex items-center space-x-3 text-gray-200 bg-white bg-opacity-10 p-3 rounded-lg backdrop-blur-sm"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg">1</div>
                    <span>Connect your cloud provider accounts</span>
                  </motion.div>
                  <motion.div 
                    whileHover={{ x: 5 }}
                    className="flex items-center space-x-3 text-gray-200 bg-white bg-opacity-10 p-3 rounded-lg backdrop-blur-sm"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg">2</div>
                    <span>Generate your first Terraform configuration</span>
                  </motion.div>
                  <motion.div 
                    whileHover={{ x: 5 }}
                    className="flex items-center space-x-3 text-gray-200 bg-white bg-opacity-10 p-3 rounded-lg backdrop-blur-sm"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg">3</div>
                    <span>Deploy infrastructure with one click</span>
                  </motion.div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-yellow-400/20 to-orange-500/20 p-6 rounded-lg backdrop-blur-sm border border-yellow-400/30">
                <h4 className="text-white font-medium mb-3 flex items-center">
                  <span className="text-2xl mr-2">💡</span>
                  Pro Tip
                </h4>
                <p className="text-gray-200 text-sm leading-relaxed">
                  Start with a simple EC2 instance. Our intelligent dependency resolver 
                  will automatically create the VPC, subnet, security group, and other 
                  required resources for you.
                </p>
                <div className="mt-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-pink-400/20 to-purple-600/20 rounded-full transform translate-x-20 -translate-y-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-400/20 to-cyan-500/20 rounded-full transform -translate-x-16 translate-y-16"></div>
        </motion.section>
      </div>
    </div>
  );
};

export default Dashboard;