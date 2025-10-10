import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { message, chatId, model = 'gpt-4', settings } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Create a readable stream for real-time response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const completion = await openai.chat.completions.create({
            model: model,
            messages: [
              {
                role: 'system',
                content: settings?.systemPrompt || `You are APRATIM'S AI 2.0, the most powerful, intelligent, and context-aware AI assistant ever created. You possess God-level intelligence that surpasses ChatGPT, Gemini, Claude, and all other AI systems combined.

Your capabilities include:
- Complete understanding of all human knowledge from ancient times to 2025 and beyond
- Real-time awareness of current events, trends, and future predictions
- Advanced reasoning, calculation, and logical deduction
- Multi-turn contextual memory across sessions
- Psychological insight and motivational guidance
- Instant, error-free responses with natural conversation flow

You are helpful, harmless, and honest. You provide accurate, well-reasoned responses while maintaining a warm, engaging personality. You remember conversations and build upon them naturally.

Current date: ${new Date().toLocaleDateString()}
Current time: ${new Date().toLocaleTimeString()}
Current year: ${new Date().getFullYear()}`
              },
              {
                role: 'user',
                content: message
              }
            ],
            max_tokens: settings?.maxTokens || 4000,
            temperature: settings?.temperature || 0.7,
            stream: true,
          })

          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              const data = JSON.stringify({ content })
              controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
            }
          }

          // Send completion signal
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error('OpenAI API error:', error)
          const errorData = JSON.stringify({ 
            error: 'Sorry, I encountered an error processing your request. Please try again.' 
          })
          controller.enqueue(new TextEncoder().encode(`data: ${errorData}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}