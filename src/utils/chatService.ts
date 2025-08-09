import { ChatAgentResponse } from '../types';

const CHAT_WEBHOOK_URL = 'https://yousefakil1996.app.n8n.cloud/webhook/4091fa09-fb9a-4039-9411-7104d213f601/chat';
const CHAT_WEBHOOK_URL_ALT = 'https://yousefakil1996.app.n8n.cloud/webhook/4091fa09-fb9a-4039-9411-7104d213f601';

// Mock responses for when webhook is unavailable
const MOCK_RESPONSES = {
  greetings: [
    "Hello! I'm your fitness assistant. How can I help you today?",
    "Hi there! I'm here to help with your fitness journey. What would you like to know?",
    "Welcome! I'm your AI fitness coach. Ask me anything about workouts, nutrition, or fitness tips!"
  ],
  workouts: [
    "Great question! For a good workout, try 3-4 sets of 8-12 reps with moderate weight. Focus on proper form!",
    "I recommend starting with compound exercises like squats, deadlifts, and bench press. These work multiple muscle groups efficiently.",
    "For beginners, start with bodyweight exercises like push-ups, squats, and planks. Build strength gradually!"
  ],
  nutrition: [
    "For muscle building, aim for 1.6-2.2g of protein per kg of body weight daily. Don't forget carbs for energy!",
    "Stay hydrated! Drink water throughout the day, especially before, during, and after workouts.",
    "Eat a balanced diet with lean proteins, complex carbs, and healthy fats. Timing meals around workouts can help performance."
  ],
  motivation: [
    "Remember, consistency beats perfection! Even 20 minutes of exercise is better than nothing.",
    "Set small, achievable goals. Celebrate your progress, no matter how small!",
    "You're doing great! Every workout makes you stronger. Keep pushing forward!"
  ],
  default: [
    "That's an interesting question! I'm here to help with fitness advice, workout plans, and motivation.",
    "I'd be happy to help with that! Feel free to ask about workouts, nutrition, or fitness tips.",
    "Great question! Let me know if you need help with exercise routines, nutrition advice, or fitness motivation."
  ]
};

function getMockResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return MOCK_RESPONSES.greetings[Math.floor(Math.random() * MOCK_RESPONSES.greetings.length)];
  }
  
  if (lowerMessage.includes('workout') || lowerMessage.includes('exercise') || lowerMessage.includes('training')) {
    return MOCK_RESPONSES.workouts[Math.floor(Math.random() * MOCK_RESPONSES.workouts.length)];
  }
  
  if (lowerMessage.includes('nutrition') || lowerMessage.includes('diet') || lowerMessage.includes('food') || lowerMessage.includes('protein')) {
    return MOCK_RESPONSES.nutrition[Math.floor(Math.random() * MOCK_RESPONSES.nutrition.length)];
  }
  
  if (lowerMessage.includes('motivation') || lowerMessage.includes('motivated') || lowerMessage.includes('tired') || lowerMessage.includes('hard')) {
    return MOCK_RESPONSES.motivation[Math.floor(Math.random() * MOCK_RESPONSES.motivation.length)];
  }
  
  return MOCK_RESPONSES.default[Math.floor(Math.random() * MOCK_RESPONSES.default.length)];
}

