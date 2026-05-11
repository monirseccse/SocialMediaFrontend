"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { AxiosError } from "axios";

export default function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setError("");
    setLoading(true);
    try {
      await login({ email, password });
    } catch (err) {
      setError(
        err instanceof AxiosError
          ? err.response?.data?.message ?? "Invalid email or password."
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      className="min-h-screen relative overflow-hidden flex items-center"
      style={{ background: "var(--bg1)", padding: "100px 0" }}
    >
      {/* Decorative shapes */}
      <div className="absolute top-0 left-0 -z-10 pointer-events-none">
        <Image src="/shape1.svg" alt="" width={320} height={320} />
      </div>
      <div className="absolute top-0 right-5 -z-10 pointer-events-none">
        <Image src="/shape2.svg" alt="" width={280} height={280} />
      </div>
      <div className="absolute bottom-0 right-[327px] -z-10 pointer-events-none">
        <Image src="/shape3.svg" alt="" width={200} height={200} />
      </div>

      <div className="w-full max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-8 flex-wrap">
          {/* Left – illustration */}
          <div className="flex-1 hidden lg:flex justify-center">
            <Image
              src="/login.png"
              alt="Login illustration"
              width={633}
              height={500}
              className="max-w-full"
              priority
            />
          </div>

          {/* Right – form card */}
          <div className="w-full lg:w-[380px]">
            <div className="bg-white rounded-[6px] p-12">
              {/* Logo */}
              <div className="flex justify-center mb-7">
                <Image src="/logo.svg" alt="BuddyScript" width={161} height={40} />
              </div>

              <p className="text-center text-sm mb-2" style={{ color: "var(--color)" }}>
                Welcome back
              </p>
              <h4 className="text-center font-medium text-[28px] mb-12" style={{ color: "var(--color1)" }}>
                Login to your account
              </h4>

              <div className="mb-10">
                <hr
                  className="relative text-center"
                  style={{ borderColor: "var(--bg4)", marginBottom: 0 }}
                />
                <div
                  className="relative -top-3 bg-white w-8 mx-auto text-center text-sm"
                  style={{ color: "var(--color7)" }}
                >
                  Or
                </div>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-[14px]">
                <div>
                  <label
                    className="block font-medium text-[16px] mb-2"
                    style={{ color: "var(--color4)", lineHeight: "1.4" }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 px-3 border rounded-[6px] text-sm transition-colors focus:border-[#1890FF] focus:ring-1 focus:ring-[#1890FF]"
                    style={{
                      background: "var(--bg2)",
                      borderColor: "var(--bcolor2)",
                      color: "var(--color)",
                    }}
                    placeholder="Enter your email"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label
                    className="block font-medium text-[16px] mb-2"
                    style={{ color: "var(--color4)", lineHeight: "1.4" }}
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 px-3 border rounded-[6px] text-sm transition-colors focus:border-[#1890FF] focus:ring-1 focus:ring-[#1890FF]"
                    style={{
                      background: "var(--bg2)",
                      borderColor: "var(--bcolor2)",
                      color: "var(--color)",
                    }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: "var(--color4)" }}>
                    <input type="checkbox" className="w-4 h-4 accent-[#1890FF]" defaultChecked />
                    Remember me
                  </label>
                  <span className="text-sm" style={{ color: "var(--color5)" }}>
                    Forgot password?
                  </span>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div className="mt-10 mb-[60px]">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-[6px] font-medium text-base text-white transition-shadow disabled:opacity-60"
                    style={{ background: "var(--color5)" }}
                  >
                    {loading ? "Signing in…" : "Login now"}
                  </button>
                </div>
              </form>

              <p className="text-center text-sm" style={{ color: "var(--color7)" }}>
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-medium" style={{ color: "var(--color5)" }}>
                  Create New Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
