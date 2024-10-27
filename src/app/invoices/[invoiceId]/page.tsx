import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import { Invoices } from "@/db/schema";
import { cn } from "@/lib/utils";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function InvoicePage({ params }: { params: { invoiceId: string } }) {
  const { userId } = await auth();
  if (!userId) return;
  const invoiceId = parseInt(params.invoiceId, 10);
  if (isNaN(invoiceId)) {
    throw new Error("invalid Invoice Id");
  }

  const [result] = await db.select()
    .from(Invoices)
    .where(
      and(
        eq(Invoices.id, invoiceId),
        eq(Invoices.userId, userId)
      ))
    .limit(1);
  if (!result) {
    notFound();
  }
  return (
    <main className="h-full w-full max-w-5xl max-auto my-12 mx-20">
      <div className="flex justify-between mb-8">
        <h1 className="flex items-center gap-4 text-3xl font-semibold">Invoices {invoiceId}
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
        </h1>
      </div>
      <p className="text-3xl mb-3">
        ${(result.value / 100).toFixed(2)}
      </p>
      <p className="text-lg mb-8">
        {result.description}
      </p>
      <h2 className="font-bold text-lg mb-4">
        Billing Details
      </h2>
      <ul className="grid gap-2">
        <li className="flex gap-4">
          <strong className="block w-28 flex-shrink-0 font-medium text-sm">InvoiceID</strong>
          <span>{result.id}</span>
        </li>
        <li className="flex gap-4">
          <strong className="block w-28 flex-shrink-0 font-medium text-sm">Date</strong>
          <span>{new Date(result.createTs).toLocaleString()}</span>
        </li>
        <li className="flex gap-4">
          <strong className="block w-28 flex-shrink-0 font-medium text-sm">InvoiceID</strong>
          <span>{result.id}</span>
        </li>
        <li className="flex gap-4">
          <strong className="block w-28 flex-shrink-0 font-medium text-sm">InvoiceID</strong>
          <span>{result.id}</span>
        </li>
      </ul>
    </main>
  )
}
