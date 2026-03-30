"use client";

import { signIn } from "next-auth/react";
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
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Use Google OAuth (configure <code className="text-xs">GOOGLE_CLIENT_ID</code> and secret in{" "}
            <code className="text-xs">.env.local</code>).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            type="button"
            className="w-full"
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            Continue with Google
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          <Link href="/register" className={cn(buttonVariants({ variant: "link", size: "sm" }))}>
            No account flow yet — register placeholder
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
