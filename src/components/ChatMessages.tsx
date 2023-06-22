"use client"

import { MessagesContext } from '@/context/messages';
import { cn } from '@/lib/utils';
import { FC, HTMLAttributes, useContext, useEffect, useState } from 'react';
import {AiOutlinePlus} from 'react-icons/ai';
import MarkdownLite from './MarkdownLite';
import mondaySdk from 'monday-sdk-js';
import Image from 'next/image';
import {useMutation} from '@tanstack/react-query';
import { nanoid } from "nanoid";
import { Message } from "../lib/validators/message";
import toast from 'react-hot-toast';

const monday = mondaySdk();


interface ChatMessagesProps extends HTMLAttributes<HTMLDivElement>{

}

const ChatMessages: FC<ChatMessagesProps> = ({className, ...props}) => {
    const {messages, addMessages, removeMessage, updateMessage, setIsMessageUpdating} = useContext(MessagesContext)
    const inverseMessages = [...messages].reverse()
    const [profilePhotoUrl, setProfilePhotoUrl] =  useState<string | null>(null);
    const [context, setContext] = useState<any>(null);

    useEffect(() => {
        monday.listen("context", (res: any) => {
            setContext(res.data);
        });

        monday.api('query { me { photo_original } }').then((res: any) => {
            const url = res.data.me.photo_original
            setProfilePhotoUrl(url);
          });
    }, [profilePhotoUrl]);
      

    const docId = context?.docId;
    const textBlockObject = (text: string) => ({
    type: "normal text",
    content: {
        deltaFormat: [
            {
                insert: text,
            },
        ],
    },
});


const handleAddToDoc = (addMessage: string) => {    
    monday
    .execute("addMultiBlocks", {
        blocks: [
            textBlockObject(addMessage),
        ],
    })
    .then((res) => {})
}


const {mutate: nextQuestion} = useMutation({
    mutationFn: async (message: Message) => {
        const response = await fetch('/api/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({messages: [message, ...messages]})
        })
        if(!response.ok){
            throw new Error()
        }
        return response.body
    },
    onMutate(message){
      addMessages(message)
    },
    onSuccess: async (stream) => {
      if(!stream) throw new Error('No stream found')
      
      const id = nanoid()
      const responseMessage: Message = {
        id,
        isUserMessage: false,
        text: '',
      }

      addMessages(responseMessage)

      setIsMessageUpdating(true)


      const reader = stream.getReader()
      const decoder  = new TextDecoder()
      let done = false

      while(!done){
        const {value, done: doneReading} = await reader.read()
        done = doneReading
        const chunkValue = decoder.decode(value)
        updateMessage(id, (prev) => prev + chunkValue)
      }

      //cleanup
      setIsMessageUpdating(false)
    },
    onError(_, message){
        toast.error('Something went wrong. Please try again.')
        removeMessage(message.id)
      
    }
})

const {mutate: suggestion} = useMutation({
    mutationFn: async (message: Message) => {
        const response = await fetch('/api/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({messages: [message, ...messages]})
        })
        if(!response.ok){
            throw new Error()
        }
        return response.body
    },
    onMutate(message){
      addMessages(message)
    },
    onSuccess: async (stream) => {
      if(!stream) throw new Error('No stream found')
      
      const id = nanoid()
      const responseMessage: Message = {
        id,
        isUserMessage: false,
        text: '',
      }

      addMessages(responseMessage)

      setIsMessageUpdating(true)


      const reader = stream.getReader()
      const decoder  = new TextDecoder()
      let done = false

      while(!done){
        const {value, done: doneReading} = await reader.read()
        done = doneReading
        const chunkValue = decoder.decode(value)
        updateMessage(id, (prev) => prev + chunkValue)
      }

      //cleanup
      setIsMessageUpdating(false)
    },
    onError(_, message){
        toast.error('Something went wrong. Please try again.')
        removeMessage(message.id)
      
    }
})



    return <div {...props} className={cn(
        'flex flex-col-reverse gap-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch', 
        className
        )}>
            <div className="flex-1 flex-grow"></div>
            {inverseMessages.map((message) => (
            <div key={message.id} className="chat-message">
                    <div className={cn('flex items-center', {'justify-end': message.isUserMessage})}>
                        <div className={cn('px-2 py-1 rounded flex flex-col space-y-2 text-sm max-w-xs overflow-x-hidden text-left', {
                            'bg-blue-600 text-white': message.isUserMessage,
                            'bg-gray-200 text-gray-900': !message.isUserMessage
                        })}>
                            <MarkdownLite text={message.text} />
                        </div>
                    {message.isUserMessage && profilePhotoUrl && (<Image src={profilePhotoUrl} alt="avatar" className="ml-2 rounded-full" width={42} height={42}/>)}
                    </div>
                    {!message.isUserMessage && message.text !== "Let's start making a project brief. Tell me about your project." && (
                    <div className="flex mt-2 justify-start">
                        <div onClick={() => handleAddToDoc(message.text)} className='flex items-center justify-center text-xs bg-slate-400 cursor-pointer p-1.5 rounded transition duration-200 hover:bg-blue-600 hover:drop-shadow-md
text-white mr-1 '>Add to Doc<AiOutlinePlus className='ml-1' /></div>
                     <div onClick={() => {
                         const currentResponse: Message = {
                            id: nanoid(),
                            isUserMessage: true,
                            text: `Ask me another question.`
                        }
                        nextQuestion(currentResponse);
                     }} className='flex items-center justify-center text-xs bg-slate-400 cursor-pointer p-1.5 rounded transition duration-200 hover:bg-blue-600 hover:drop-shadow-md
text-white mr-1'>Next Question</div>
                    <div onClick={() => {
                         const currentResponse: Message = {
                            id: nanoid(),
                            isUserMessage: true,
                            text: `Make a suggestion.`
                        }
                        suggestion(currentResponse);
                    }} className='flex items-center justify-center text-xs bg-slate-400 cursor-pointer p-1.5 rounded transition duration-200 hover:bg-blue-600 hover:drop-shadow-md
                    text-white'>Suggest</div>
                    </div>
)}
                </div>
            ))}
        </div>
}

export default ChatMessages;