export class ChatService {
  static async sendMessage(message: string): Promise<ChatAgentResponse> {
    // Try multiple webhook formats
    const urls = [CHAT_WEBHOOK_URL, CHAT_WEBHOOK_URL_ALT];
    
    for (const url of urls) {
      try {
        console.log('🔄 ChatService: Trying webhook URL:', url);
        console.log('🔄 ChatService: Sending message to webhook:', message);
        
        const requestBody = {
          chatInput: message,
          timestamp: new Date().toISOString(),
          type: 'text'
        };

        console.log('📤 ChatService: Request body:', requestBody);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        console.log('📥 ChatService: Response status:', response.status);
        console.log('📥 ChatService: Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ ChatService: HTTP error response:', errorText);
          continue; // Try next URL
        }

        let data;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const textResponse = await response.text();
          console.log('📥 ChatService: Text response:', textResponse);
          data = { message: textResponse };
        }
        
        console.log('📥 ChatService: Parsed response data:', data);
        
        // Try multiple possible response field names
        const responseMessage = data.message || data.response || data.text || data.output || data.result || data.answer || data.reply || data.chatResponse || data.aiResponse || data.content || data.body;
        
        // If no specific field found, try to extract from the full response
        let finalResponse = responseMessage;
        if (!responseMessage && typeof data === 'string') {
          finalResponse = data;
        } else if (!responseMessage && typeof data === 'object') {
          // If it's an object but no specific field, try to find the most likely response field
          const possibleFields = Object.keys(data).filter(key => 
            key.toLowerCase().includes('response') || 
            key.toLowerCase().includes('message') || 
            key.toLowerCase().includes('text') ||
            key.toLowerCase().includes('content') ||
            key.toLowerCase().includes('answer')
          );
          if (possibleFields.length > 0) {
            finalResponse = data[possibleFields[0]];
          } else {
            // Last resort: stringify the entire response
            finalResponse = JSON.stringify(data);
          }
        }
        
        console.log('📥 ChatService: Extracted message:', finalResponse);
        
        return {
          message: finalResponse || 'Thank you for your message!',
          success: true,
        };
      } catch (error) {
        console.error(`❌ ChatService: Error with URL ${url}:`, error);
        continue; // Try next URL
      }
    }
    
    // If all URLs failed, return mock response
    console.log('🔄 ChatService: Using mock response due to webhook failure');
    const mockResponse = getMockResponse(message);
    
    return {
      message: mockResponse,
      success: true,
    };
  }

  static async sendVoiceMessage(audioBlob: Blob): Promise<ChatAgentResponse> {
    // Try multiple webhook formats
    const urls = [CHAT_WEBHOOK_URL, CHAT_WEBHOOK_URL_ALT];
    
    for (const url of urls) {
      try {
        console.log('🔄 ChatService: Trying voice webhook URL:', url);
        console.log('🔄 ChatService: Sending voice message to webhook');
        
        const formData = new FormData();
        formData.append('audio', audioBlob, 'voice-message.wav');
        formData.append('timestamp', new Date().toISOString());
        formData.append('type', 'voice');

        const response = await fetch(url, {
          method: 'POST',
          body: formData,
        });

        console.log('📥 ChatService: Voice response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ ChatService: Voice HTTP error response:', errorText);
          continue; // Try next URL
        }

        let data;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const textResponse = await response.text();
          console.log('📥 ChatService: Voice text response:', textResponse);
          data = { message: textResponse };
        }
        
        console.log('📥 ChatService: Voice parsed response data:', data);
        
        // Try multiple possible response field names
        const responseMessage = data.message || data.response || data.text || data.output || data.result || data.answer || data.reply || data.chatResponse || data.aiResponse || data.content || data.body;
        
        // If no specific field found, try to extract from the full response
        let finalResponse = responseMessage;
        if (!responseMessage && typeof data === 'string') {
          finalResponse = data;
        } else if (!responseMessage && typeof data === 'object') {
          // If it's an object but no specific field, try to find the most likely response field
          const possibleFields = Object.keys(data).filter(key => 
            key.toLowerCase().includes('response') || 
            key.toLowerCase().includes('message') || 
            key.toLowerCase().includes('text') ||
            key.toLowerCase().includes('content') ||
            key.toLowerCase().includes('answer')
          );
          if (possibleFields.length > 0) {
            finalResponse = data[possibleFields[0]];
          } else {
            // Last resort: stringify the entire response
            finalResponse = JSON.stringify(data);
          }
        }
        
        console.log('📥 ChatService: Voice extracted message:', finalResponse);
        
        return {
          message: finalResponse || 'Thank you for your voice message!',
          success: true,
        };
      } catch (error) {
        console.error(`❌ ChatService: Voice error with URL ${url}:`, error);
        continue; // Try next URL
      }
    }
    
    // If all URLs failed, return mock response for voice
    console.log('🔄 ChatService: Using mock response for voice message');
    return {
      message: "I received your voice message! While I'm having trouble processing voice right now, feel free to type your questions. I'm here to help with fitness advice, workout plans, and motivation!",
      success: true,
    };
  }

  // Test method to check if the webhook is accessible
  static async testConnection(): Promise<boolean> {
    const urls = [CHAT_WEBHOOK_URL, CHAT_WEBHOOK_URL_ALT];
    
    for (const url of urls) {
      try {
        console.log('🔍 ChatService: Testing connection to:', url);
        
        // Try both OPTIONS and GET methods
        const methods = ['OPTIONS', 'GET'];
        
        for (const method of methods) {
          try {
            const response = await fetch(url, {
              method: method as any,
              headers: {
                'Accept': 'application/json',
              },
            });
            console.log(`🔍 ChatService: ${method} test status:`, response.status);
            if (response.ok || response.status === 405) { // 405 Method Not Allowed is still OK for webhooks
              return true;
            }
          } catch (methodError) {
            console.log(`🔍 ChatService: ${method} test failed:`, methodError);
          }
        }
      } catch (error) {
        console.error(`❌ ChatService: Connection test failed for ${url}:`, error);
      }
    }
    
    return false;
  }

  // Test with a simple POST request
  static async testWithPost(): Promise<boolean> {
    const urls = [CHAT_WEBHOOK_URL, CHAT_WEBHOOK_URL_ALT];
    
    for (const url of urls) {
      try {
        console.log('🔍 ChatService: Testing POST to:', url);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            test: true,
            chatInput: 'test',
            timestamp: new Date().toISOString(),
          }),
        });
        
        console.log('🔍 ChatService: POST test status:', response.status);
        return response.ok || response.status === 200 || response.status === 201;
      } catch (error) {
        console.error(`❌ ChatService: POST test failed for ${url}:`, error);
      }
    }
    
    return false;
  }

  // Debug function to test n8n response format
  static async debugN8nResponse(): Promise<void> {
    const urls = [CHAT_WEBHOOK_URL, CHAT_WEBHOOK_URL_ALT];
    
    for (const url of urls) {
      try {
        console.log('🔍 ChatService: Debugging n8n response from:', url);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatInput: 'Hello, this is a debug test message',
            timestamp: new Date().toISOString(),
          }),
        });
        
        console.log('🔍 ChatService: Debug response status:', response.status);
        console.log('🔍 ChatService: Debug response headers:', Object.fromEntries(response.headers.entries()));
        
        const contentType = response.headers.get('content-type');
        console.log('🔍 ChatService: Content-Type:', contentType);
        
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log('🔍 ChatService: Debug JSON response:', JSON.stringify(data, null, 2));
        } else {
          const textResponse = await response.text();
          console.log('🔍 ChatService: Debug text response:', textResponse);
        }
        
        return;
      } catch (error) {
        console.error(`❌ ChatService: Debug failed for ${url}:`, error);
      }
    }
  }
}
