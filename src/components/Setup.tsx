
'use client';

import React,  { useState, useContext, ChangeEvent, useEffect, useRef }  from 'react'
import { MessagesContext } from "@/context/messages";
import { Message } from "../lib/validators/message";
import ChatMessages from '@/components/ChatMessages'
import ChatInput from '../components/ChatInput'
import mondaySdk from 'monday-sdk-js';

const monday = mondaySdk(); 

type Suggestion = string;

const suggestions: Suggestion[] = [
  'Client Onboarding',
  'Customer Success Performance Review',
  'Daily System Administrator',
  'Employee Development Plan',
  'Employee Onboarding',
  'Employee Off-boarding'
];



export const Setup = () => {

  const [text, setText] = useState('');
  const [inputValue, setInputValue] = useState<string>('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([]);
  const { addInitialPrompt} = useContext(MessagesContext);  
  const [process, setProcess] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);
  const [context, setContext] = useState<any>(null);



    // useEffect(()=>{




    //   monday.listen("context", (res: any) => {
    //       setContext(res.data);

    //       let process = localStorage.getItem("process"); 

    //       if(process){
    //         const { docId } = JSON.parse(process);
    //         if(docId == res.data.docId){
    //           setProcess(false);
    //         }
    //         else{
    //           setProcess(true);
    //         }
    //       }

    //   });
          
    // }, [])


  const submitInitial =  ()=>{

    localStorage.clear();

    let prompt = `Create a proposed outline for the project brief titled ${inputValue} and ${text}, always breaking down the outline into numbered sections. At the end of your response, ask, "Would you like to add or make any changes to this outline? and the start of your response mention 'here's a proposed outline for your project brief':"`
    addInitialPrompt(prompt);
    setProcess(false)
    localStorage.setItem("process", JSON.stringify({docId: context.docId, process: true}));
    
  }


  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);

    const filtered = suggestions.filter((suggestion) =>
      suggestion.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredSuggestions(filtered);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setInputValue(suggestion);
    setFilteredSuggestions([]);
  };


  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
  };


  const handleClickOutside = (event: MouseEvent) => {
    if (
      inputRef.current &&
      !inputRef.current.contains(event.target as Node) &&
      suggestionsRef.current &&
      !suggestionsRef.current.contains(event.target as Node)
    ) {
      setFilteredSuggestions([]);
    }
  };


  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      handleClickOutside(event);
    };

    document.addEventListener('mousedown', handleDocumentClick);

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, []);



  return (
    <>
      { process ? (


          <section className='text-start'> 
            <div className='mt-3'> 
              <p className='text-sm font-medium'>Document Name</p>
              <p className='text-slate-500 text-xs'>Specific document names work best.</p>



            <div className="relative mt-3">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="e.g, 'Employee Management'"
                className="w-full text-sm px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-indigo-500"
                ref={inputRef}
              />
              {filteredSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-md shadow-lg">
                  {filteredSuggestions.map((suggestion) => (
                    <li
                      key={suggestion}
                      className="px-4 text-sm py-2 cursor-pointer hover:bg-indigo-100"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            </div>
            <div className='mt-4'> 
              <p className='text-sm font-medium'>Additional Instruction</p>
              <p className='text-slate-500 text-xs'>This help fine tune your workflow</p>


              <textarea
                value={text}
                onChange={handleChange}
                placeholder="e.g, 'Give me a maximum of 15 steps, the last step needs to be approved by the HR Manager'" 
                rows={5}
                className="w-full text-sm mt-3 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-indigo-500"
              />

            </div>
            <div className='mt-3 flex'> 
              <button className="text-sm bg-blue-500 ms-auto hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-full" onClick={submitInitial}>
                Generate with AI
              </button>
            </div>
          </section>
        ):(

          <>
            <ChatMessages className='py-5  flex-1'  />
            <ChatInput />
          </>

        )}

    </>
  )
}

export default Setup;