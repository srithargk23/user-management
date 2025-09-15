"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "../../lib/api";
import { redirectIfAuth, setToken } from "../../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");


 useEffect(() => {
    redirectIfAuth();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    
    
   
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  
  if (!trimmedEmail && !trimmedPassword) {
    setError("Please enter both email and password");
    return;
  }

  if (!trimmedEmail) {
    setError("Email is required");
    return;
  }

  if (!trimmedPassword) {
    setError("Password is required");
    return;
  }

  
  if (!trimmedEmail.includes("@")) {
    setError("Email must include '@'");
    return;
  }

  if (!trimmedEmail.endsWith(".com")) {
    setError("Email must end with '.com'");
    return;
  }

  if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
    setError("Invalid email format");
    return;
  }

  
  if (trimmedPassword.length <= 5) {
    setError("Password must be longer than 5 characters");
    return;
  }

  
  try {
    const res: any = await apiRequest("post", "/api/auth/login", {
      data: { email: trimmedEmail, password: trimmedPassword },
    });
    console.log(res.user.name)
    setToken(res.token,res.user.name);

    router.push("/dashboard/users");
  } catch (err: any) {
    setError(err?.message || "Login Failed");
  }
}


  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-white p-8 rounded-2xl shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-4 border rounded-md"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-4 border rounded-md"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
}