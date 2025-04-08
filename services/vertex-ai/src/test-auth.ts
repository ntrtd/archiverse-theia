import { VertexAIClient } from './vertexai-client';

async function testVertexAI() {
  console.log('Testing Vertex AI authentication...');
  
  try {
    const client = new VertexAIClient();
    const isAuthenticated = await client.testAuthentication();
    
    if (isAuthenticated) {
      console.log('✅ Vertex AI authentication successful!');
      
      // Try a simple prompt to test the model
      const prompt = 'Write a short paragraph about artificial intelligence in architecture.';
      console.log(`\nTesting model with prompt: "${prompt}"`);
      
      const response = await client.generateText(prompt);
      console.log('\nResponse from Vertex AI:');
      console.log('------------------------');
      console.log(response);
      console.log('------------------------');
    } else {
      console.error('❌ Vertex AI authentication failed.');
    }
  } catch (error) {
    console.error('❌ Error testing Vertex AI:', error);
  }
}

// Run the test
testVertexAI().catch(console.error);
