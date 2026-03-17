import { db } from "@/db";
import { Products } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import Container from "@/components/container";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/ui/submitbutton";
import { PlusCircle, ShoppingCart } from "lucide-react";
import { createProductAction } from "@/app/actions/product.action";
import { buyProductAction } from "@/app/actions/buy.action";
import { CreateProductForm } from "@/components/create-product-form";

export default async function ProductsPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const products = await db
    .select()
    .from(Products)
    .where(eq(Products.userId, userId));

  return (
    <main className="h-full py-12">
      <Container>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-gray-500">Manage and sell your products via Stripe.</p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Create Product
              </Button>
            </DialogTrigger>
            <CreateProductForm />
          </Dialog>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-gray-500">
                    No products found. Create your first product to get started.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="max-w-xs truncate text-gray-500">
                      {product.description || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      ${(product.price / 100).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <a href={`https://dashboard.stripe.com/products/${product.stripeProductId}`} target="_blank" rel="noopener noreferrer">
                            View on Stripe
                          </a>
                        </Button>
                        <form action={buyProductAction}>
                          <input type="hidden" name="priceId" value={product.stripePriceId} />
                          <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                            <ShoppingCart className="h-4 w-4" />
                            Buy
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Container>
    </main>
  );
}
