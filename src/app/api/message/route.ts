import { MessageArraySchema } from "@/lib/validators/message"
import { ChatGPTMessage, OpenAIStream, OpenAIStreamPayload } from "@/lib/openai-stream"

export async function POST(req: Request){
    const { messages } = await req.json()

    const parsedMessages = MessageArraySchema.parse(messages)

    const outboundMessages: ChatGPTMessage[] = parsedMessages.map((message) => ({
        role: message.isUserMessage ? 'user' : 'system',
        content: message.text,
    }))



    const payload: OpenAIStreamPayload= {
        model: 'gpt-4',
        messages: outboundMessages,
        temperature: 0.4,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 750,
        stream: true,
        n: 1,
    }

    // outboundMessages.unshift({
    //     role: 'system',
    //     content: 'You are a chatbot please converse naturally like a person. Help me write a detailed project brief. Ask me one question at a time. Be mindful of the context of the conversation and where the conversation is at the moment.',
    //   })

    const stream = await OpenAIStream(payload)
    return new Response(stream)

}