"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <SignUp 
        routing="path" 
        path="/sign-up" 
        signInUrl="/sign-in" 
      />
    </main>
  );
}
