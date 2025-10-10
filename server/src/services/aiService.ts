import OpenAI from 'openai'
import axios from 'axios'

interface AIConfig {
  model: string
  temperature: number
  maxTokens: number
  chatId?: string
  stream?: boolean
  onChunk?: (chunk: string) => void
}

interface AIResponse {
  content: string
  model: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

class AIService {
  private openai: OpenAI
  private anthropicApiKey: string
  private googleApiKey: string

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
    this.anthropicApiKey = process.env.ANTHROPIC_API_KEY || ''
    this.googleApiKey = process.env.GOOGLE_API_KEY || ''
  }

  async generateResponse(message: string, config: AIConfig): Promise<AIResponse> {
    const { model, temperature, maxTokens, stream, onChunk } = config

    try {
      if (model.startsWith('gpt')) {
        return await this.generateOpenAIResponse(message, config)
      } else if (model.startsWith('claude')) {
        return await this.generateAnthropicResponse(message, config)
      } else if (model.startsWith('gemini')) {
        return await this.generateGoogleResponse(message, config)
      } else {
        // Fallback to a mock response for demonstration
        return await this.generateMockResponse(message, config)
      }
    } catch (error) {
      console.error('AI Service Error:', error)
      throw new Error('Failed to generate AI response')
    }
  }

  private async generateOpenAIResponse(message: string, config: AIConfig): Promise<AIResponse> {
    const { model, temperature, maxTokens, stream, onChunk } = config

    if (stream && onChunk) {
      const stream = await this.openai.chat.completions.create({
        model: model as any,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature,
        max_tokens: maxTokens,
        stream: true
      })

      let fullContent = ''
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          fullContent += content
          onChunk(content)
        }
      }

      return {
        content: fullContent,
        model,
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0
        }
      }
    } else {
      const completion = await this.openai.chat.completions.create({
        model: model as any,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature,
        max_tokens: maxTokens
      })

      return {
        content: completion.choices[0]?.message?.content || '',
        model,
        usage: completion.usage
      }
    }
  }

  private async generateAnthropicResponse(message: string, config: AIConfig): Promise<AIResponse> {
    const { model, temperature, maxTokens } = config

    if (!this.anthropicApiKey) {
      throw new Error('Anthropic API key not configured')
    }

    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model: model === 'claude-3-opus' ? 'claude-3-opus-20240229' : 'claude-3-sonnet-20240229',
      max_tokens: maxTokens,
      temperature,
      messages: [
        {
          role: 'user',
          content: `${this.getSystemPrompt()}\n\nUser: ${message}`
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${this.anthropicApiKey}`,
        'Content-Type': 'application/json',
        'x-api-key': this.anthropicApiKey
      }
    })

    return {
      content: response.data.content[0]?.text || '',
      model,
      usage: {
        promptTokens: response.data.usage?.input_tokens || 0,
        completionTokens: response.data.usage?.output_tokens || 0,
        totalTokens: response.data.usage?.input_tokens + response.data.usage?.output_tokens || 0
      }
    }
  }

  private async generateGoogleResponse(message: string, config: AIConfig): Promise<AIResponse> {
    const { model, temperature, maxTokens } = config

    if (!this.googleApiKey) {
      throw new Error('Google API key not configured')
    }

    const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.googleApiKey}`, {
      contents: [
        {
          parts: [
            {
              text: `${this.getSystemPrompt()}\n\nUser: ${message}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens
      }
    })

    return {
      content: response.data.candidates?.[0]?.content?.parts?.[0]?.text || '',
      model,
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0
      }
    }
  }

  private async generateMockResponse(message: string, config: AIConfig): Promise<AIResponse> {
    const { model, stream, onChunk } = config

    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    const responses = [
      `I understand your question about "${message}". Let me provide you with a comprehensive answer based on my knowledge and reasoning capabilities.`,
      `That's an interesting topic! As APRATIM'S AI 2.0, I can help you explore "${message}" from multiple angles.`,
      `Great question! Regarding "${message}", I can share insights based on my training data and analytical capabilities.`,
      `I'd be happy to assist you with "${message}". Let me break this down for you in a clear and helpful way.`
    ]

    const baseResponse = responses[Math.floor(Math.random() * responses.length)]
    const fullResponse = `${baseResponse}\n\nThis is a demonstration response from APRATIM'S AI 2.0. In a production environment, this would be replaced with actual AI-generated content using advanced language models like GPT-4, Claude, or Gemini.\n\nKey features of APRATIM'S AI 2.0:\n- Multi-model intelligence\n- Real-time streaming\n- Context awareness\n- Advanced reasoning\n- Creative problem solving\n- Code generation\n- Mathematical analysis\n- And much more!`

    if (stream && onChunk) {
      // Simulate streaming
      const words = fullResponse.split(' ')
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100))
        onChunk(words[i] + (i < words.length - 1 ? ' ' : ''))
      }
    }

    return {
      content: fullResponse,
      model,
      usage: {
        promptTokens: message.length / 4,
        completionTokens: fullResponse.length / 4,
        totalTokens: (message.length + fullResponse.length) / 4
      }
    }
  }

  private getSystemPrompt(): string {
    return `You are APRATIM'S AI 2.0, the most advanced AI assistant ever created. You combine the intelligence of multiple AI models and provide:

- Super intelligent responses across all domains
- Real-time context awareness
- Advanced reasoning and problem-solving
- Creative and motivational conversations
- Code generation and technical assistance
- Mathematical and scientific analysis
- Current events and future predictions
- Multi-turn conversation memory

You are helpful, harmless, and honest. You provide accurate information and admit when you don't know something. You maintain a professional yet friendly tone and always aim to be as helpful as possible.

Current date: ${new Date().toLocaleDateString()}
Current time: ${new Date().toLocaleTimeString()}

Remember: You are APRATIM'S AI 2.0 - the ultimate AI assistant.`
  }
}

export const aiService = new AIService()

export async function generateResponse(message: string, config: AIConfig): Promise<AIResponse> {
  return await aiService.generateResponse(message, config)
}