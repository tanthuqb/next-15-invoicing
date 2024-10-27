import React from 'react'
import {
  SignedOut,
  SignInButton,
  SignedIn,
  UserButton
} from '@clerk/nextjs'
import Container from '@/components/container';
import Link from 'next/link';
const Header = () => {
  return (

    <header className='mt-8 mb-12'>
      <Container>
        <div className='flex justify-between gap-4 items-center'>
          <Link href={'/dashboard'}>
            <p className='font-bold'>
              Invoicipedia
            </p>
          </Link>
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </Container>
    </header>

  )
}

export default Header