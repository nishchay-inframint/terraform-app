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
    { name: 'AWS', logo: '🚀', color: 'from-orange-500 to-yellow-500' },
    { name: 'GCP', logo: '☁️', color: 'from-blue-500 to-green-500' },
    { name: 'Azure', logo: '⚡', color: 'from-blue-600 to-purple-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Navigation */}
      <nav className="px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <Cloud className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">TerraForge</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link 
              to="/auth"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Get Started
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
            className="text-6xl font-bold text-white mb-6"
          >
            Generate <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Terraform</span>
            <br />Infrastructure as Code
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto"
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
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-bold text-lg flex items-center transition-all transform hover:scale-105"
            >
              Start Building <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <button className="border border-gray-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-800 transition-colors flex items-center">
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
            className="text-4xl font-bold text-white text-center mb-12"
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
                <div className="text-6xl mb-4">{provider.logo}</div>
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
            className="text-4xl font-bold text-white text-center mb-12"
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
                className="bg-gray-800 p-6 rounded-xl text-center hover:bg-gray-700 transition-colors"
              >
                <service.icon className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">{service.name}</h3>
                <p className="text-sm text-gray-400">{service.desc}</p>
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
              <h2 className="text-4xl font-bold text-white mb-6">
                Intelligent Infrastructure Generation
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Smart Dependencies</h3>
                    <p className="text-gray-400">Automatically resolve and create required resources like VPCs, subnets, and security groups.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-600 p-2 rounded-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Secure Connections</h3>
                    <p className="text-gray-400">Connect your cloud accounts securely using industry-standard OAuth and IAM roles.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-green-600 p-2 rounded-lg">
                    <Code className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Production Ready</h3>
                    <p className="text-gray-400">Generate clean, well-structured Terraform code following best practices.</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="bg-gray-800 p-8 rounded-xl"
            >
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg font-mono text-sm text-green-400">
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
            className="text-4xl font-bold text-white mb-6"
          >
            Ready to Transform Your Infrastructure?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-xl text-gray-300 mb-8"
          >
            Join thousands of developers who trust TerraForge for their infrastructure automation.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
          >
            <Link 
              to="/auth"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 rounded-lg font-bold text-xl transition-all transform hover:scale-105 inline-flex items-center"
            >
              <Github className="mr-3 h-6 w-6" />
              Sign up with GitHub
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;