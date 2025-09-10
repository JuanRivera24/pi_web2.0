// LoginForm.tsx
"use client";

import { SignIn } from "@clerk/nextjs";

export default function LoginForm() {
  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 shadow-lg rounded-xl">
      <SignIn routing="hash" signUpUrl="/sign-up" />
    </div>
  );
}
