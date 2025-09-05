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
  AlertCircle,
  Server,
  Database,
  Network,
  Shield
} from 'lucide-react';
import { User, CloudService, GeneratedCode } from '../types';

interface CodeGeneratorProps {
  user: User;
}

const CodeGenerator: React.FC<CodeGeneratorProps> = ({ user }) => {
  const [selectedProvider, setSelectedProvider] = useState('aws');
  const [selectedService, setSelectedService] = useState<CloudService | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const [copied, setCopied] = useState(false);

  const providers = {
    aws: {
      name: 'Amazon Web Services',
      icon: '🚀',
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
            { name: 'instance_type', type: 'select', required: true, options: ['t2.micro', 't2.small', 't2.medium', 't3.micro', 't3.small'] },
            { name: 'ami_id', type: 'string', required: true, default: 'ami-0c02fb55956c7d316' },
            { name: 'key_pair', type: 'string', required: false }
          ]
        },
        {
          id: 's3',
          name: 'S3 Bucket',
          category: 'Storage',
          description: 'Object storage service',
          dependencies: [],
          required_fields: [
            { name: 'bucket_name', type: 'string', required: true },
            { name: 'versioning', type: 'boolean', required: false, default: false },
            { name: 'public_access', type: 'boolean', required: false, default: false }
          ]
        },
        {
          id: 'rds',
          name: 'RDS Database',
          category: 'Database',
          description: 'Managed relational database',
          dependencies: ['vpc', 'subnet', 'security_group'],
          required_fields: [
            { name: 'db_name', type: 'string', required: true },
            { name: 'engine', type: 'select', required: true, options: ['mysql', 'postgres', 'mariadb'] },
            { name: 'instance_class', type: 'select', required: true, options: ['db.t3.micro', 'db.t3.small', 'db.t3.medium'] },
            { name: 'username', type: 'string', required: true, default: 'admin' },
            { name: 'password', type: 'string', required: true }
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

  const generateTerraformCode = () => {
    if (!selectedService) return;

    const resources: any[] = [];
    const dependencies: any[] = [];

    // Generate dependencies first
    if (selectedService.dependencies?.includes('vpc')) {
      dependencies.push({
        type: 'aws_vpc',
        name: 'main',
        config: {
          cidr_block: '10.0.0.0/16',
          enable_dns_hostnames: true,
          enable_dns_support: true,
          tags: {
            Name: `${formData.instance_name || formData.db_name || 'main'}-vpc`
          }
        }
      });
    }

    if (selectedService.dependencies?.includes('subnet')) {
      dependencies.push({
        type: 'aws_subnet',
        name: 'main',
        config: {
          vpc_id: '${aws_vpc.main.id}',
          cidr_block: '10.0.1.0/24',
          availability_zone: '${data.aws_availability_zones.available.names[0]}',
          map_public_ip_on_launch: true,
          tags: {
            Name: `${formData.instance_name || formData.db_name || 'main'}-subnet`
          }
        }
      });

      dependencies.push({
        type: 'data.aws_availability_zones',
        name: 'available',
        config: {
          state: 'available'
        }
      });

      dependencies.push({
        type: 'aws_internet_gateway',
        name: 'main',
        config: {
          vpc_id: '${aws_vpc.main.id}',
          tags: {
            Name: `${formData.instance_name || formData.db_name || 'main'}-igw`
          }
        }
      });

      dependencies.push({
        type: 'aws_route_table',
        name: 'main',
        config: {
          vpc_id: '${aws_vpc.main.id}',
          route: [
            {
              cidr_block: '0.0.0.0/0',
              gateway_id: '${aws_internet_gateway.main.id}'
            }
          ],
          tags: {
            Name: `${formData.instance_name || formData.db_name || 'main'}-rt`
          }
        }
      });

      dependencies.push({
        type: 'aws_route_table_association',
        name: 'main',
        config: {
          subnet_id: '${aws_subnet.main.id}',
          route_table_id: '${aws_route_table.main.id}'
        }
      });
    }

    if (selectedService.dependencies?.includes('security_group')) {
      const sgConfig: any = {
        name: `${formData.instance_name || formData.db_name || 'main'}-sg`,
        description: `Security group for ${selectedService.name}`,
        vpc_id: '${aws_vpc.main.id}',
        egress: [
          {
            from_port: 0,
            to_port: 0,
            protocol: '-1',
            cidr_blocks: ['0.0.0.0/0']
          }
        ],
        tags: {
          Name: `${formData.instance_name || formData.db_name || 'main'}-sg`
        }
      };

      if (selectedService.id === 'ec2') {
        sgConfig.ingress = [
          {
            from_port: 22,
            to_port: 22,
            protocol: 'tcp',
            cidr_blocks: ['0.0.0.0/0']
          },
          {
            from_port: 80,
            to_port: 80,
            protocol: 'tcp',
            cidr_blocks: ['0.0.0.0/0']
          },
          {
            from_port: 443,
            to_port: 443,
            protocol: 'tcp',
            cidr_blocks: ['0.0.0.0/0']
          }
        ];
      } else if (selectedService.id === 'rds') {
        const port = formData.engine === 'postgres' ? 5432 : 3306;
        sgConfig.ingress = [
          {
            from_port: port,
            to_port: port,
            protocol: 'tcp',
            cidr_blocks: ['10.0.0.0/16']
          }
        ];
      }

      dependencies.push({
        type: 'aws_security_group',
        name: 'main',
        config: sgConfig
      });
    }

    // Generate main resource
    if (selectedService.id === 'ec2') {
      resources.push({
        type: 'aws_instance',
        name: 'main',
        config: {
          ami: formData.ami_id,
          instance_type: formData.instance_type,
          key_name: formData.key_pair || null,
          vpc_security_group_ids: selectedService.dependencies?.includes('security_group') ? ['${aws_security_group.main.id}'] : undefined,
          subnet_id: selectedService.dependencies?.includes('subnet') ? '${aws_subnet.main.id}' : undefined,
          tags: {
            Name: formData.instance_name
          }
        }
      });
    } else if (selectedService.id === 's3') {
      resources.push({
        type: 'aws_s3_bucket',
        name: 'main',
        config: {
          bucket: formData.bucket_name,
          tags: {
            Name: formData.bucket_name
          }
        }
      });

      if (formData.versioning) {
        resources.push({
          type: 'aws_s3_bucket_versioning',
          name: 'main',
          config: {
            bucket: '${aws_s3_bucket.main.id}',
            versioning_configuration: {
              status: 'Enabled'
            }
          }
        });
      }

      if (!formData.public_access) {
        resources.push({
          type: 'aws_s3_bucket_public_access_block',
          name: 'main',
          config: {
            bucket: '${aws_s3_bucket.main.id}',
            block_public_acls: true,
            block_public_policy: true,
            ignore_public_acls: true,
            restrict_public_buckets: true
          }
        });
      }
    } else if (selectedService.id === 'rds') {
      dependencies.push({
        type: 'aws_db_subnet_group',
        name: 'main',
        config: {
          name: `${formData.db_name}-subnet-group`,
          subnet_ids: ['${aws_subnet.main.id}', '${aws_subnet.secondary.id}'],
          tags: {
            Name: `${formData.db_name} DB subnet group`
          }
        }
      });

      dependencies.push({
        type: 'aws_subnet',
        name: 'secondary',
        config: {
          vpc_id: '${aws_vpc.main.id}',
          cidr_block: '10.0.2.0/24',
          availability_zone: '${data.aws_availability_zones.available.names[1]}',
          tags: {
            Name: `${formData.db_name}-subnet-secondary`
          }
        }
      });

      resources.push({
        type: 'aws_db_instance',
        name: 'main',
        config: {
          identifier: formData.db_name,
          engine: formData.engine,
          instance_class: formData.instance_class,
          allocated_storage: 20,
          storage_type: 'gp2',
          db_name: formData.db_name,
          username: formData.username,
          password: formData.password,
          vpc_security_group_ids: ['${aws_security_group.main.id}'],
          db_subnet_group_name: '${aws_db_subnet_group.main.name}',
          skip_final_snapshot: true,
          tags: {
            Name: formData.db_name
          }
        }
      });
    }

    // Generate the actual Terraform code
    let code = '';
    
    // Add data sources
    dependencies.forEach(dep => {
      if (dep.type.startsWith('data.')) {
        const [, resourceType] = dep.type.split('.');
        code += `data "${resourceType}" "${dep.name}" {\n`;
        Object.entries(dep.config).forEach(([key, value]) => {
          if (typeof value === 'string') {
            code += `  ${key} = "${value}"\n`;
          } else {
            code += `  ${key} = ${JSON.stringify(value)}\n`;
          }
        });
        code += '}\n\n';
      }
    });

    // Add dependency resources
    dependencies.forEach(dep => {
      if (!dep.type.startsWith('data.')) {
        code += `resource "${dep.type}" "${dep.name}" {\n`;
        Object.entries(dep.config).forEach(([key, value]) => {
          if (typeof value === 'string') {
            code += `  ${key} = ${value.startsWith('${') ? value : `"${value}"`}\n`;
          } else if (Array.isArray(value)) {
            if (key === 'ingress' || key === 'egress' || key === 'route') {
              code += `  ${key} {\n`;
              value.forEach(item => {
                Object.entries(item).forEach(([subKey, subValue]) => {
                  if (Array.isArray(subValue)) {
                    code += `    ${subKey} = ${JSON.stringify(subValue)}\n`;
                  } else {
                    code += `    ${subKey} = ${typeof subValue === 'string' ? `"${subValue}"` : subValue}\n`;
                  }
                });
              });
              code += '  }\n';
            } else {
              code += `  ${key} = ${JSON.stringify(value)}\n`;
            }
          } else if (typeof value === 'object') {
            code += `  ${key} {\n`;
            Object.entries(value).forEach(([subKey, subValue]) => {
              code += `    ${subKey} = ${typeof subValue === 'string' ? `"${subValue}"` : subValue}\n`;
            });
            code += '  }\n';
          } else {
            code += `  ${key} = ${value}\n`;
          }
        });
        code += '}\n\n';
      }
    });

    // Add main resources
    resources.forEach(resource => {
      code += `resource "${resource.type}" "${resource.name}" {\n`;
      Object.entries(resource.config).forEach(([key, value]) => {
        if (value === null || value === undefined) return;
        
        if (typeof value === 'string') {
          code += `  ${key} = ${value.startsWith('${') ? value : `"${value}"`}\n`;
        } else if (Array.isArray(value)) {
          code += `  ${key} = ${JSON.stringify(value)}\n`;
        } else if (typeof value === 'object') {
          code += `  ${key} {\n`;
          Object.entries(value).forEach(([subKey, subValue]) => {
            code += `    ${subKey} = ${typeof subValue === 'string' ? `"${subValue}"` : subValue}\n`;
          });
          code += '  }\n';
        } else {
          code += `  ${key} = ${value}\n`;
        }
      });
      code += '}\n\n';
    });

    setGeneratedCode({
      resources,
      dependencies,
      code: code.trim()
    });
  };

  const copyToClipboard = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadCode = () => {
    if (generatedCode) {
      const blob = new Blob([generatedCode.code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedService?.name.toLowerCase().replace(/\s+/g, '-') || 'terraform'}.tf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const currentProvider = providers[selectedProvider as keyof typeof providers];

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
          
          <div className="flex items-center space-x-3">
            <Code className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold text-white">Terraform Code Generator</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="space-y-6">
            {/* Provider Selection */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 p-6 rounded-xl"
            >
              <h2 className="text-2xl font-bold text-white mb-4">1. Select Cloud Provider</h2>
              <div className="grid grid-cols-1 gap-4">
                <div 
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedProvider === 'aws' 
                      ? 'border-blue-500 bg-blue-50 bg-opacity-5' 
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  onClick={() => setSelectedProvider('aws')}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🚀</span>
                    <div>
                      <h3 className="font-semibold text-white">Amazon Web Services</h3>
                      <p className="text-sm text-gray-400">Full AWS service support</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Service Selection */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800 p-6 rounded-xl"
            >
              <h2 className="text-2xl font-bold text-white mb-4">2. Choose Service</h2>
              <div className="grid grid-cols-1 gap-3">
                {currentProvider.services.map((service) => {
                  const categoryInfo = serviceCategories[service.category as keyof typeof serviceCategories];
                  return (
                    <div 
                      key={service.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedService?.id === service.id
                          ? 'border-blue-500 bg-blue-50 bg-opacity-5' 
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => setSelectedService(service)}
                    >
                      <div className="flex items-start space-x-3">
                        <categoryInfo.icon className={`h-6 w-6 ${categoryInfo.color} mt-1`} />
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{service.name}</h3>
                          <p className="text-sm text-gray-400 mb-2">{service.description}</p>
                          {service.dependencies && service.dependencies.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <Zap className="h-4 w-4 text-yellow-400" />
                              <span className="text-xs text-yellow-300">
                                Auto-creates: {service.dependencies.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Configuration Form */}
            {selectedService && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800 p-6 rounded-xl"
              >
                <h2 className="text-2xl font-bold text-white mb-4">3. Configure {selectedService.name}</h2>
                
                {selectedService.dependencies && selectedService.dependencies.length > 0 && (
                  <div className="bg-blue-900 bg-opacity-30 border border-blue-600 p-4 rounded-lg mb-6">
                    <div className="flex items-start space-x-2">
                      <Zap className="h-5 w-5 text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-white mb-1">Smart Dependencies</h4>
                        <p className="text-blue-100 text-sm">
                          We'll automatically create these required resources: {' '}
                          <span className="font-medium">
                            {selectedService.dependencies.map(dep => dep.toUpperCase().replace('_', ' ')).join(', ')}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {selectedService.required_fields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {field.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        {field.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      
                      {field.type === 'select' ? (
                        <select 
                          value={formData[field.name] || field.default || ''}
                          onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                          className="w-full bg-gray-900 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select {field.name.replace(/_/g, ' ')}</option>
                          {field.options?.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : field.type === 'boolean' ? (
                        <div className="flex items-center space-x-3">
                          <input 
                            type="checkbox"
                            checked={formData[field.name] || field.default || false}
                            onChange={(e) => setFormData({...formData, [field.name]: e.target.checked})}
                            className="w-4 h-4 text-blue-600 bg-gray-900 border-gray-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-gray-300">Enable {field.name.replace(/_/g, ' ')}</span>
                        </div>
                      ) : (
                        <input 
                          type={field.name.includes('password') ? 'password' : 'text'}
                          value={formData[field.name] || field.default || ''}
                          onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                          className="w-full bg-gray-900 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`Enter ${field.name.replace(/_/g, ' ')}`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <button 
                  onClick={generateTerraformCode}
                  disabled={!selectedService.required_fields.every(field => 
                    !field.required || formData[field.name] || field.default
                  )}
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Code className="h-5 w-5" />
                  <span>Generate Terraform Code</span>
                </button>
              </motion.div>
            )}
          </div>

          {/* Code Output Panel */}
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

                {/* Resource Summary */}
                <div className="mb-6 p-4 bg-gray-900 rounded-lg">
                  <h3 className="font-semibold text-white mb-3">Resources Created:</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Main Resources:</h4>
                      <ul className="text-sm text-green-400 space-y-1">
                        {generatedCode.resources.map((resource, index) => (
                          <li key={index}>• {resource.type}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Dependencies:</h4>
                      <ul className="text-sm text-yellow-400 space-y-1">
                        {generatedCode.dependencies.map((dep, index) => (
                          <li key={index}>• {dep.type}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Code Display */}
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

                {/* Deployment Options */}
                <div className="mt-6 p-4 bg-green-900 bg-opacity-30 border border-green-600 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Play className="h-5 w-5 text-green-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white mb-2">Ready to Deploy!</h4>
                      <p className="text-green-100 text-sm mb-3">
                        Your Terraform configuration is ready. You can now deploy this infrastructure to your connected cloud account.
                      </p>
                      <button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center space-x-2">
                        <Play className="h-4 w-4" />
                        <span>Deploy Infrastructure</span>
                      </button>
                    </div>
                  </div>
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