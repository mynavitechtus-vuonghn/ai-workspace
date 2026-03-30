import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-0px)] items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>
            Placeholder form. Wire this to OAuth or email signup with NextAuth.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reg-email">Email</Label>
            <Input id="reg-email" type="email" placeholder="you@example.com" autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-password">Password</Label>
            <Input id="reg-password" type="password" autoComplete="new-password" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button type="button" className="w-full sm:w-auto">
            Sign up
          </Button>
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "outline", size: "default" }), "w-full sm:w-auto")}
          >
            Already have an account
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
