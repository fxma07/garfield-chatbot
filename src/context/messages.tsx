import { ReactNode, createContext, useState } from "react";
import { Message } from "../lib/validators/message";
import { nanoid } from "nanoid";
import { Prompt } from "next/font/google";

export const MessagesContext = createContext<{
    messages: Message[]
    isMessageUpdating: boolean
    addMessages: (messages: Message) => void
    removeMessage: (id: string) => void
    updateMessage: (id: string, updateFn: (prevText: string) => string) => void
    setIsMessageUpdating: (isUpdating: boolean) => void 
    initialPrompt: string 
    addInitialPrompt: (prompt: string) => void
}>({
    messages: [],
    isMessageUpdating: false,
    addMessages: () => {},
    removeMessage: () => {},
    updateMessage: () => {},
    setIsMessageUpdating: () => {},
    initialPrompt: "", 
    addInitialPrompt: () =>{}
})



export function MessagesProvider({children}: {children: ReactNode}){

    const [isMessageUpdating, setIsMessageUpdating] = useState<boolean>(false)
    const [initialPrompt, setInitailPrompt] = useState<string>("");
    const [messages, setMessages] = useState<Message[]>([])

    const addMessages = (message: Message) => {
        setMessages((prev) => [...prev, message])
    }

    const removeMessage = (id: string) => {
        setMessages((prev) => prev.filter((message) => message.id !== id))
    }


    const addInitialPrompt = (prompt: string) =>{


      console.log(prompt)
      setInitailPrompt(prompt)
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
        initialPrompt,
        addInitialPrompt
   }}>
        {children}
    </MessagesContext.Provider>
}