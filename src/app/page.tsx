import ChatMessages from '@/components/ChatMessages'
import ChatInput from '../components/ChatInput'


export default function Home() {
  return (
   <main className='m-auto text-center flex justify-center items-center h-full'>
      <div className="p-3 w-full h-full flex flex-col">
        <ChatMessages className='py-5  flex-1' />
        <ChatInput />
      </div>
   </main>
  )
}

