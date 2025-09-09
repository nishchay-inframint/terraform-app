const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

class AmazonQService {
  constructor() {
    this.client = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
  }

  async generateTerraformCode(prompt, provider, service, requirements) {
    const systemPrompt = `You are an expert Terraform code generator. Generate production-ready Terraform code based on the user's requirements. Always include:
- Provider configuration
- Resource definitions with best practices
- Variables for customization
- Outputs for important values
- Proper naming conventions
- Security best practices`;

    const userPrompt = `Generate Terraform code for ${provider} ${service} with these requirements:
${JSON.stringify(requirements, null, 2)}

Additional context: ${prompt}

Please provide complete, working Terraform code with proper structure.`;

    try {
      const command = new InvokeModelCommand({
        modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: 4000,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: userPrompt
            }
          ]
        })
      });

      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      return {
        success: true,
        code: responseBody.content[0].text,
        model: 'claude-3-sonnet'
      };
    } catch (error) {
      console.error('Amazon Q API Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async optimizeTerraformCode(existingCode, optimizationGoals) {
    const prompt = `Optimize this Terraform code for: ${optimizationGoals.join(', ')}

Current code:
\`\`\`hcl
${existingCode}
\`\`\`

Please provide optimized version with explanations.`;

    return this.generateTerraformCode(prompt, 'optimization', 'code-review', {});
  }
}

module.exports = AmazonQService;