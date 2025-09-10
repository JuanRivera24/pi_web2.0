// RegisterForm.tsx
"use client";

import { SignUp } from "@clerk/nextjs";

export default function RegisterForm() {
  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 shadow-lg rounded-xl">
      <SignUp routing="hash" signInUrl="/sign-in" />
    </div>
  );
}
