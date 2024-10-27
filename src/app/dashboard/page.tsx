import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CirclePlus } from 'lucide-react';
import Link from "next/link";
import { db } from "@/db";
import { Invoices } from "@/db/schema";
import { cn } from "@/lib/utils";
import Container from '@/components/container';
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
export default async function DashBoard() {
  const { userId } = await auth();
  if (!userId) return;
  const results = await db.select().from(Invoices).where(eq(Invoices.userId, userId));


  return (
    <main className="h-full">
      <Container>
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl  p-4 font-bold">Invoices</h1>
          <p>
            <Button className="inline-flex gap-2" variant={"ghost"} asChild>
              <Link href="/invoices/new">
                <CirclePlus className="h-4 w-4" />
                Create Invoice
              </Link>
            </Button>
          </p>
        </div>

        <Table>
          <TableCaption>A list of your recent invoices.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] ">Date</TableHead>
              <TableHead className="text-left ">Customer</TableHead>
              <TableHead className="text-left ">Email</TableHead>
              <TableHead className="text-center ">Status</TableHead>
              <TableHead className="text-right ">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {
              results.map(result => {
                return (
                  <TableRow key={result.id}>
                    <TableCell className="font-medium text-left">
                      <Link href={`/invoices/${result.id}`} className="p-4 font-semibold">
                        {new Date(result.createTs).toLocaleDateString()}
                      </Link>
                    </TableCell>
                    <TableCell className="text-lef p-0">
                      <Link href={`/invoices/${result.id}`} className="p-4 font-semibold">
                        Philip. Dr
                      </Link>
                    </TableCell>
                    <TableCell className="text-left p-0">
                      <Link href={`/invoices/${result.id}`} className="p-4 font-semibold">
                        philip@gmail.com
                      </Link>
                    </TableCell>
                    <TableCell className="text-center p-0">
                      <Link href={`/invoices/${result.id}`} className="p-4 font-semibold">
                        <Badge className={
                          cn("rounded-full capitalize",
                            result.status === 'open' && 'bg-blue-500',
                            result.status === 'paid' && 'bg-green-600',
                            result.status === 'void' && 'bg-zinc-700',
                            result.status === 'uncollectinle' && 'bg-red-600',
                          )
                        }>
                          {result.status}
                        </Badge>
                      </Link>
                    </TableCell>
                    <TableCell className="text-right p-0">
                      <Link href={`/invoices/${result.id}`} className="p-4 font-semibold">
                        ${(result.value / 100).toFixed(2)}
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })
            }
          </TableBody>
        </Table>
      </Container>
    </main>
  )
}
