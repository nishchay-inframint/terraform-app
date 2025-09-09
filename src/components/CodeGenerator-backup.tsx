import React, { useState, useRef, useEffect } from 'react';
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
  Shield,
  FileText,
  Archive,
  Trash2,
  Terminal,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader
} from 'lucide-react';
import { FaAws } from 'react-icons/fa';
import { SiGooglecloud } from 'react-icons/si';
import { Icon } from '@iconify/react';
import JSZip from 'jszip';
import { User, CloudService, GeneratedCode } from '../types';

const AWSIcon = () => <FaAws className="w-8 h-8 text-orange-500" />;
const GCPIcon = () => <SiGooglecloud className="w-8 h-8 text-blue-500" />;
const AzureIcon = () => <Icon icon="logos:microsoft-azure" className="w-8 h-8" />;

interface CodeGeneratorProps {
  user: User;
}

const CodeGenerator: React.FC<CodeGeneratorProps> = ({ user }) => {
  const [selectedProvider, setSelectedProvider] = useState('aws');
  const [selectedService, setSelectedService] = useState<CloudService | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<string>('main.tf');
  const [copied, setCopied] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isDestroying, setIsDestroying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle');
  const [destroyStatus, setDestroyStatus] = useState<'idle' | 'destroying' | 'success' | 'error'>('idle');
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
  const [cliOutput, setCliOutput] = useState<string[]>([]);
  const [showCli, setShowCli] = useState(false);
  const cliRef = useRef<HTMLDivElement>(null);

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
            { name: 'instance_type', type: 'select', required: true, options: ['t2.micro', 't2.small', 't2.medium', 't3.micro', 't3.small', 't3.medium'] },
            { name: 'ami_id', type: 'string', required: true, default: 'ami-0c02fb55956c7d316' },
            { name: 'key_pair', type: 'string', required: false },
            { name: 'monitoring', type: 'select', required: true, options: ['Enabled', 'Disabled'], default: 'Disabled' },
            { name: 'ebs_optimized', type: 'select', required: true, options: ['true', 'false'], default: 'false' },
            { name: 'root_volume_size', type: 'string', required: true, default: '20' },
            { name: 'root_volume_type', type: 'select', required: true, options: ['gp3', 'gp2', 'io1', 'io2'], default: 'gp3' }
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
            { name: 'versioning', type: 'select', required: true, options: ['Enabled', 'Disabled'], default: 'Enabled' },
            { name: 'public_access_block', type: 'select', required: true, options: ['Block all public access', 'Allow public access'], default: 'Block all public access' },
            { name: 'encryption', type: 'select', required: true, options: ['AES256', 'aws:kms'], default: 'AES256' },
            { name: 'object_lock', type: 'select', required: false, options: ['Enabled', 'Disabled'], default: 'Disabled' },
            { name: 'lifecycle_policy', type: 'select', required: false, options: ['Enabled', 'Disabled'], default: 'Disabled' }
          ]
        },
        {
          id: 'rds',
          name: 'RDS Database',
          category: 'Database',
          description: 'Managed relational database',
          dependencies: [],
          required_fields: [
            { name: 'db_identifier', type: 'string', required: true },
            { name: 'engine', type: 'select', required: true, options: ['mysql', 'postgres', 'mariadb', 'oracle-ee', 'sqlserver-ex'] },
            { name: 'engine_version', type: 'string', required: true, default: '8.0' },
            { name: 'instance_class', type: 'select', required: true, options: ['db.t3.micro', 'db.t3.small', 'db.t3.medium', 'db.r5.large'] },
            { name: 'allocated_storage', type: 'string', required: true, default: '20' },
            { name: 'storage_type', type: 'select', required: true, options: ['gp2', 'gp3', 'io1'], default: 'gp2' },
            { name: 'multi_az', type: 'select', required: true, options: ['true', 'false'], default: 'false' },
            { name: 'backup_retention', type: 'string', required: true, default: '7' },
            { name: 'storage_encrypted', type: 'select', required: true, options: ['true', 'false'], default: 'true' }
          ]
        },
        {
          id: 'lambda',
          name: 'Lambda Function',
          category: 'Compute',
          description: 'Serverless compute service',
          dependencies: [],
          required_fields: [
            { name: 'function_name', type: 'string', required: true },
            { name: 'runtime', type: 'select', required: true, options: ['python3.9', 'python3.10', 'nodejs18.x', 'nodejs20.x', 'java11', 'java17', 'dotnet6', 'go1.x'] },
            { name: 'memory_size', type: 'select', required: true, options: ['128', '256', '512', '1024', '2048', '3008'], default: '128' },
            { name: 'timeout', type: 'string', required: true, default: '3' },
            { name: 'environment_variables', type: 'select', required: false, options: ['Enabled', 'Disabled'], default: 'Disabled' },
            { name: 'dead_letter_queue', type: 'select', required: false, options: ['Enabled', 'Disabled'], default: 'Disabled' }
          ]
        },
        {
          id: 'vpc',
          name: 'VPC',
          category: 'Networking',
          description: 'Virtual Private Cloud',
          dependencies: [],
          required_fields: [
            { name: 'vpc_name', type: 'string', required: true },
            { name: 'cidr_block', type: 'string', required: true, default: '10.0.0.0/16' },
            { name: 'enable_dns_hostnames', type: 'select', required: true, options: ['true', 'false'], default: 'true' },
            { name: 'enable_dns_support', type: 'select', required: true, options: ['true', 'false'], default: 'true' },
            { name: 'tenancy', type: 'select', required: true, options: ['default', 'dedicated'], default: 'default' }
          ]
        },
        {
          id: 'dynamodb',
          name: 'DynamoDB Table',
          category: 'Database',
          description: 'NoSQL database service',
          dependencies: [],
          required_fields: [
            { name: 'table_name', type: 'string', required: true },
            { name: 'hash_key', type: 'string', required: true }
          ]
        },
        {
          id: 'alb',
          name: 'Application Load Balancer',
          category: 'Networking',
          description: 'Layer 7 load balancer',
          dependencies: [],
          required_fields: [
            { name: 'alb_name', type: 'string', required: true }
          ]
        },
        {
          id: 'api_gateway',
          name: 'API Gateway',
          category: 'Networking',
          description: 'Managed API service',
          dependencies: [],
          required_fields: [
            { name: 'api_name', type: 'string', required: true }
          ]
        },
        {
          id: 'sns',
          name: 'SNS Topic',
          category: 'Messaging',
          description: 'Simple Notification Service',
          dependencies: [],
          required_fields: [
            { name: 'topic_name', type: 'string', required: true }
          ]
        },
        {
          id: 'sqs',
          name: 'SQS Queue',
          category: 'Messaging',
          description: 'Simple Queue Service',
          dependencies: [],
          required_fields: [
            { name: 'queue_name', type: 'string', required: true }
          ]
        },
        {
          id: 'iam_role',
          name: 'IAM Role',
          category: 'Security',
          description: 'Identity and Access Management role',
          dependencies: [],
          required_fields: [
            { name: 'role_name', type: 'string', required: true }
          ]
        },
        {
          id: 'cloudwatch',
          name: 'CloudWatch Log Group',
          category: 'Monitoring',
          description: 'Log management service',
          dependencies: [],
          required_fields: [
            { name: 'log_group_name', type: 'string', required: true }
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
            { name: 'instance_name', type: 'string', required: true },
            { name: 'machine_type', type: 'select', required: true, options: ['e2-micro', 'e2-small', 'n1-standard-1'] }
          ]
        },
        {
          id: 'storage_bucket',
          name: 'Cloud Storage Bucket',
          category: 'Storage',
          description: 'Object storage bucket',
          dependencies: [],
          required_fields: [
            { name: 'bucket_name', type: 'string', required: true },
            { name: 'location', type: 'string', required: true, default: 'US' }
          ]
        },
        {
          id: 'cloud_sql',
          name: 'Cloud SQL Database',
          category: 'Database',
          description: 'Managed relational database',
          dependencies: [],
          required_fields: [
            { name: 'instance_name', type: 'string', required: true },
            { name: 'database_version', type: 'select', required: true, options: ['MYSQL_8_0', 'POSTGRES_13'] }
          ]
        },
        {
          id: 'cloud_function',
          name: 'Cloud Function',
          category: 'Compute',
          description: 'Serverless compute service',
          dependencies: [],
          required_fields: [
            { name: 'function_name', type: 'string', required: true },
            { name: 'runtime', type: 'select', required: true, options: ['python39', 'nodejs16', 'go116'] }
          ]
        },
        {
          id: 'vpc_network',
          name: 'VPC Network',
          category: 'Networking',
          description: 'Virtual Private Cloud network',
          dependencies: [],
          required_fields: [
            { name: 'network_name', type: 'string', required: true }
          ]
        },
        {
          id: 'gke_cluster',
          name: 'GKE Cluster',
          category: 'Compute',
          description: 'Kubernetes cluster service',
          dependencies: [],
          required_fields: [
            { name: 'cluster_name', type: 'string', required: true },
            { name: 'location', type: 'string', required: true, default: 'us-central1-a' }
          ]
        },
        {
          id: 'firestore',
          name: 'Firestore Database',
          category: 'Database',
          description: 'NoSQL document database',
          dependencies: [],
          required_fields: [
            { name: 'database_id', type: 'string', required: true }
          ]
        },
        {
          id: 'load_balancer',
          name: 'Load Balancer',
          category: 'Networking',
          description: 'HTTP(S) load balancer',
          dependencies: [],
          required_fields: [
            { name: 'lb_name', type: 'string', required: true }
          ]
        },
        {
          id: 'pubsub_topic',
          name: 'Pub/Sub Topic',
          category: 'Messaging',
          description: 'Messaging service',
          dependencies: [],
          required_fields: [
            { name: 'topic_name', type: 'string', required: true }
          ]
        },
        {
          id: 'iam_service_account',
          name: 'Service Account',
          category: 'Security',
          description: 'Identity and access management',
          dependencies: [],
          required_fields: [
            { name: 'account_id', type: 'string', required: true }
          ]
        },
        {
          id: 'cloud_monitoring',
          name: 'Cloud Monitoring',
          category: 'Monitoring',
          description: 'Monitoring and alerting service',
          dependencies: [],
          required_fields: [
            { name: 'workspace_name', type: 'string', required: true }
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
          dependencies: [],
          required_fields: [
            { name: 'vm_name', type: 'string', required: true },
            { name: 'vm_size', type: 'select', required: true, options: ['Standard_B1s', 'Standard_B2s', 'Standard_D2s_v3'] }
          ]
        },
        {
          id: 'storage_account',
          name: 'Storage Account',
          category: 'Storage',
          description: 'Azure blob storage account',
          dependencies: [],
          required_fields: [
            { name: 'storage_name', type: 'string', required: true },
            { name: 'account_tier', type: 'select', required: true, options: ['Standard', 'Premium'] }
          ]
        },
        {
          id: 'sql_database',
          name: 'SQL Database',
          category: 'Database',
          description: 'Azure SQL managed database',
          dependencies: [],
          required_fields: [
            { name: 'database_name', type: 'string', required: true },
            { name: 'server_name', type: 'string', required: true }
          ]
        },
        {
          id: 'function_app',
          name: 'Function App',
          category: 'Compute',
          description: 'Serverless compute service',
          dependencies: [],
          required_fields: [
            { name: 'function_name', type: 'string', required: true },
            { name: 'runtime_stack', type: 'select', required: true, options: ['dotnet', 'node', 'python'] }
          ]
        },
        {
          id: 'virtual_network',
          name: 'Virtual Network',
          category: 'Networking',
          description: 'Azure virtual network',
          dependencies: [],
          required_fields: [
            { name: 'vnet_name', type: 'string', required: true },
            { name: 'address_space', type: 'string', required: true, default: '10.0.0.0/16' }
          ]
        },
        {
          id: 'aks_cluster',
          name: 'AKS Cluster',
          category: 'Compute',
          description: 'Azure Kubernetes Service',
          dependencies: [],
          required_fields: [
            { name: 'cluster_name', type: 'string', required: true },
            { name: 'node_count', type: 'string', required: true, default: '3' }
          ]
        },
        {
          id: 'cosmos_db',
          name: 'Cosmos DB',
          category: 'Database',
          description: 'NoSQL database service',
          dependencies: [],
          required_fields: [
            { name: 'account_name', type: 'string', required: true },
            { name: 'api_type', type: 'select', required: true, options: ['Sql', 'MongoDB', 'Cassandra'] }
          ]
        },
        {
          id: 'load_balancer',
          name: 'Load Balancer',
          category: 'Networking',
          description: 'Azure load balancer',
          dependencies: [],
          required_fields: [
            { name: 'lb_name', type: 'string', required: true }
          ]
        },
        {
          id: 'service_bus',
          name: 'Service Bus',
          category: 'Messaging',
          description: 'Enterprise messaging service',
          dependencies: [],
          required_fields: [
            { name: 'namespace_name', type: 'string', required: true }
          ]
        },
        {
          id: 'key_vault',
          name: 'Key Vault',
          category: 'Security',
          description: 'Secrets management service',
          dependencies: [],
          required_fields: [
            { name: 'vault_name', type: 'string', required: true }
          ]
        },
        {
          id: 'log_analytics',
          name: 'Log Analytics Workspace',
          category: 'Monitoring',
          description: 'Log collection and analysis',
          dependencies: [],
          required_fields: [
            { name: 'workspace_name', type: 'string', required: true }
          ]
        },
        {
          id: 'app_service',
          name: 'App Service',
          category: 'Compute',
          description: 'Web app hosting service',
          dependencies: [],
          required_fields: [
            { name: 'app_name', type: 'string', required: true },
            { name: 'sku_tier', type: 'select', required: true, options: ['Free', 'Basic', 'Standard'] }
          ]
        },
        {
          id: 'redis_cache',
          name: 'Redis Cache',
          category: 'Database',
          description: 'In-memory data store',
          dependencies: [],
          required_fields: [
            { name: 'cache_name', type: 'string', required: true },
            { name: 'sku_name', type: 'select', required: true, options: ['Basic', 'Standard', 'Premium'] }
          ]
        },
        {
          id: 'application_gateway',
          name: 'Application Gateway',
          category: 'Networking',
          description: 'Web traffic load balancer',
          dependencies: [],
          required_fields: [
            { name: 'gateway_name', type: 'string', required: true }
          ]
        },
        {
          id: 'event_hub',
          name: 'Event Hub',
          category: 'Messaging',
          description: 'Big data streaming platform',
          dependencies: [],
          required_fields: [
            { name: 'eventhub_name', type: 'string', required: true }
          ]
        },
        {
          id: 'managed_identity',
          name: 'Managed Identity',
          category: 'Security',
          description: 'Azure AD identity service',
          dependencies: [],
          required_fields: [
            { name: 'identity_name', type: 'string', required: true }
          ]
        },
        {
          id: 'application_insights',
          name: 'Application Insights',
          category: 'Monitoring',
          description: 'Application performance monitoring',
          dependencies: [],
          required_fields: [
            { name: 'app_insights_name', type: 'string', required: true }
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
    'Security': { icon: Shield, color: 'text-red-400' },
    'Messaging': { icon: Network, color: 'text-orange-400' },
    'Monitoring': { icon: Shield, color: 'text-gray-400' }
  };

  const getCategoryStyle = (category: string) => {
    const styles = {
      'Compute': 'bg-blue-900/50 text-blue-300',
      'Storage': 'bg-green-900/50 text-green-300',
      'Database': 'bg-purple-900/50 text-purple-300',
      'Networking': 'bg-yellow-900/50 text-yellow-300',
      'Security': 'bg-red-900/50 text-red-300',
      'Messaging': 'bg-orange-900/50 text-orange-300',
      'Monitoring': 'bg-gray-900/50 text-gray-300'
    };
    return styles[category as keyof typeof styles] || 'bg-gray-900/50 text-gray-300';
  };

  const generateTerraformCode = async () => {
    if (!selectedService) return;
    
    try {
      // Call Amazon Q API for real-time generation
      const response = await fetch('/api/generate/terraform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Generate Terraform code for ${selectedService.name}`,
          provider: selectedProvider,
          service: selectedService.id,
          requirements: formData
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Parse AI-generated code into files
        const files = parseAIGeneratedCode(result.code);
        setGeneratedFiles(files);
        setSelectedFile('main.tf');
        
        setGeneratedCode({
          resources: [{ type: selectedService.id, name: 'main' }],
          dependencies: selectedService.dependencies || [],
          code: result.code
        });
      } else {
        // Fallback to existing generation
        const files = generateTerraformFiles();
        setGeneratedFiles(files);
        setSelectedFile('main.tf');
      }
    } catch (error) {
      console.error('AI generation failed, using fallback:', error);
      // Fallback to existing generation
      const files = generateTerraformFiles();
      setGeneratedFiles(files);
      setSelectedFile('main.tf');
    }
  };
  
  const parseAIGeneratedCode = (aiCode) => {
    // Simple parser to split AI code into files
    const files = {};
    const sections = aiCode.split(/# (\w+\.tf)/g);
    
    for (let i = 1; i < sections.length; i += 2) {
      const filename = sections[i];
      const content = sections[i + 1]?.trim() || '';
      files[filename] = content;
    }
    
    // If no files parsed, put everything in main.tf
    if (Object.keys(files).length === 0) {
      files['main.tf'] = aiCode;
    }
    
    return files;
  };

  const generateTerraformFiles = () => {
    if (!selectedService) return {};
    
    const files: Record<string, string> = {};
    
    // 1. versions.tf - Terraform and provider versions
    files['versions.tf'] = `terraform {
  required_version = ">= 1.0"
  required_providers {
    ${selectedProvider} = {
      source  = "${getProviderSource()}"
      version = "~> ${getProviderVersion()}"
    }
  }
}`;

    // 2. variables.tf - Input variables
    files['variables.tf'] = generateVariables();

    // 3. main.tf - Main resources
    files['main.tf'] = generateMainResources();

    // 4. outputs.tf - Output values
    files['outputs.tf'] = generateOutputs();

    // 5. terraform.tfvars.example - Example variables
    files['terraform.tfvars.example'] = generateTfvarsExample();

    return files;
  };

  const getProviderSource = () => {
    const sources = {
      aws: 'hashicorp/aws',
      gcp: 'hashicorp/google',
      azure: 'hashicorp/azurerm'
    };
    return sources[selectedProvider as keyof typeof sources];
  };

  const getProviderVersion = () => {
    const versions = {
      aws: '5.0',
      gcp: '4.0',
      azure: '3.0'
    };
    return versions[selectedProvider as keyof typeof versions];
  };

  const generateVariables = () => {
    const vars = selectedService?.required_fields.map(field => {
      const description = `${formatFieldName(field.name)} for ${selectedService.name}`;
      const defaultValue = field.default ? `\n  default = "${field.default}"` : '';
      const validation = field.options ? `\n  validation {
    condition     = contains([${field.options.map(opt => `"${opt}"`).join(', ')}], var.${field.name})
    error_message = "Valid values are: ${field.options.join(', ')}"
  }` : '';
      
      return `variable "${field.name}" {
  description = "${description}"
  type        = string${defaultValue}${validation}
}`;
    }).join('\n\n');
    
    return `# Input Variables\n\n${vars}\n\n# Common Tags\nvariable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Environment = "dev"
    Project     = "terraforge"
    ManagedBy   = "terraform"
  }
}`;
  };

  const generateMainResources = () => {
    const resourceName = formData[selectedService?.required_fields[0]?.name] || 'main';
    
    switch (selectedProvider) {
      case 'aws':
        return generateAWSResources(resourceName);
      case 'gcp':
        return generateGCPResources(resourceName);
      case 'azure':
        return generateAzureResources(resourceName);
      default:
        return '# No resources defined';
    }
  };

  const generateAWSResources = (resourceName: string) => {
    if (!selectedService) return '';
    
    const firstField = selectedService.required_fields[0]?.name;
    const commonTags = `\n  tags = merge(var.tags, {\n    Name = var.${firstField}\n  })`;
    
    switch (selectedService.id) {
      case 'ec2':
        const keyPairConfig = formData.key_pair ? `\n  key_name = var.key_pair` : '';
        const monitoringEnabled = formData.monitoring === 'Enabled';
        const ebsOptimized = formData.ebs_optimized === 'true';
        const volumeSize = formData.root_volume_size || '20';
        const volumeType = formData.root_volume_type || 'gp3';
        
        return `# VPC and Networking\nresource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true${commonTags}
}

resource "aws_subnet" "main" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true${commonTags}
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id${commonTags}
}

resource "aws_route_table" "main" {
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }${commonTags}
}

resource "aws_route_table_association" "main" {
  subnet_id      = aws_subnet.main.id
  route_table_id = aws_route_table.main.id
}

# Security Group\nresource "aws_security_group" "main" {
  name_prefix = "\$\{var.instance_name\}-"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }${commonTags}
}

# EC2 Instance\nresource "aws_instance" "main" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.main.id
  vpc_security_group_ids = [aws_security_group.main.id]${keyPairConfig}
  monitoring             = ${monitoringEnabled}
  ebs_optimized          = ${ebsOptimized}
  
  root_block_device {
    volume_type = "${volumeType}"
    volume_size = ${volumeSize}
    encrypted   = true
  }${commonTags}
}

# Data Sources\ndata "aws_availability_zones" "available" {
  state = "available"
}`;
      
      case 's3':
        const blockPublicAccess = formData.public_access_block === 'Block all public access';
        const versioningStatus = formData.versioning || 'Enabled';
        const encryptionAlgorithm = formData.encryption || 'AES256';
        
        return `# S3 Bucket\nresource "aws_s3_bucket" "main" {
  bucket        = var.bucket_name
  force_destroy = true${commonTags}
}

resource "aws_s3_bucket_versioning" "main" {
  bucket = aws_s3_bucket.main.id
  versioning_configuration {
    status = "${versioningStatus}"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "main" {
  bucket = aws_s3_bucket.main.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "${encryptionAlgorithm}"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "main" {
  bucket = aws_s3_bucket.main.id
  
  block_public_acls       = ${blockPublicAccess}
  block_public_policy     = ${blockPublicAccess}
  ignore_public_acls      = ${blockPublicAccess}
  restrict_public_buckets = ${blockPublicAccess}
}${formData.object_lock === 'Enabled' ? `

resource "aws_s3_bucket_object_lock_configuration" "main" {
  bucket = aws_s3_bucket.main.id
  
  rule {
    default_retention {
      mode = "GOVERNANCE"
      days = 30
    }
  }
}` : ''}${formData.lifecycle_policy === 'Enabled' ? `

resource "aws_s3_bucket_lifecycle_configuration" "main" {
  bucket = aws_s3_bucket.main.id
  
  rule {
    id     = "transition_rule"
    status = "Enabled"
    
    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }
    
    transition {
      days          = 90
      storage_class = "GLACIER"
    }
  }
}` : ''}`;
      
      default:
        return `# ${selectedService.name} Resource\nresource "aws_${selectedService.id}" "main" {
  # Configuration will be generated based on service type${commonTags}
}`;
    }
  };

  const generateGCPResources = (resourceName: string) => {
    if (!selectedService) return '';
    
    switch (selectedService.id) {
      case 'compute_instance':
        return `# Compute Instance\nresource "google_compute_instance" "main" {
  name         = var.instance_name
  machine_type = var.machine_type
  zone         = "us-central1-a"
  
  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
      size  = 20
      type  = "pd-standard"
    }
  }
  
  network_interface {
    network = "default"
    access_config {
      // Ephemeral public IP
    }
  }
  
  labels = var.tags
}`;
      
      default:
        return `# ${selectedService.name} Resource\nresource "google_${selectedService.id}" "main" {
  # Configuration will be generated based on service type
  labels = var.tags
}`;
    }
  };

  const generateAzureResources = (resourceName: string) => {
    if (!selectedService) return '';
    
    switch (selectedService.id) {
      case 'virtual_machine':
        return `# Resource Group\nresource "azurerm_resource_group" "main" {
  name     = "rg-\$\{var.vm_name\}"
  location = "East US"
  tags     = var.tags
}

# Virtual Network\nresource "azurerm_virtual_network" "main" {
  name                = "vnet-\$\{var.vm_name\}"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tags                = var.tags
}

resource "azurerm_subnet" "main" {
  name                 = "subnet-\$\{var.vm_name\}"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.1.0/24"]
}

# Network Security Group\nresource "azurerm_network_security_group" "main" {
  name                = "nsg-\$\{var.vm_name\}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  
  security_rule {
    name                       = "SSH"
    priority                   = 1001
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
  
  tags = var.tags
}

# Network Interface\nresource "azurerm_network_interface" "main" {
  name                = "nic-\$\{var.vm_name\}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  
  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.main.id
    private_ip_address_allocation = "Dynamic"
  }
  
  tags = var.tags
}

# Virtual Machine\nresource "azurerm_linux_virtual_machine" "main" {
  name                = var.vm_name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  size                = var.vm_size
  admin_username      = "adminuser"
  
  disable_password_authentication = true
  
  network_interface_ids = [
    azurerm_network_interface.main.id,
  ]
  
  admin_ssh_key {
    username   = "adminuser"
    public_key = file("~/.ssh/id_rsa.pub")
  }
  
  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Premium_LRS"
  }
  
  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-focal"
    sku       = "20_04-lts-gen2"
    version   = "latest"
  }
  
  tags = var.tags
}`;
      
      default:
        return `# ${selectedService.name} Resource\nresource "azurerm_${selectedService.id}" "main" {
  # Configuration will be generated based on service type
  tags = var.tags
}`;
    }
  };

  const generateOutputs = () => {
    if (!selectedService) return '';
    
    switch (selectedProvider) {
      case 'aws':
        if (selectedService.id === 'ec2') {
          return `# Output Values\n\noutput "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.main.id
}

output "instance_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_instance.main.public_ip
}

output "instance_private_ip" {
  description = "Private IP address of the EC2 instance"
  value       = aws_instance.main.private_ip
}

output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}`;
        }
        break;
      case 'gcp':
        if (selectedService.id === 'compute_instance') {
          return `# Output Values\n\noutput "instance_name" {
  description = "Name of the compute instance"
  value       = google_compute_instance.main.name
}

output "instance_external_ip" {
  description = "External IP address of the compute instance"
  value       = google_compute_instance.main.network_interface[0].access_config[0].nat_ip
}`;
        }
        break;
      case 'azure':
        if (selectedService.id === 'virtual_machine') {
          return `# Output Values\n\noutput "vm_name" {
  description = "Name of the virtual machine"
  value       = azurerm_linux_virtual_machine.main.name
}

output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.main.name
}`;
        }
        break;
    }
    
    return `# Output Values\n\noutput "resource_id" {
  description = "ID of the created resource"
  value       = "# Add appropriate resource reference"
}`;
  };

  const generateTfvarsExample = () => {
    const vars = selectedService?.required_fields.map(field => {
      const exampleValue = field.default || (field.options ? field.options[0] : `"example-${field.name}"`);
      return `${field.name} = ${typeof exampleValue === 'string' && !field.options ? `"${exampleValue}"` : exampleValue}`;
    }).join('\n');
    
    return `# Example Terraform Variables\n# Copy this file to terraform.tfvars and customize the values\n\n${vars}\n\n# Common tags for all resources\ntags = {
  Environment = "dev"
  Project     = "my-project"
  Owner       = "${user.name || 'user'}"
  ManagedBy   = "terraform"
}`;
  };

  const copyToClipboard = async (content?: string) => {
    const textToCopy = content || (selectedFile && generatedFiles[selectedFile]) || generatedCode?.code;
    if (textToCopy) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const downloadFile = (filename: string, content: string) => {
    try {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download:', err);
    }
  };

  const downloadZip = async () => {
    if (Object.keys(generatedFiles).length === 0) return;
    
    try {
      const zip = new JSZip();
      
      Object.entries(generatedFiles).forEach(([filename, content]) => {
        zip.file(filename, content);
      });
      
      const readme = `# Terraform Project\n\nGenerated by TerraForge for ${selectedService?.name}\n\n## Usage\n\n1. Review and customize variables in \`terraform.tfvars\`\n2. Initialize Terraform: \`terraform init\`\n3. Plan deployment: \`terraform plan\`\n4. Apply changes: \`terraform apply\`\n\n## Files\n\n${Object.keys(generatedFiles).map(f => `- \`${f}\`: ${getFileDescription(f)}`).join('\n')}`;
      zip.file('README.md', readme);
      
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedService?.name || 'terraform'}-project.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create zip:', err);
    }
  };

  const getFileDescription = (filename: string) => {
    const descriptions: Record<string, string> = {
      'versions.tf': 'Terraform and provider version constraints',
      'variables.tf': 'Input variable definitions',
      'main.tf': 'Main resource configurations',
      'outputs.tf': 'Output value definitions',
      'terraform.tfvars.example': 'Example variable values'
    };
    return descriptions[filename] || 'Configuration file';
  };

  const addCliOutput = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = {
      info: '[INFO]',
      success: '[SUCCESS]',
      error: '[ERROR]',
      warning: '[WARNING]'
    }[type];
    
    setCliOutput(prev => [...prev, `${timestamp} ${prefix} ${message}`]);
    
    // Auto-scroll to bottom
    setTimeout(() => {
      if (cliRef.current) {
        cliRef.current.scrollTop = cliRef.current.scrollHeight;
      }
    }, 100);
  };

  const simulateDeployment = async () => {
    if (!selectedService || Object.keys(generatedFiles).length === 0) {
      addCliOutput('No Terraform files to deploy', 'error');
      return;
    }

    setIsDeploying(true);
    setDeploymentStatus('deploying');
    setShowCli(true);
    setCliOutput([]);

    try {
      addCliOutput('Starting Terraform deployment...');
      
      const response = await fetch('/api/terraform/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: generatedFiles,
          userId: user.id,
          projectName: selectedService.name.toLowerCase().replace(/\s+/g, '-')
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Display step-by-step output
        result.steps.forEach((step: any) => {
          addCliOutput(step.message, step.success ? 'success' : 'info');
        });
        
        setDeploymentStatus('success');
      } else {
        addCliOutput(`Deployment failed: ${result.error}`, 'error');
        if (result.errors) {
          addCliOutput(result.errors, 'error');
        }
        setDeploymentStatus('error');
      }
    } catch (error) {
      addCliOutput(`Deployment failed: ${error}`, 'error');
      setDeploymentStatus('error');
    } finally {
      setIsDeploying(false);
    }
  };

  const simulateDestroy = async () => {
    if (!selectedService || Object.keys(generatedFiles).length === 0) {
      addCliOutput('No Terraform infrastructure to destroy', 'error');
      return;
    }

    setIsDestroying(true);
    setDestroyStatus('destroying');
    setShowCli(true);
    setCliOutput([]);

    try {
      addCliOutput('Starting Terraform destroy...');
      
      const response = await fetch('/api/terraform/destroy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: generatedFiles,
          userId: user.id,
          projectName: selectedService.name.toLowerCase().replace(/\s+/g, '-')
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Display step-by-step output
        result.steps.forEach((step: any) => {
          addCliOutput(step.message, step.success ? 'success' : step.message.includes('destroy') ? 'warning' : 'info');
        });
        
        setDestroyStatus('success');
      } else {
        addCliOutput(`Destroy failed: ${result.error}`, 'error');
        if (result.errors) {
          addCliOutput(result.errors, 'error');
        }
        setDestroyStatus('error');
      }
    } catch (error) {
      addCliOutput(`Destroy failed: ${error}`, 'error');
      setDestroyStatus('error');
    } finally {
      setIsDestroying(false);
    }
  };

  const validateTerraform = async () => {
    if (!selectedService || Object.keys(generatedFiles).length === 0) {
      addCliOutput('No Terraform files to validate', 'error');
      return;
    }

    setIsValidating(true);
    setValidationStatus('validating');
    setShowCli(true);
    setCliOutput([]);

    try {
      addCliOutput('Validating Terraform configuration...');
      
      const response = await fetch('/api/terraform/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: generatedFiles,
          userId: user.id,
          projectName: selectedService.name.toLowerCase().replace(/\s+/g, '-')
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        addCliOutput('Terraform configuration is valid!', 'success');
        if (result.output) {
          addCliOutput(result.output, 'info');
        }
        setValidationStatus('success');
      } else {
        addCliOutput(`Validation failed: ${result.error}`, 'error');
        if (result.errors) {
          addCliOutput(result.errors, 'error');
        }
        setValidationStatus('error');
      }
    } catch (error) {
      addCliOutput(`Validation failed: ${error}`, 'error');
      setValidationStatus('error');
    } finally {
      setIsValidating(false);
    }
  };

  const clearCliOutput = () => {
    setCliOutput([]);
  };

  useEffect(() => {
    if (cliRef.current) {
      cliRef.current.scrollTop = cliRef.current.scrollHeight;
    }
  }, [cliOutput]);

  const currentProvider = providers[selectedProvider as keyof typeof providers];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="bg-white bg-opacity-90 backdrop-blur-sm border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link 
            to="/dashboard"
            className="flex items-center space-x-3 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>
          
          <div className="flex items-center space-x-3">
            <Code className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold text-gray-800">Terraform Code Generator</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white bg-opacity-80 backdrop-blur-sm p-6 rounded-xl border border-gray-200 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">1. Select Cloud Provider</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(providers).map(([key, provider]) => (
                  <motion.div 
                    key={key}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      selectedProvider === key 
                        ? 'border-blue-500 bg-gradient-to-br from-blue-900/30 to-purple-900/30 shadow-lg' 
                        : 'border-gray-300 hover:border-gray-400 bg-white bg-opacity-60 hover:bg-white hover:bg-opacity-80'
                    }`}
                    onClick={() => setSelectedProvider(key)}
                  >
                    <div className="text-center">
                      <div className="mb-4 flex justify-center">
                        <provider.icon />
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-2">{provider.name}</h3>
                      <p className="text-sm text-gray-600">Full service integration</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white bg-opacity-80 backdrop-blur-sm p-6 rounded-xl border border-gray-200 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">2. Choose Service</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {currentProvider.services.map((service) => {
                  const categoryInfo = serviceCategories[service.category as keyof typeof serviceCategories];
                  return (
                    <motion.div 
                      key={service.id}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 min-h-[160px] flex flex-col ${
                        selectedService?.id === service.id
                          ? 'border-blue-500 bg-gradient-to-br from-blue-900/30 to-purple-900/30 shadow-lg' 
                          : 'border-gray-300 hover:border-gray-400 bg-white bg-opacity-60 hover:bg-white hover:bg-opacity-80'
                      }`}
                      onClick={() => setSelectedService(service)}
                    >
                      <div className="text-center flex-1 flex flex-col justify-between">
                        <div>
                          <div className="mb-3">
                            <categoryInfo.icon className={`h-8 w-8 ${categoryInfo.color} mx-auto`} />
                          </div>
                          <h3 className="font-semibold text-gray-800 mb-2 text-sm leading-tight break-words">{service.name}</h3>
                          <p className="text-xs text-gray-600 mb-3 leading-relaxed break-words">{service.description}</p>
                        </div>
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
                className="bg-white bg-opacity-80 backdrop-blur-sm p-6 rounded-xl border border-gray-200 shadow-lg"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Configure {selectedService.name}</h2>
                
                <div className="space-y-4">
                  {selectedService.required_fields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {formatFieldName(field.name)}
                        {field.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      
                      {field.type === 'select' ? (
                        <select 
                          value={formData[field.name] || field.default || ''}
                          onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                          className="w-full bg-white border border-gray-300 text-gray-800 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                          className="w-full bg-white border border-gray-300 text-gray-800 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <Zap className="h-5 w-5" />
                  <span>Generate with Amazon Q</span>
                </button>

                {Object.keys(generatedFiles).length > 0 && (
                  <div className="mt-4 space-y-3">
                    {/* Validation Button */}
                    <button 
                      onClick={validateTerraform}
                      disabled={isValidating || isDeploying || isDestroying}
                      className={`w-full px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 ${
                        isValidating 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : validationStatus === 'success'
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : validationStatus === 'error'
                          ? 'bg-orange-600 hover:bg-orange-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                      } text-white`}
                    >
                      {isValidating ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : validationStatus === 'success' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : validationStatus === 'error' ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <span>
                        {isValidating ? 'Validating...' : validationStatus === 'success' ? 'Valid Configuration' : validationStatus === 'error' ? 'Validation Failed' : 'Validate Configuration'}
                      </span>
                    </button>

                    {/* Deploy and Destroy Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={simulateDeployment}
                        disabled={isDeploying || isDestroying || isValidating}
                        className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 ${
                          isDeploying 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : deploymentStatus === 'success'
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-green-600 hover:bg-green-700'
                        } text-white`}
                      >
                        {isDeploying ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : deploymentStatus === 'success' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                        <span>
                          {isDeploying ? 'Deploying...' : deploymentStatus === 'success' ? 'Deployed' : 'Deploy'}
                        </span>
                      </button>

                      <button 
                        onClick={simulateDestroy}
                        disabled={isDeploying || isDestroying || isValidating}
                        className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 ${
                          isDestroying 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : destroyStatus === 'success'
                            ? 'bg-gray-600 hover:bg-gray-700'
                            : 'bg-red-600 hover:bg-red-700'
                        } text-white`}
                      >
                        {isDestroying ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : destroyStatus === 'success' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        <span>
                          {isDestroying ? 'Destroying...' : destroyStatus === 'success' ? 'Destroyed' : 'Destroy'}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          <div className="space-y-6">
            {/* Show CLI button when files are generated */}
            {Object.keys(generatedFiles).length > 0 && !showCli && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white bg-opacity-80 backdrop-blur-sm p-4 rounded-xl border border-gray-200 shadow-lg"
              >
                <button 
                  onClick={() => setShowCli(true)}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
                >
                  <Terminal className="h-4 w-4" />
                  <span>Show CLI Terminal</span>
                </button>
              </motion.div>
            )}

            {Object.keys(generatedFiles).length > 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white bg-opacity-80 backdrop-blur-sm p-6 rounded-xl border border-gray-200 shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Terraform Project Files</h2>
                  <button 
                    onClick={downloadZip}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <Archive className="h-4 w-4" />
                    <span>Download ZIP</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4 pb-4 border-b border-gray-700">
                  {Object.keys(generatedFiles).map((filename) => (
                    <button
                      key={filename}
                      onClick={() => setSelectedFile(filename)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1 ${
                        selectedFile === filename
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <FileText className="h-3 w-3" />
                      <span className="truncate">{filename}</span>
                    </button>
                  ))}
                </div>

                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">{selectedFile}</span>
                      <button 
                        onClick={() => copyToClipboard(generatedFiles[selectedFile])}
                        className="text-blue-400 hover:text-blue-300 text-xs flex items-center space-x-1"
                      >
                        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        <span>{copied ? 'Copied!' : 'Copy'}</span>
                      </button>
                      <button 
                        onClick={() => downloadFile(selectedFile, generatedFiles[selectedFile])}
                        className="text-green-400 hover:text-green-300 text-xs flex items-center space-x-1"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                  <pre className="p-4 text-xs text-green-400 overflow-x-auto h-96 overflow-y-auto font-mono">
                    <code>{generatedFiles[selectedFile]}</code>
                  </pre>
                </div>

                <div className="mt-4 p-3 bg-blue-900 bg-opacity-30 border border-blue-600 rounded-lg">
                  <p className="text-blue-300 text-xs">
                    <strong>{selectedFile}:</strong> {getFileDescription(selectedFile)}
                  </p>
                </div>
              </motion.div>

              {/* CLI Terminal */}
              {showCli && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-900 rounded-xl border border-gray-700 shadow-lg overflow-hidden"
                >
                  <div className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
                    <div className="flex items-center space-x-2">
                      <Terminal className="h-4 w-4 text-green-400" />
                      <span className="text-sm font-medium text-gray-300">Terraform CLI</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={clearCliOutput}
                        className="text-gray-400 hover:text-gray-300 text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600"
                      >
                        Clear
                      </button>
                      <button 
                        onClick={() => setShowCli(false)}
                        className="text-gray-400 hover:text-gray-300 text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600"
                      >
                        Hide
                      </button>
                    </div>
                  </div>
                  <div 
                    ref={cliRef}
                    className="p-4 h-64 overflow-y-auto bg-gray-900 font-mono text-sm"
                  >
                    {cliOutput.length === 0 ? (
                      <div className="text-gray-500 italic">CLI output will appear here...</div>
                    ) : (
                      cliOutput.map((line, index) => {
                        const isError = line.includes('[ERROR]');
                        const isSuccess = line.includes('[SUCCESS]');
                        const isWarning = line.includes('[WARNING]');
                        
                        return (
                          <div 
                            key={index} 
                            className={`mb-1 ${
                              isError ? 'text-red-400' : 
                              isSuccess ? 'text-green-400' : 
                              isWarning ? 'text-yellow-400' : 
                              'text-gray-300'
                            }`}
                          >
                            {line}
                          </div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white bg-opacity-80 backdrop-blur-sm p-6 rounded-xl border border-gray-200 shadow-lg text-center h-80 flex flex-col justify-center"
              >
                <Code className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Generated Code Will Appear Here</h3>
                <p className="text-gray-500 text-sm">
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