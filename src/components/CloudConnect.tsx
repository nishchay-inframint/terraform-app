import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Shield, 
  Key, 
  ExternalLink, 
  Copy, 
  Check,
  AlertTriangle,
  Info
} from 'lucide-react';
import { FaAws } from 'react-icons/fa';
import { SiGooglecloud } from 'react-icons/si';
import { Icon } from '@iconify/react';
import { User } from '../types';

interface CloudConnectProps {
  user: User;
}

const CloudConnect: React.FC<CloudConnectProps> = ({ user }) => {
  const { provider } = useParams<{ provider: string }>();
  const [currentStep, setCurrentStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [roleArn, setRoleArn] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Generate unique Account ID for each user
  const generateAccountId = (userId: string) => {
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const accountId = Math.abs(hash).toString().padStart(12, '0').slice(0, 12);
    return accountId;
  };
  
  const userAccountId = generateAccountId(user.id);

  const providerInfo = {
    aws: {
      name: 'Amazon Web Services',
      icon: () => <FaAws className="text-2xl text-white" />,
      color: 'from-orange-500 to-yellow-500',
      consoleUrl: 'https://console.aws.amazon.com/',
      iamUrl: 'https://console.aws.amazon.com/iam/'
    },
    gcp: {
      name: 'Google Cloud Platform',
      icon: () => <SiGooglecloud className="text-2xl text-white" />,
      color: 'from-blue-500 to-green-500',
      consoleUrl: 'https://console.cloud.google.com/',
      iamUrl: 'https://console.cloud.google.com/iam-admin/'
    },
    azure: {
      name: 'Microsoft Azure',
      icon: () => <Icon icon="logos:microsoft-azure" className="text-2xl" />,
      color: 'from-blue-600 to-purple-600',
      consoleUrl: 'https://portal.azure.com/',
      iamUrl: 'https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade'
    }
  };

  const info = providerInfo[provider as keyof typeof providerInfo];
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAWSConnect = async () => {
    setConnecting(true);
    setConnectionStatus('idle');
    setErrorMessage('');
    
    try {
      const response = await fetch('http://localhost:3001/api/aws/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roleArn,
          externalId: `terraforge-${user.id}`,
          userId: user.id
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
        setErrorMessage(data.error || 'Connection failed');
      }
    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage('Network error. Please try again.');
    } finally {
      setConnecting(false);
    }
  };

  const renderAWSSteps = () => (
    <div className="space-y-8">
      {/* Step 1 */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`p-6 rounded-xl border-2 transition-colors ${
          currentStep >= 1 ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white bg-opacity-80'
        }`}
      >
        <div className="flex items-start space-x-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
          }`}>
            1
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Create IAM Role - Detailed Steps</h3>
            <p className="text-gray-600 mb-4">
              Follow these exact steps to create an IAM role in your AWS console:
            </p>
            
            <div className="bg-gray-800 p-4 rounded-lg mb-4">
              <h4 className="font-semibold text-white mb-3">📋 Step-by-Step Guide:</h4>
              <ol className="text-sm text-gray-300 space-y-2">
                <li><strong>1.</strong> Click "Open IAM Console" button below</li>
                <li><strong>2.</strong> In the left sidebar, click <span className="bg-blue-600 px-2 py-1 rounded text-xs text-white">Roles</span></li>
                <li><strong>3.</strong> Click <span className="bg-orange-600 px-2 py-1 rounded text-xs text-white">Create role</span> button</li>
                <li><strong>4.</strong> Select <span className="bg-gray-600 px-2 py-1 rounded text-xs text-white">AWS account</span> as trusted entity type</li>
                <li><strong>5.</strong> Select <span className="bg-gray-600 px-2 py-1 rounded text-xs text-white">Another AWS account</span></li>
                <li><strong>6.</strong> Enter Account ID: <span className="bg-gray-900 px-2 py-1 rounded text-xs font-mono text-green-400">123456789012</span></li>
                <li><strong>7.</strong> Check <span className="bg-gray-600 px-2 py-1 rounded text-xs text-white">Require external ID</span></li>
                <li><strong>8.</strong> Enter External ID: <span className="bg-gray-900 px-2 py-1 rounded text-xs font-mono text-green-400">terraforge-{user.id}</span></li>
                <li><strong>9.</strong> Click <span className="bg-blue-600 px-2 py-1 rounded text-xs text-white">Next</span></li>
                <li><strong>10.</strong> Search and attach the policies listed in Step 2 below</li>
                <li><strong>11.</strong> Click <span className="bg-blue-600 px-2 py-1 rounded text-xs text-white">Next</span></li>
                <li><strong>12.</strong> Enter Role name: <span className="bg-gray-900 px-2 py-1 rounded text-xs font-mono text-green-400">TerraForgeRole</span></li>
                <li><strong>13.</strong> Click <span className="bg-green-600 px-2 py-1 rounded text-xs text-white">Create role</span></li>
                <li><strong>14.</strong> Copy the Role ARN from the role summary page</li>
              </ol>
            </div>
            
            <div className="bg-blue-900 bg-opacity-30 border border-blue-600 p-4 rounded-lg mb-4">
              <div className="flex items-start space-x-2">
                <Info className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-blue-300 text-sm">
                    <strong>Important:</strong> The above steps will automatically create the correct trust policy. 
                    You don't need to manually edit JSON - just follow the form fields exactly as shown.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <a 
                href={info.iamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <span>Open IAM Console</span>
                <ExternalLink className="h-4 w-4" />
              </a>
              <button 
                onClick={() => setCurrentStep(2)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Next Step
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Step 2 */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: currentStep >= 2 ? 1 : 0.5, x: 0 }}
        className={`p-6 rounded-xl border-2 transition-colors ${
          currentStep >= 2 ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white bg-opacity-80'
        }`}
      >
        <div className="flex items-start space-x-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
          }`}>
            2
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Attach Permissions - Detailed Steps</h3>
            <p className="text-gray-600 mb-4">
              In step 10 above, you need to search and attach these AWS managed policies:
            </p>
            
            <div className="bg-gray-800 p-4 rounded-lg mb-4">
              <h4 className="font-semibold text-white mb-3">🔍 How to Attach Policies:</h4>
              <ol className="text-sm text-gray-300 space-y-2 mb-4">
                <li><strong>1.</strong> In the "Add permissions" page, use the search box</li>
                <li><strong>2.</strong> Type each policy name below (one at a time)</li>
                <li><strong>3.</strong> Check the checkbox next to each policy</li>
                <li><strong>4.</strong> Repeat for all required policies</li>
                <li><strong>5.</strong> Click "Next" when all policies are selected</li>
              </ol>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-900 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Required Policies:</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• AmazonEC2FullAccess</li>
                  <li>• AmazonVPCFullAccess</li>
                  <li>• AmazonS3FullAccess</li>
                  <li>• IAMFullAccess</li>
                </ul>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Optional Policies:</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• AmazonRDSFullAccess</li>
                  <li>• AWSLambdaFullAccess</li>
                  <li>• CloudWatchFullAccess</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-900 bg-opacity-30 border border-yellow-600 p-4 rounded-lg mb-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-yellow-300 text-sm">
                    <strong>Security Note:</strong> You can create custom policies with minimal required permissions 
                    for production environments. The policies above provide full access for easier setup.
                  </p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setCurrentStep(3)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              disabled={currentStep < 2}
            >
              Next Step
            </button>
          </div>
        </div>
      </motion.div>

      {/* Step 3 */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: currentStep >= 3 ? 1 : 0.5, x: 0 }}
        className={`p-6 rounded-xl border-2 transition-colors ${
          currentStep >= 3 ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white bg-opacity-80'
        }`}
      >
        <div className="flex items-start space-x-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
          }`}>
            3
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Connect to TerraForge</h3>
            <p className="text-gray-600 mb-4">
              Enter your Role ARN and we'll securely connect to your AWS account.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IAM Role ARN
                </label>
                <input 
                  type="text"
                  value={roleArn}
                  onChange={(e) => setRoleArn(e.target.value)}
                  placeholder="arn:aws:iam::123456789012:role/TerraForgeRole"
                  className="w-full bg-white border border-gray-300 text-gray-800 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  External ID
                </label>
                <div className="flex">
                  <input 
                    type="text"
                    value={`terraforge-${user.id}`}
                    readOnly
                    className="flex-1 bg-gray-100 border border-gray-300 text-gray-600 px-4 py-3 rounded-l-lg"
                  />
                  <button 
                    onClick={() => copyToClipboard(`terraforge-${user.id}`)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-r-lg border border-l-0 border-gray-300 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {connectionStatus === 'error' && (
                <div className="bg-red-900 bg-opacity-30 border border-red-600 p-4 rounded-lg">
                  <p className="text-red-300 text-sm">{errorMessage}</p>
                </div>
              )}

              {connectionStatus === 'success' && (
                <div className="bg-green-900 bg-opacity-30 border border-green-600 p-4 rounded-lg">
                  <p className="text-green-300 text-sm">✅ AWS account connected successfully!</p>
                </div>
              )}

              <button 
                onClick={handleAWSConnect}
                disabled={!roleArn || connecting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center space-x-2"
              >
                <Shield className="h-5 w-5" />
                <span>{connecting ? 'Connecting...' : 'Connect Securely'}</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  if (!info) return <div>Provider not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white bg-opacity-90 backdrop-blur-sm border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link 
            to="/dashboard"
            className="flex items-center space-x-3 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>
          
          <div className={`flex items-center space-x-3 bg-gradient-to-r ${info.color} px-4 py-2 rounded-lg text-white`}>
            <info.icon />
            <span className="font-bold">{info.name}</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Connect Your {info.name} Account
          </h1>
          <p className="text-gray-600 text-lg">
            Follow these steps to securely connect your cloud account to TerraForge.
          </p>
        </motion.div>

        {/* Security Notice */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-blue-900 bg-opacity-30 border border-blue-600 p-6 rounded-xl mb-8"
        >
          <div className="flex items-start space-x-3">
            <Info className="h-6 w-6 text-blue-400 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">🔒 Security First</h3>
              <p className="text-blue-100 mb-3">
                TerraForge uses industry-standard security practices to protect your cloud credentials:
              </p>
              <ul className="text-blue-100 text-sm space-y-1">
                <li>• Cross-account IAM roles with external ID validation</li>
                <li>• No storage of permanent credentials</li>
                <li>• Encrypted communication using TLS 1.3</li>
                <li>• Audit logging for all operations</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Connection Steps */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {provider === 'aws' && renderAWSSteps()}
        </motion.div>
      </div>
    </div>
  );
};

export default CloudConnect;