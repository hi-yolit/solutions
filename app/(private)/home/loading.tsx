import { Loader2 } from 'lucide-react'
import React from 'react'

const Loading = () => {
    // Home page layout
  return (
    <div className='h-full w-full flex items-center justify-center'>
      <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
    </div>
  )
}

export default Loading
