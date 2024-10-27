// 'use client'

// import * as Clerk from '@clerk/elements/common'
// import * as SignIn from '@clerk/elements/sign-in'

// export default function SignInPage() {
//   return (
//     <div className="grid w-full flex-grow items-center bg-black px-4 sm:justify-center">
//       <SignIn.Root>
//         <SignIn.Step
//           name="start"
//           className="w-full flex-grow space-y-6 rounded-2xl bg-neutral-900 bg-[radial-gradient(circle_at_50%_0%,theme(colors.white/10%),transparent)] px-4 py-10 ring-1 ring-inset ring-white/5 sm:w-96 sm:px-8"
//         >
//           <header className="text-center">
//             <svg className="mx-auto size-10"
//               xmlns="http://www.w3.org/2000/svg"
//               width="24"
//               height="24"
//               fill="none"
//               stroke="currentColor"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth="2"
//               viewBox="0 0 24 24"
//             >
//               <path d="M16 20V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"></path>
//               <rect width="20" height="14" x="2" y="6" rx="2"></rect>
//             </svg>
//             );
//             <h1 className="mt-4 text-xl font-medium tracking-tight text-white">
//               Sign in to Invoicipdeia
//             </h1>
//           </header>
//           <Clerk.GlobalError className="block text-sm text-red-400" />
//           <div className="space-y-2">
//             <Clerk.Connection
//               name="google"
//               className="flex w-full items-center justify-center gap-x-3 rounded-md bg-neutral-700 px-3.5 py-1.5 text-sm font-medium text-white shadow-[0_1px_0_0_theme(colors.white/5%)_inset,0_0_0_1px_theme(colors.white/2%)_inset] outline-none hover:bg-gradient-to-b hover:from-white/5 hover:to-white/5 focus-visible:outline-[1.5px] focus-visible:outline-offset-2 focus-visible:outline-white active:bg-gradient-to-b active:from-black/20 active:to-black/20 active:text-white/70"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 17 16"
//                 className="w-4"
//                 aria-hidden
//               >
//                 <path
//                   fill="currentColor"
//                   d="M8.82 7.28v2.187h5.227c-.16 1.226-.57 2.124-1.192 2.755-.764.765-1.955 1.6-4.035 1.6-3.218 0-5.733-2.595-5.733-5.813 0-3.218 2.515-5.814 5.733-5.814 1.733 0 3.005.685 3.938 1.565l1.538-1.538C12.998.96 11.256 0 8.82 0 4.41 0 .705 3.591.705 8s3.706 8 8.115 8c2.382 0 4.178-.782 5.582-2.24 1.44-1.44 1.893-3.475 1.893-5.111 0-.507-.035-.978-.115-1.369H8.82Z"
//                 />
//               </svg>
//               Login with Google
//             </Clerk.Connection>
//           </div>
//           <p className="text-center text-sm text-neutral-400">
//             No account?{' '}
//             <a
//               href="#"
//               className="font-medium text-white decoration-white/20 underline-offset-4 outline-none hover:underline focus-visible:underline"
//             >
//               Create an account
//             </a>
//           </p>
//         </SignIn.Step>
//       </SignIn.Root>
//     </div>
//   )
// }

import Container from '@/components/container'
import { SignIn } from '@clerk/nextjs'


export default function Page() {
  return (
    <Container className='flex justify-center'>
      <SignIn />
    </Container>
  )
}