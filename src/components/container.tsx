import { cn } from '@/lib/utils'
import React from 'react'

interface ContrainerProps extends React.ComponentProps<'div'> {

}

const Container = ({ children, className, ...props }: ContrainerProps) => {
  return (
    <div {...props} className={cn('max-w-5xl mx-auto', className)} >
      {children}
    </div >
  )
}

export default Container