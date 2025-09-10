"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, AlertCircle, User } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/account/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      console.log("data : ", data);

      if (data.success && data.token) {
        localStorage.setItem("authToken", data.token);

        router.push("/");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600 text-lg">Sign in to your NEXA account</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white text-center">
            <div className="inline-flex p-3 rounded-full bg-white/20 mb-4">
              <User size={24} />
            </div>
            <h2 className="text-2xl font-bold">Sign In</h2>
            <p className="text-blue-100 mt-2">Access your account</p>
          </div>

          <div className="p-8">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-lg"
                    placeholder="Enter your email"
                    suppressHydrationWarning
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-lg"
                    placeholder="Enter your password"
                    suppressHydrationWarning
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                suppressHydrationWarning
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
                <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            )}

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <a href="/signup" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors duration-300">
                  Sign up here
                </a>
              </p>
            </div>

            <div className="mt-6 text-center">
              <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors duration-300">
                Forgot your password?
              </a>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            By signing in, you agree to our{" "}
            <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
            {" "}and{" "}
            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}