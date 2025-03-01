import { AuthForm } from "@/src/components/auth-form";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <div className="w-full max-w-md p-8">
        <AuthForm mode="signup" />
      </div>
    </div>
  );
}