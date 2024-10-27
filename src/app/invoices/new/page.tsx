
"use client"
import createAction from "@/actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SubmitButton } from "@/components/ui/submitbutton"
import { Textarea } from "@/components/ui/textarea"
import { SyntheticEvent, useState } from "react"

import Form from "next/form";
import Container from "@/components/container"


export default function Page() {
  const [state, setstate] = useState('ready')

  function handleSubmit(event: SyntheticEvent) {
    if (state === 'pending') {
      event.preventDefault();
      return;
    }
    setstate("pending")
  }

  return <main className="h-full ">
    <Container>
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Create Invoice</h1>
      </div>
      <Form action={createAction} onSubmit={handleSubmit} className="grid gap-4 max-w-sm">
        <div>
          <Label htmlFor="name" className="block font-semibold mb-2 text-sm">Billing Name</Label>
          <Input id="name" name="name" type="text"></Input>
        </div>
        <div>
          <Label htmlFor="email" className="block font-semibold mb-2 text-sm">Billing Email</Label>
          <Input id="email" name="email" type="email"></Input>
        </div>
        <div>
          <Label htmlFor="value" className="block font-semibold mb-2 text-sm">Value</Label>
          <Input id="value" name="value" type="text"></Input>
        </div>
        <div>
          <Label htmlFor="description" className="block font-semibold mb-2 text-sm">Description</Label>
          <Textarea id="description" name="description"></Textarea>
        </div>
        <div>
          <SubmitButton />
        </div>
      </Form>
    </Container>
  </main>
}
