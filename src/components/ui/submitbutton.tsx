"use client"

import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";

export const SubmitButton = ({ state }) => {
  const { pending } = useFormStatus()
  console.log("pending", pending)
  return (
    <Button className="w-full font-semibold">Submit</Button>
  )
}