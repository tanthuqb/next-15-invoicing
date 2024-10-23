
"use client"
import createAction from "@/actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SubmitButton } from "@/components/ui/submitbutton"
import { Textarea } from "@/components/ui/textarea"
import { SyntheticEvent, useState, startTransition } from "react"


export default function Page() {
  const [state, setstate] = useState('ready')

  function handleSubmit(event: SyntheticEvent) {
    event.preventDefault();
    if (state === 'pending') return;
    const target = event.target as HTMLFormElement;
    startTransition(async () => {
      const formData = new FormData(target);
      await createAction(formData);
      setstate('pending')
    })
  }

  return <main className="flex flex-col justify-center max-w-5xl mx-auto my-12">
    <div className="flex justify-between">
      <h1 className="text-3xl font-bold">Create Invoice</h1>
    </div>
    <form action={createAction} onSubmit={handleSubmit} className="grid gap-4 max-w-sm">
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
    </form>
  </main>
}
