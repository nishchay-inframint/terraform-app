import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Cloud, 
  Zap, 
  Shield, 
  Code, 
  Server, 
  Database, 
  Network,
  Monitor,
  ArrowRight,
  Github,
  Play
} from 'lucide-react';
import { FaAws } from 'react-icons/fa';
import { SiGooglecloud } from 'react-icons/si';
import { Icon } from '@iconify/react';

const AzureIcon = () => (
  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
    <Icon icon="logos:microsoft-azure" className="w-16 h-16" />
  </div>
);

const HomePage: React.FC = () => {
  const services = [
    { icon: Server, name: 'Compute', desc: 'EC2, VMs, Functions' },
    { icon: Database, name: 'Storage', desc: 'S3, Blob, Cloud SQL' },
    { icon: Network, name: 'Networking', desc: 'VPC, Load Balancers' },
    { icon: Shield, name: 'Security', desc: 'IAM, Firewalls, KMS' },
    { icon: Monitor, name: 'Monitoring', desc: 'CloudWatch, Metrics' },
    { icon: Code, name: 'DevOps', desc: 'CI/CD, Containers' }
  ];

  const providers = [
    { name: 'AWS', icon: FaAws, color: 'from-orange-500 to-yellow-500' },
    { name: 'GCP', icon: SiGooglecloud, color: 'from-blue-500 to-green-500' },
    { name: 'Azure', icon: AzureIcon, color: 'from-blue-600 to-purple-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100">
      {/* Navigation */}
      <nav className="px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <Cloud className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-gray-800">TerraForge</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link 
              to="/auth"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg"
            >
              Sign in
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-bold text-gray-800 mb-6"
          >
            Generate <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Terraform</span>
            <br />Infrastructure as Code
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto"
          >
            Create production-ready infrastructure across AWS, GCP, and Azure with intelligent 
            dependency resolution and one-click deployment.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center space-x-4"
          >
            <Link 
              to="/auth"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-bold text-lg flex items-center transition-all transform hover:scale-105 shadow-lg"
            >
              Start Building <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:shadow-lg transition-all flex items-center bg-white bg-opacity-70">
              <Play className="mr-2 h-5 w-5" /> Watch Demo
            </button>
          </motion.div>
        </div>
      </section>

      {/* Cloud Providers */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl font-bold text-gray-800 text-center mb-12"
          >
            Supported Cloud Providers
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {providers.map((provider, index) => (
              <motion.div
                key={provider.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className={`bg-gradient-to-br ${provider.color} p-8 rounded-xl text-white text-center`}
              >
                <provider.icon className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">{provider.name}</h3>
                <p className="text-sm opacity-90">Full service integration</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl font-bold text-gray-800 text-center mb-12"
          >
            Infrastructure Services
          </motion.h2>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white bg-opacity-80 backdrop-blur-sm p-6 rounded-xl text-center hover:bg-white hover:shadow-lg transition-all border border-gray-200"
              >
                <service.icon className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{service.name}</h3>
                <p className="text-sm text-gray-600">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                Intelligent Infrastructure Generation
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Smart Dependencies</h3>
                    <p className="text-gray-600">Automatically resolve and create required resources like VPCs, subnets, and security groups.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-600 p-2 rounded-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Secure Connections</h3>
                    <p className="text-gray-600">Connect your cloud accounts securely using industry-standard OAuth and IAM roles.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-green-600 p-2 rounded-lg">
                    <Code className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Production Ready</h3>
                    <p className="text-gray-600">Generate clean, well-structured Terraform code following best practices.</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="bg-white bg-opacity-80 backdrop-blur-sm p-8 rounded-xl border border-gray-200 shadow-lg"
            >
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg font-mono text-sm text-green-400">
                  <div className="mb-2"># Auto-generated Terraform</div>
                  <div className="text-purple-400">resource "aws_vpc" "main" &lbrace;</div>
                  <div className="ml-4 text-blue-400">cidr_block = "10.0.0.0/16"</div>
                  <div className="text-purple-400">&rbrace;</div>
                  <div className="mt-2 text-purple-400">resource "aws_instance" "web" &lbrace;</div>
                  <div className="ml-4 text-blue-400">ami = "ami-0c02fb55956c7d316"</div>
                  <div className="ml-4 text-blue-400">instance_type = "t2.micro"</div>
                  <div className="text-purple-400">&rbrace;</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl font-bold text-gray-800 mb-6"
          >
            Ready to Transform Your Infrastructure?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-xl text-gray-600 mb-8"
          >
            Join thousands of developers who trust TerraForge for their infrastructure automation.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link 
              to="/auth"
              className="bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 inline-flex items-center"
            >
              <Github className="mr-3 h-5 w-5" />
              Sign up with GitHub
            </Link>
            <Link 
              to="/auth"
              className="bg-white hover:bg-gray-100 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 inline-flex items-center"
            >
              <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;