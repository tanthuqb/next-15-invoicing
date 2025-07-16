import Container from '@/components/container'
import { SignUp } from '@clerk/nextjs'


export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Container className='flex justify-center'>
      <SignUp />
    </Container>
  )
}