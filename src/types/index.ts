export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  provider: 'github' | 'google';
}

export interface CloudProvider {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  services: CloudService[];
}

export interface CloudService {
  id: string;
  name: string;
  category: string;
  description: string;
  dependencies?: string[];
  required_fields: Field[];
}

export interface Field {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  required: boolean;
  options?: string[];
  default?: any;
}

export interface TerraformResource {
  type: string;
  name: string;
  config: Record<string, any>;
}

export interface GeneratedCode {
  resources: TerraformResource[];
  dependencies: TerraformResource[];
  code: string;
}