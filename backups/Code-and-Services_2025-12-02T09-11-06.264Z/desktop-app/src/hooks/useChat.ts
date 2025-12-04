/**
 * Custom Hook for Chat Management
 */

import { useState, useCallback } from 'react';
import { toast, withRetry } from '../utils';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setInput('');
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      // Remove timestamp field before sending to Groq (Groq only accepts role + content)
      const previousMessagesForGroq = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await withRetry(
        () => window.electronAPI.chatWithGroq(input, {
          previousMessages: previousMessagesForGroq
        }),
        {
          retries: 2,
          delay: 1000,
          onRetry: (attempt) => {
            toast.info('Retrying...', `Attempt ${attempt + 1} to reach AI`);
          }
        }
      );

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Error: ${err.message}. Please check your Groq API key in settings.`,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, errorMessage]);
      setError(err.message);
      toast.error('Chat failed', err.message);
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    toast.info('Chat cleared', 'Conversation history has been reset');
  }, []);

  return {
    messages,
    input,
    setInput,
    loading,
    error,
    sendMessage,
    clearMessages
  };
}
