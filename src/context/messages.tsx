import { ReactNode, createContext, useState } from "react";
import { Message } from "../lib/validators/message";
import { nanoid } from "nanoid";

export const MessagesContext = createContext<{
    messages: Message[]
    isMessageUpdating: boolean
    addMessages: (messages: Message) => void
    removeMessage: (id: string) => void
    updateMessage: (id: string, updateFn: (prevText: string) => string) => void
    setIsMessageUpdating: (isUpdating: boolean) => void 
}>({
    messages: [],
    isMessageUpdating: false,
    addMessages: () => {},
    removeMessage: () => {},
    updateMessage: () => {},
    setIsMessageUpdating: () => {},
})

export function MessagesProvider({children}: {children: ReactNode}){
    const [isMessageUpdating, setIsMessageUpdating] = useState<boolean>(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: nanoid(),
            text: `Let's start making a project brief. Tell me about your project.`,
            isUserMessage: false,
        }
    ])

    const addMessages = (message: Message) => {
        setMessages((prev) => [...prev, message])
    }

    const removeMessage = (id: string) => {
        setMessages((prev) => prev.filter((message) => message.id !== id))
    }

    const updateMessage = (
        id: string,
        updateFn: (prevText: string) => string
      ) => {
        setMessages((prev) =>
          prev.map((message) => {
            if (message.id === id) {
              return { ...message, text: updateFn(message.text) }
            }
            return message
          })
        )
      }

   return <MessagesContext.Provider value={{
        messages,
        addMessages,
        removeMessage,
        updateMessage,
        isMessageUpdating,
        setIsMessageUpdating,
   }}>
        {children}
    </MessagesContext.Provider>
}