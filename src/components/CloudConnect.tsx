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
import { User } from '../types';

interface CloudConnectProps {
  user: User;
}

const CloudConnect: React.FC<CloudConnectProps> = ({ user }) => {
  const { provider } = useParams<{ provider: string }>();
  const [currentStep, setCurrentStep] = useState(1);
  const [copied, setCopied] = useState(false);

  const providerInfo = {
    aws: {
      name: 'Amazon Web Services',
      icon: '🚀',
      color: 'from-orange-500 to-yellow-500',
      consoleUrl: 'https://console.aws.amazon.com/',
      iamUrl: 'https://console.aws.amazon.com/iam/'
    },
    gcp: {
      name: 'Google Cloud Platform',
      icon: '☁️',
      color: 'from-blue-500 to-green-500',
      consoleUrl: 'https://console.cloud.google.com/',
      iamUrl: 'https://console.cloud.google.com/iam-admin/'
    },
    azure: {
      name: 'Microsoft Azure',
      icon: '⚡',
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

  const renderAWSSteps = () => (
    <div className="space-y-8">
      {/* Step 1 */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`p-6 rounded-xl border-2 transition-colors ${
          currentStep >= 1 ? 'border-blue-500 bg-blue-50 bg-opacity-5' : 'border-gray-600 bg-gray-800'
        }`}
      >
        <div className="flex items-start space-x-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
          }`}>
            1
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-3">Create IAM Role</h3>
            <p className="text-gray-300 mb-4">
              First, you need to create an IAM role in your AWS account that TerraForge can assume.
            </p>
            
            <div className="bg-gray-900 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Role Trust Policy (JSON)</span>
                <button 
                  onClick={() => copyToClipboard(`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::123456789012:root"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "terraforge-${user.id}"
        }
      }
    }
  ]
}`)}
                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <pre className="text-sm text-green-400 overflow-x-auto">
{`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::123456789012:root"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "terraforge-${user.id}"
        }
      }
    }
  ]
}`}
              </pre>
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
          currentStep >= 2 ? 'border-blue-500 bg-blue-50 bg-opacity-5' : 'border-gray-600 bg-gray-800'
        }`}
      >
        <div className="flex items-start space-x-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
          }`}>
            2
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-3">Attach Permissions</h3>
            <p className="text-gray-300 mb-4">
              Attach the necessary permissions to your IAM role. For full functionality, attach these policies:
            </p>
            
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
          currentStep >= 3 ? 'border-blue-500 bg-blue-50 bg-opacity-5' : 'border-gray-600 bg-gray-800'
        }`}
      >
        <div className="flex items-start space-x-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
          }`}>
            3
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-3">Connect to TerraForge</h3>
            <p className="text-gray-300 mb-4">
              Enter your Role ARN and we'll securely connect to your AWS account.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  IAM Role ARN
                </label>
                <input 
                  type="text"
                  placeholder="arn:aws:iam::123456789012:role/TerraForgeRole"
                  className="w-full bg-gray-900 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  External ID
                </label>
                <div className="flex">
                  <input 
                    type="text"
                    value={`terraforge-${user.id}`}
                    readOnly
                    className="flex-1 bg-gray-900 border border-gray-600 text-gray-400 px-4 py-3 rounded-l-lg"
                  />
                  <button 
                    onClick={() => copyToClipboard(`terraforge-${user.id}`)}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-r-lg border border-l-0 border-gray-600 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Connect Securely</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  if (!info) return <div>Provider not found</div>;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link 
            to="/dashboard"
            className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>
          
          <div className={`flex items-center space-x-3 bg-gradient-to-r ${info.color} px-4 py-2 rounded-lg text-white`}>
            <span className="text-2xl">{info.icon}</span>
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
          <h1 className="text-4xl font-bold text-white mb-4">
            Connect Your {info.name} Account
          </h1>
          <p className="text-gray-400 text-lg">
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