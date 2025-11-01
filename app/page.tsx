import Image from 'next/image'
import React from 'react'

export default function Home() {
  return (
    <main className='w-full min-h-dvh bg-lime-50'>
      <nav className='fixed top-0 left-0 h-15 w-full shadow-sm flex items-center px-4 md:px-8 lg:px-10'>
        <Image className='h-10 w-fit' src="/title.png" alt="HSL Title" width={100} height={100} />
      </nav>

    </main>
  )
}
