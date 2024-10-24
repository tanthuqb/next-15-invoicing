"use client"

import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";

export const SubmitButton = ({ }) => {
  const { pending } = useFormStatus()
  return (
    <Button className=" relative w-full font-semibold">
      <span className={pending ? 'text-transparent' : ''}>Submit</span>
      {
        pending && (
          <span className=" absolute flex items-start justify-center w-full h-full text-gray-400 ">
            <LoaderCircle className="animate-spin" />
          </span>
        )
      }
    </Button>
  )
}