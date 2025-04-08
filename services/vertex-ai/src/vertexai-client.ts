import { VertexAI, HarmCategory, HarmBlockThreshold } from '@google-cloud/vertexai';
import { config } from './config';

export class VertexAIClient {
  private vertexai: VertexAI;
  private model: any;

  constructor() {
    // Initialize the Vertex AI client with Application Default Credentials
    this.vertexai = new VertexAI({
      project: config.projectId,
      location: config.location,
    });

    // Get the model
    if (config.publisher === 'google') {
      if (config.modelName.includes('gemini')) {
        // Initialize a generative model
        this.model = this.vertexai.getGenerativeModel({
          model: config.modelName,
          generationConfig: {
            temperature: config.temperature,
            maxOutputTokens: config.maxOutputTokens,
          },
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
          ],
        });
      } else {
        // For other models like text-bison
        this.model = this.vertexai.preview.getGenerativeModel({
          model: config.modelName,
          generationConfig: {
            temperature: config.temperature,
            maxOutputTokens: config.maxOutputTokens,
          },
        });
      }
    } else {
      throw new Error(`Publisher ${config.publisher} not supported`);
    }
  }

  /**
   * Generate text using Vertex AI
   * @param prompt The prompt to generate text from
   * @returns The generated text
   */
  async generateText(prompt: string): Promise<string> {
    try {
      console.log(`Generating text for prompt: ${prompt}`);
      
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      
      const response = result.response;
      return response.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error generating text:', error);
      throw error;
    }
  }

  /**
   * Validate that authentication is working correctly
   */
  async testAuthentication(): Promise<boolean> {
    try {
      // Try a simple prompt to verify authentication
      const result = await this.generateText('Hello, can you verify Vertex AI authentication is working?');
      console.log('Authentication successful.');
      return true;
    } catch (error) {
      console.error('Authentication failed:', error);
      return false;
    }
  }
}
