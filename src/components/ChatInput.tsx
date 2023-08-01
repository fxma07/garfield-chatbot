"use client"

import { FC, HTMLAttributes, useContext, useRef, useState, useEffect } from "react";
import { cn } from "../lib/utils";
import TextareaAutosize from "react-textarea-autosize";
import {useMutation} from '@tanstack/react-query';
import { nanoid } from "nanoid";
import { Message } from "../lib/validators/message";
import { MessagesContext } from "@/context/messages";
import {BiLoaderCircle} from 'react-icons/bi';
import {BsFillSendFill} from 'react-icons/bs';
import toast from "react-hot-toast";
import mondaySdk from 'monday-sdk-js';


const monday = mondaySdk();

interface ChatInputProps extends HTMLAttributes<HTMLDivElement>{}


const ChatInput: FC<ChatInputProps> = ({className, ...props}) => {
    const [input, setInput] = useState<string>('')
    const {messages, initialPrompt,  addMessages, removeMessage, updateMessage, setIsMessageUpdating} = useContext(MessagesContext) 
    const textareaRef = useRef<null| HTMLTextAreaElement>(null)
    const [context, setContext] = useState<any>(null); 


    const {mutate: sendMessage, isLoading} = useMutation({
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
          setInput('')
          setTimeout(() =>{
            textareaRef.current?.focus()
          }, 10)
        },
        onError(_, message){

            console.log("error: ",  message);
            toast.error('Something went wrong. Please try again.')
            removeMessage(message.id)
            textareaRef.current?.focus()
        }
    })

    useEffect(()=>{
        
        interface ProcessItem {
            docId: string;
            process: boolean;
          }

        // monday.get("context", (res: any) => {

            monday.get("context").then(res => {
              setContext(res.data);
            

            console.log(res.data);

            let processSession = localStorage.getItem("process"); 
            if(processSession){
                const processParse: ProcessItem[] =JSON.parse(processSession);
                const foundItem: ProcessItem | undefined = processParse.find(item => item.docId ===res.data.docId);
                if (foundItem) {
                    let promptId = nanoid();
                    sendMessage({
                        id: promptId,
                        isUserMessage: true,
                        text: "Ask me a question on how you can help me on my project brief"
                    });
                    
                } else {
                    let promptId = nanoid();
                    sendMessage({
                        id: promptId,
                        isUserMessage: true,
                        text: initialPrompt
                    });
                }
            }
            else{
                let promptId = nanoid();
                sendMessage({
                    id: promptId,
                    isUserMessage: true,
                    text: initialPrompt
                });
            }

        })
    }, [sendMessage, initialPrompt])

    return <div {...props} className={cn('border border-zinc-300 rounded overflow-hidden w-full self-end')}>
        <div className="relative">
            <TextareaAutosize 
            disabled={isLoading}
            ref={textareaRef}
            rows={1}
            maxRows={4}
            onKeyDown={(e) => {
                if(e.key === 'Enter' && !e.shiftKey){
                    e.preventDefault()
                    const message: Message = {
                        id: nanoid(),
                        isUserMessage: true,
                        text: input
                    }
                    sendMessage(message);
                    setInput('')
                }
            }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
            placeholder="What do you want to know?"
            className="peer pl-1.5 disabled:opacity-50 pr-14 resize-none block w-full border-0 bg-zinc-100 py-1.5 text-gray-900 focus:ring-0 text-sm sm-leading-6"
            />
             <div className='absolute inset-y-0 flex py-1.5 pr-1.5 right-0'>
                <kbd className="inline-flex items-center rounded border bg-white border-gray-200 px-1 font-sans text-xs text-gray-400">
                    {isLoading ? <BiLoaderCircle className="w-3 h-3 animate-spin" /> : <BsFillSendFill style={{color:"#0073ea" }}className="w-3 h-3" />}
                </kbd>
             </div>
        </div>
    </div>
}

export default ChatInput;