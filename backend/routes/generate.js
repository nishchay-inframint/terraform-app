import express from 'express';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const router = express.Router();

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

router.post('/terraform', async (req, res) => {
  try {
    const { prompt, provider, service, requirements } = req.body;
    
    const systemPrompt = `You are an expert Terraform code generator. Generate production-ready Terraform code with proper structure, variables, and outputs.`;
    
    const userPrompt = `Generate Terraform code for ${provider} ${service}:
${JSON.stringify(requirements, null, 2)}

Context: ${prompt}`;
    
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });
    
    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    res.json({
      success: true,
      code: responseBody.content[0].text,
      model: 'claude-3-sonnet'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;