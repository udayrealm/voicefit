import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { ChatService } from '../utils/chatService';
import MicrophoneRecorder from './MicrophoneRecorder';

const ChatAgent: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Test connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      console.log('🔍 ChatAgent: Testing connection to webhook...');
      
      // Try both connection test methods
      const basicConnected = await ChatService.testConnection();
      const postConnected = await ChatService.testWithPost();
      
      const connected = basicConnected || postConnected;
      setIsConnected(connected);
      
      if (connected) {
        console.log('✅ ChatAgent: Connection test successful');
      } else {
        console.log('❌ ChatAgent: Connection test failed - using mock responses');
      }
    };

    testConnection();
  }, []);

  // Add initial welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      content: isConnected === false 
        ? '⚠️ Connection issue detected. I\'ll use local responses for now, but you can still ask me fitness questions!'
        : 'Hello! I\'m your fitness assistant. How can I help you today? You can ask me about workouts, nutrition, or any fitness-related questions.',
      sender: 'agent',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, [isConnected]);

  const addMessage = (content: string, sender: 'user' | 'agent', isLoading = false) => {
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      sender,
      timestamp: new Date(),
      isLoading,
    };
    console.log('📝 ChatAgent: Adding new message:', { id: newMessage.id, content: newMessage.content, sender: newMessage.sender });
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const updateMessage = (messageId: string, updates: Partial<ChatMessage>) => {
    console.log('🔄 ChatAgent: Updating message with ID:', messageId, 'Updates:', updates);
    setMessages(prev => {
      const updated = prev.map(msg => {
        if (msg.id === messageId) {
          console.log('🔄 ChatAgent: Found message to update:', msg.id, 'Old content:', msg.content, 'New content:', updates.content);
          return { ...msg, ...updates };
        }
        return msg;
      });
      console.log('🔄 ChatAgent: Updated messages array:', updated.map(m => ({ id: m.id, content: m.content, sender: m.sender })));
      return updated;
    });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const originalMessage = inputMessage; // Store the original message
    console.log('📤 ChatAgent: User sending message:', originalMessage);
    
    const userMessage = addMessage(originalMessage, 'user');
    console.log('📤 ChatAgent: Added user message with ID:', userMessage.id, 'Content:', userMessage.content);
    
    const loadingMessage = addMessage('', 'agent', true);
    console.log('📤 ChatAgent: Added loading message with ID:', loadingMessage.id);
    
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await ChatService.sendMessage(originalMessage);
      
      console.log('📥 ChatAgent: Received response:', response);
      
      if (response.success) {
        console.log('📥 ChatAgent: Updating loading message with AI response:', response.message);
        updateMessage(loadingMessage.id, {
          content: response.message,
          isLoading: false,
        });
        console.log('✅ ChatAgent: Updated AI response with:', response.message);
      } else {
        console.log('❌ ChatAgent: Response failed, updating with error message');
        updateMessage(loadingMessage.id, {
          content: response.message,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('❌ ChatAgent: Error sending message:', error);
      updateMessage(loadingMessage.id, {
        content: 'Sorry, I encountered an error. Please try again.',
        isLoading: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceRecording = async (audioBlob: Blob) => {
    const userMessage = addMessage('🎤 Voice message', 'user');
    const loadingMessage = addMessage('', 'agent', true);
    
    setIsLoading(true);

    try {
      const response = await ChatService.sendVoiceMessage(audioBlob);
      
      if (response.success) {
        updateMessage(loadingMessage.id, {
          content: response.message,
          isLoading: false,
        });
      } else {
        updateMessage(loadingMessage.id, {
          content: response.message,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('❌ ChatAgent: Error sending voice message:', error);
      updateMessage(loadingMessage.id, {
        content: 'Sorry, I encountered an error processing your voice message. Please try again.',
        isLoading: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTestConnection = async () => {
    console.log('🔍 ChatAgent: Manual connection test...');
    
    // Try both connection test methods
    const basicConnected = await ChatService.testConnection();
    const postConnected = await ChatService.testWithPost();
    const connected = basicConnected || postConnected;
    
    setIsConnected(connected);
    
    const testMessage: ChatMessage = {
      id: Date.now().toString(),
      content: connected 
        ? '✅ Connection test successful! The chat service is working properly.'
        : '❌ Connection test failed. I\'ll use local responses for now, but you can still ask me fitness questions!',
      sender: 'agent',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, testMessage]);
  };

  const handleSendTestMessage = async () => {
    const testMessage = addMessage('🧪 Test message', 'user');
    const loadingMessage = addMessage('', 'agent', true);
    
    setIsLoading(true);

    try {
      const response = await ChatService.sendMessage('Hello, this is a test message');
      
      if (response.success) {
        updateMessage(loadingMessage.id, {
          content: `✅ Test successful! Response: ${response.message}`,
          isLoading: false,
        });
      } else {
        updateMessage(loadingMessage.id, {
          content: `❌ Test failed: ${response.message}`,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('❌ ChatAgent: Test message error:', error);
      updateMessage(loadingMessage.id, {
        content: '❌ Test failed with error. Check console for details.',
        isLoading: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDebugN8n = async () => {
    console.log('🔍 ChatAgent: Debugging n8n response...');
    await ChatService.debugN8nResponse();
    
    const debugMessage: ChatMessage = {
      id: Date.now().toString(),
      content: '🔍 Debug completed! Check the browser console for detailed n8n response information.',
      sender: 'agent',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, debugMessage]);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">💬 Fitness Assistant</h1>
            <p className="text-sm opacity-90">Ask me anything about fitness!</p>
          </div>
          <div className="flex items-center space-x-2">
            {isConnected === true && (
              <span className="text-green-300 text-sm">🟢 Webhook</span>
            )}
            {isConnected === false && (
              <span className="text-orange-300 text-sm">🟡 Local</span>
            )}
            {isConnected === null && (
              <span className="text-yellow-300 text-sm">🟡 Testing...</span>
            )}
            <button
              onClick={handleTestConnection}
              className="text-xs bg-blue-700 hover:bg-blue-800 px-2 py-1 rounded mr-1"
            >
              Test
            </button>
            <button
              onClick={handleSendTestMessage}
              disabled={isLoading}
              className="text-xs bg-green-700 hover:bg-green-800 px-2 py-1 rounded mr-1"
            >
              Send Test
            </button>
            <button
              onClick={handleDebugN8n}
              disabled={isLoading}
              className="text-xs bg-purple-700 hover:bg-purple-800 px-2 py-1 rounded"
            >
              Debug
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-800 shadow-md'
              }`}
            >
              {message.isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  <span>Thinking...</span>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{message.content}</p>
              )}
              <p className={`text-xs mt-1 ${
                message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          {/* Voice Recording Button */}
          <button
            onClick={() => setIsRecording(!isRecording)}
            disabled={isLoading}
            className={`p-3 rounded-full transition-colors ${
              isRecording 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isRecording ? '⏹️' : '🎤'}
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className={`p-3 rounded-full transition-colors ${
              inputMessage.trim() && !isLoading
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            ➤
          </button>
        </div>

        {/* Voice Recording Interface */}
        {isRecording && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <MicrophoneRecorder
              onRecordingComplete={handleVoiceRecording}
            />
            <p className="text-sm text-red-600 mt-2 text-center">
              Recording... Click the microphone button to stop
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatAgent;
