import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Code, 
  Download, 
  Play, 
  Copy,
  Check,
  Zap,
  Server,
  Database,
  Network,
  Shield
} from 'lucide-react';
import { FaAws } from 'react-icons/fa';
import { SiGooglecloud } from 'react-icons/si';
import { Icon } from '@iconify/react';
import { User, CloudService, GeneratedCode } from '../types';

const AWSIcon = () => <FaAws className="w-8 h-8 text-white" />;
const GCPIcon = () => <SiGooglecloud className="w-8 h-8 text-white" />;
const AzureIcon = () => <Icon icon="logos:microsoft-azure" className="w-8 h-8" />;

interface CodeGeneratorProps {
  user: User;
}

const CodeGenerator: React.FC<CodeGeneratorProps> = ({ user }) => {
  const [selectedProvider, setSelectedProvider] = useState('aws');
  const [selectedService, setSelectedService] = useState<CloudService | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const [copied, setCopied] = useState(false);

  const formatFieldName = (name: string) => {
    return name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const providers = {
    aws: {
      name: 'Amazon Web Services',
      icon: AWSIcon,
      color: 'from-orange-500 to-yellow-500',
      services: [
        {
          id: 'ec2',
          name: 'EC2 Instance',
          category: 'Compute',
          description: 'Virtual server in the cloud',
          dependencies: ['vpc', 'subnet', 'security_group'],
          required_fields: [
            { name: 'instance_name', type: 'string', required: true },
            { name: 'instance_type', type: 'select', required: true, options: ['t2.micro', 't2.small', 't2.medium'] },
            { name: 'ami_id', type: 'string', required: true, default: 'ami-0c02fb55956c7d316' }
          ]
        },
        {
          id: 's3',
          name: 'S3 Bucket',
          category: 'Storage',
          description: 'Object storage service',
          dependencies: [],
          required_fields: [
            { name: 'bucket_name', type: 'string', required: true }
          ]
        }
      ]
    },
    gcp: {
      name: 'Google Cloud Platform',
      icon: GCPIcon,
      color: 'from-blue-500 to-green-500',
      services: [
        {
          id: 'compute_instance',
          name: 'Compute Engine VM',
          category: 'Compute',
          description: 'Virtual machine instance',
          dependencies: [],
          required_fields: [
            { name: 'instance_name', type: 'string', required: true }
          ]
        }
      ]
    },
    azure: {
      name: 'Microsoft Azure',
      icon: AzureIcon,
      color: 'from-blue-600 to-purple-600',
      services: [
        {
          id: 'virtual_machine',
          name: 'Virtual Machine',
          category: 'Compute',
          description: 'Azure virtual machine',
          dependencies: ['resource_group'],
          required_fields: [
            { name: 'vm_name', type: 'string', required: true }
          ]
        }
      ]
    }
  };

  const serviceCategories = {
    'Compute': { icon: Server, color: 'text-blue-400' },
    'Storage': { icon: Database, color: 'text-green-400' },
    'Database': { icon: Database, color: 'text-purple-400' },
    'Networking': { icon: Network, color: 'text-yellow-400' },
    'Security': { icon: Shield, color: 'text-red-400' }
  };

  const getCategoryStyle = (category: string) => {
    const styles = {
      'Compute': 'bg-blue-900/50 text-blue-300',
      'Storage': 'bg-green-900/50 text-green-300',
      'Database': 'bg-purple-900/50 text-purple-300',
      'Networking': 'bg-yellow-900/50 text-yellow-300',
      'Security': 'bg-red-900/50 text-red-300'
    };
    return styles[category as keyof typeof styles] || 'bg-gray-900/50 text-gray-300';
  };

  const generateTerraformCode = () => {
    if (!selectedService) return;
    
    const codeLines = [];
    codeLines.push('# Generated Terraform Configuration');
    codeLines.push('');
    codeLines.push(`resource "aws_instance" "main" {`);
    codeLines.push(`  ami           = "${formData.ami_id || 'ami-0c02fb55956c7d316'}"`);
    codeLines.push(`  instance_type = "${formData.instance_type || 't2.micro'}"`);
    codeLines.push(`}`);
    
    const code = codeLines.join('\n');
    
    setGeneratedCode({
      resources: [{ type: 'aws_instance', name: 'main' }],
      dependencies: [],
      code: code
    });
  };

  const copyToClipboard = async () => {
    if (generatedCode) {
      try {
        await navigator.clipboard.writeText(generatedCode.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const downloadCode = () => {
    if (generatedCode) {
      try {
        const blob = new Blob([generatedCode.code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'terraform.tf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Failed to download:', err);
      }
    }
  };

  const currentProvider = providers[selectedProvider as keyof typeof providers];

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link 
            to="/dashboard"
            className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>
          
          <div className="flex items-center space-x-3">
            <Code className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold text-white">Terraform Code Generator</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 p-6 rounded-xl"
            >
              <h2 className="text-2xl font-bold text-white mb-4">1. Select Cloud Provider</h2>
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(providers).map(([key, provider]) => (
                  <div 
                    key={key}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedProvider === key 
                        ? 'border-blue-500 bg-blue-50 bg-opacity-5' 
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                    onClick={() => setSelectedProvider(key)}
                  >
                    <div className="flex items-center space-x-3">
                      <provider.icon />
                      <div>
                        <h3 className="font-semibold text-white">{provider.name}</h3>
                        <p className="text-sm text-gray-400">Full service integration</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800 p-6 rounded-xl"
            >
              <h2 className="text-2xl font-bold text-white mb-4">2. Choose Service</h2>
              <div className="grid grid-cols-2 gap-4">
                {currentProvider.services.map((service) => {
                  const categoryInfo = serviceCategories[service.category as keyof typeof serviceCategories];
                  return (
                    <motion.div 
                      key={service.id}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        selectedService?.id === service.id
                          ? 'border-blue-500 bg-gradient-to-br from-blue-900/30 to-purple-900/30 shadow-lg' 
                          : 'border-gray-600 hover:border-gray-500 bg-gray-800/50 hover:bg-gray-700/50'
                      }`}
                      onClick={() => setSelectedService(service)}
                    >
                      <div className="text-center">
                        <div className="mb-3">
                          <categoryInfo.icon className={`h-8 w-8 ${categoryInfo.color} mx-auto`} />
                        </div>
                        <h3 className="font-semibold text-white mb-2">{service.name}</h3>
                        <p className="text-xs text-gray-400 mb-3 h-8 overflow-hidden">{service.description}</p>
                        <div className="flex justify-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryStyle(service.category)}`}>
                            {service.category}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {selectedService && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800 p-6 rounded-xl"
              >
                <h2 className="text-2xl font-bold text-white mb-4">3. Configure {selectedService.name}</h2>
                
                <div className="space-y-4">
                  {selectedService.required_fields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {formatFieldName(field.name)}
                        {field.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      
                      {field.type === 'select' ? (
                        <select 
                          value={formData[field.name] || field.default || ''}
                          onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                          className="w-full bg-gray-900 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select {field.name.split('_').join(' ')}</option>
                          {field.options?.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <input 
                          type="text"
                          value={formData[field.name] || field.default || ''}
                          onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                          className="w-full bg-gray-900 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`Enter ${field.name.split('_').join(' ')}`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <button 
                  onClick={generateTerraformCode}
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <Code className="h-5 w-5" />
                  <span>Generate Terraform Code</span>
                </button>
              </motion.div>
            )}
          </div>

          <div className="space-y-6">
            {generatedCode ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 p-6 rounded-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">Generated Terraform Code</h2>
                  <div className="flex space-x-2">
                    <button 
                      onClick={copyToClipboard}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                    <button 
                      onClick={downloadCode}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-sm text-gray-400">main.tf</span>
                  </div>
                  <pre className="p-4 text-sm text-green-400 overflow-x-auto max-h-96 overflow-y-auto">
                    <code>{generatedCode.code}</code>
                  </pre>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 p-8 rounded-xl text-center"
              >
                <Code className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">Generated Code Will Appear Here</h3>
                <p className="text-gray-500">
                  Select a service and configure it to generate your Terraform code.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeGenerator;