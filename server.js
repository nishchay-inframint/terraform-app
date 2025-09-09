import express from 'express';
import cors from 'cors';
import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';
import { EC2Client, DescribeRegionsCommand } from '@aws-sdk/client-ec2';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Import Amazon Q routes
const generateRoutes = await import('./backend/routes/generate.js');
app.use('/api/generate', generateRoutes.default);

// Import Terraform routes
const terraformRoutes = await import('./backend/routes/terraform.js');
app.use('/api/terraform', terraformRoutes.default);

// In-memory storage for demo (use database in production)
const awsConnections = new Map();

const GITHUB_CLIENT_ID = 'Ov23lirFHb0j2Sdleix8';
const GITHUB_CLIENT_SECRET = '5d1ef090f27b732dce8c4597a612ea3452f8b409';
const GOOGLE_CLIENT_ID = '90927507397-npd3aaijqog4hrtnq1lhj894c55u1r7r.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';

app.post('/api/auth/github', async (req, res) => {
  const { code } = req.body;
  
  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code,
      }),
    });
    
    const tokenData = await tokenResponse.json();
    
    // Get user data
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${tokenData.access_token}`,
      },
    });
    
    const userData = await userResponse.json();
    
    res.json({
      id: userData.id.toString(),
      name: userData.name || userData.login,
      email: userData.email,
      avatar: userData.avatar_url,
      provider: 'github'
    });
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
});

app.post('/api/auth/google', async (req, res) => {
  const { code } = req.body;
  
  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: 'http://localhost:5173/auth/google/callback',
      }),
    });
    
    const tokenData = await tokenResponse.json();
    
    // Get user data
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });
    
    const userData = await userResponse.json();
    
    res.json({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      avatar: userData.picture,
      provider: 'google'
    });
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// AWS Connection endpoint
app.post('/api/aws/connect', async (req, res) => {
  const { roleArn, externalId, userId } = req.body;
  
  try {
    // Validate role ARN format
    if (!roleArn || !roleArn.startsWith('arn:aws:iam::')) {
      return res.status(400).json({ error: 'Invalid Role ARN format' });
    }
    
    // Validate external ID matches user
    if (externalId !== `terraforge-${userId}`) {
      return res.status(400).json({ error: 'External ID does not match user' });
    }
    
    // Test AWS connection by assuming role
    const stsClient = new STSClient({ region: 'us-east-1' });
    const assumeRoleCommand = new AssumeRoleCommand({
      RoleArn: roleArn,
      RoleSessionName: `terraforge-test-${Date.now()}`,
      ExternalId: externalId,
      DurationSeconds: 900 // 15 minutes
    });
    
    const assumeRoleResult = await stsClient.send(assumeRoleCommand);
    
    // Test basic AWS access with assumed credentials
    const ec2Client = new EC2Client({
      region: 'us-east-1',
      credentials: {
        accessKeyId: assumeRoleResult.Credentials.AccessKeyId,
        secretAccessKey: assumeRoleResult.Credentials.SecretAccessKey,
        sessionToken: assumeRoleResult.Credentials.SessionToken
      }
    });
    
    // Test connection by listing regions
    await ec2Client.send(new DescribeRegionsCommand({}));
    
    // Store connection info (encrypt in production)
    awsConnections.set(userId, {
      roleArn,
      externalId,
      connected: true,
      connectedAt: new Date().toISOString(),
      accountId: roleArn.split(':')[4]
    });
    
    res.json({
      success: true,
      message: 'AWS account connected successfully',
      accountId: roleArn.split(':')[4],
      connectedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('AWS connection error:', error);
    res.status(500).json({ 
      error: 'Failed to connect to AWS account',
      details: error.message
    });
  }
});

// Get AWS connection status
app.get('/api/aws/status/:userId', (req, res) => {
  const { userId } = req.params;
  const connection = awsConnections.get(userId);
  
  if (connection) {
    res.json({
      connected: true,
      accountId: connection.accountId,
      connectedAt: connection.connectedAt
    });
  } else {
    res.json({ connected: false });
  }
});

// Disconnect AWS account
app.delete('/api/aws/disconnect/:userId', (req, res) => {
  const { userId } = req.params;
  awsConnections.delete(userId);
  res.json({ success: true, message: 'AWS account disconnected' });
});

app.listen(3001, () => {
  console.log('Auth server running on port 3001');
});