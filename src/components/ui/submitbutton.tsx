"use client"

import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export const SubmitButton = ({ children = "Submit", className, ...props }: SubmitButtonProps) => {
  const { pending } = useFormStatus()
  return (
    <Button className={`relative w-full font-semibold ${className || ''}`} disabled={pending} {...props}>
      <span className={pending ? 'text-transparent' : ''}>{children}</span>
      {
        pending && (
          <span className="absolute flex items-start justify-center w-full h-full text-gray-400">
            <LoaderCircle className="animate-spin" />
          </span>
        )
      }
    </Button>
  )
}