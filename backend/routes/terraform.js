import express from 'express';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Create a temporary directory for Terraform files
const createTempDir = async (userId, projectName) => {
  const tempDir = path.join(__dirname, '..', 'temp', `${userId}-${projectName}-${Date.now()}`);
  await fs.mkdir(tempDir, { recursive: true });
  return tempDir;
};

// Write Terraform files to directory
const writeTerraformFiles = async (tempDir, files) => {
  for (const [filename, content] of Object.entries(files)) {
    await fs.writeFile(path.join(tempDir, filename), content);
  }
};

// Execute Terraform command
const executeTerraformCommand = (command, workingDir) => {
  return new Promise((resolve, reject) => {
    const output = [];
    const errors = [];
    
    const process = spawn('terraform', command.split(' '), {
      cwd: workingDir,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    process.stdout.on('data', (data) => {
      const line = data.toString();
      output.push(line);
    });
    
    process.stderr.on('data', (data) => {
      const line = data.toString();
      errors.push(line);
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, output: output.join(''), errors: errors.join('') });
      } else {
        reject({ success: false, output: output.join(''), errors: errors.join(''), code });
      }
    });
    
    process.on('error', (error) => {
      reject({ success: false, error: error.message });
    });
  });
};

// Deploy infrastructure
router.post('/deploy', async (req, res) => {
  const { files, userId, projectName } = req.body;
  
  if (!files || !userId || !projectName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  let tempDir;
  
  try {
    // Create temporary directory and write files
    tempDir = await createTempDir(userId, projectName);
    await writeTerraformFiles(tempDir, files);
    
    const steps = [];
    
    // Step 1: terraform init
    steps.push({ step: 'init', message: 'Initializing Terraform...' });
    const initResult = await executeTerraformCommand('init', tempDir);
    steps.push({ step: 'init', message: 'Terraform initialized successfully', success: true });
    
    // Step 2: terraform plan
    steps.push({ step: 'plan', message: 'Planning infrastructure changes...' });
    const planResult = await executeTerraformCommand('plan', tempDir);
    steps.push({ step: 'plan', message: 'Planning completed successfully', success: true });
    
    // Step 3: terraform apply (with auto-approve for demo)
    steps.push({ step: 'apply', message: 'Applying infrastructure changes...' });
    const applyResult = await executeTerraformCommand('apply -auto-approve', tempDir);
    steps.push({ step: 'apply', message: 'Infrastructure deployed successfully!', success: true });
    
    res.json({
      success: true,
      steps,
      output: {
        init: initResult.output,
        plan: planResult.output,
        apply: applyResult.output
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Deployment failed',
      output: error.output,
      errors: error.errors
    });
  } finally {
    // Clean up temporary directory
    if (tempDir) {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error('Failed to cleanup temp directory:', cleanupError);
      }
    }
  }
});

// Destroy infrastructure
router.post('/destroy', async (req, res) => {
  const { files, userId, projectName } = req.body;
  
  if (!files || !userId || !projectName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  let tempDir;
  
  try {
    // Create temporary directory and write files
    tempDir = await createTempDir(userId, projectName);
    await writeTerraformFiles(tempDir, files);
    
    const steps = [];
    
    // Step 1: terraform init
    steps.push({ step: 'init', message: 'Initializing Terraform...' });
    const initResult = await executeTerraformCommand('init', tempDir);
    steps.push({ step: 'init', message: 'Terraform initialized successfully', success: true });
    
    // Step 2: terraform plan -destroy
    steps.push({ step: 'plan-destroy', message: 'Planning infrastructure destruction...' });
    const planResult = await executeTerraformCommand('plan -destroy', tempDir);
    steps.push({ step: 'plan-destroy', message: 'Destruction plan completed', success: true });
    
    // Step 3: terraform destroy (with auto-approve for demo)
    steps.push({ step: 'destroy', message: 'Destroying infrastructure...' });
    const destroyResult = await executeTerraformCommand('destroy -auto-approve', tempDir);
    steps.push({ step: 'destroy', message: 'Infrastructure destroyed successfully!', success: true });
    
    res.json({
      success: true,
      steps,
      output: {
        init: initResult.output,
        plan: planResult.output,
        destroy: destroyResult.output
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Destruction failed',
      output: error.output,
      errors: error.errors
    });
  } finally {
    // Clean up temporary directory
    if (tempDir) {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error('Failed to cleanup temp directory:', cleanupError);
      }
    }
  }
});

// Validate Terraform files
router.post('/validate', async (req, res) => {
  const { files, userId, projectName } = req.body;
  
  if (!files || !userId || !projectName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  let tempDir;
  
  try {
    // Create temporary directory and write files
    tempDir = await createTempDir(userId, projectName);
    await writeTerraformFiles(tempDir, files);
    
    // Initialize and validate
    await executeTerraformCommand('init', tempDir);
    const validateResult = await executeTerraformCommand('validate', tempDir);
    
    res.json({
      success: true,
      message: 'Terraform configuration is valid',
      output: validateResult.output
    });
    
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Terraform validation failed',
      output: error.output,
      errors: error.errors
    });
  } finally {
    // Clean up temporary directory
    if (tempDir) {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error('Failed to cleanup temp directory:', cleanupError);
      }
    }
  }
});

export default router;