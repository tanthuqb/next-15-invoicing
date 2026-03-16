import Container from '@/components/container'
import { SignIn } from '@clerk/nextjs'

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Container className='flex justify-center'>
      <SignIn />
    </Container>
  )
}
