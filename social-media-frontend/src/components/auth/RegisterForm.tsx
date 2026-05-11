"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { AxiosError } from "axios";

export default function RegisterForm() {
  const { register } = useAuth();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "First name is required.";
    if (!form.lastName.trim()) e.lastName = "Last name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email address.";
    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 8) e.password = "Min. 8 characters required.";
    else if (!/(?=.*\d)(?=.*[a-zA-Z])/.test(form.password))
      e.password = "Must contain at least one letter and one number.";
    if (!agreed) e.agreed = "You must agree to the terms.";
    return e;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError("");
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await register(form);
    } catch (err) {
      setApiError(
        err instanceof AxiosError
          ? err.response?.data?.message ?? "Registration failed."
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  const set = (k: keyof typeof form) => (ev: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [k]: ev.target.value }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
  };

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
              src="/registration.png"
              alt="Registration illustration"
              width={600}
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
                Get Started Now
              </p>
              <h4 className="text-center font-medium text-[28px] mb-12" style={{ color: "var(--color1)" }}>
                Registration
              </h4>

              <div className="mb-10 relative">
                <hr style={{ borderColor: "var(--bg4)" }} />
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-sm"
                  style={{ color: "var(--color7)" }}
                >
                  Or
                </div>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-[14px]">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-sm mb-2" style={{ color: "var(--color4)" }}>
                      First name
                    </label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={set("firstName")}
                      placeholder="John"
                      className="w-full h-12 px-3 border rounded-[6px] text-sm focus:border-[#1890FF] focus:ring-1 focus:ring-[#1890FF]"
                      style={{ borderColor: errors.firstName ? "#ef4444" : "var(--bcolor2)" }}
                    />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block font-medium text-sm mb-2" style={{ color: "var(--color4)" }}>
                      Last name
                    </label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={set("lastName")}
                      placeholder="Doe"
                      className="w-full h-12 px-3 border rounded-[6px] text-sm focus:border-[#1890FF] focus:ring-1 focus:ring-[#1890FF]"
                      style={{ borderColor: errors.lastName ? "#ef4444" : "var(--bcolor2)" }}
                    />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-[16px] mb-2" style={{ color: "var(--color4)" }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    placeholder="you@example.com"
                    className="w-full h-12 px-3 border rounded-[6px] text-sm focus:border-[#1890FF] focus:ring-1 focus:ring-[#1890FF]"
                    style={{ borderColor: errors.email ? "#ef4444" : "var(--bcolor2)" }}
                    autoComplete="email"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block font-medium text-[16px] mb-2" style={{ color: "var(--color4)" }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={set("password")}
                    placeholder="Min. 8 chars with letter and number"
                    className="w-full h-12 px-3 border rounded-[6px] text-sm focus:border-[#1890FF] focus:ring-1 focus:ring-[#1890FF]"
                    style={{ borderColor: errors.password ? "#ef4444" : "var(--bcolor2)" }}
                    autoComplete="new-password"
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                {/* Terms checkbox */}
                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: "var(--color4)" }}>
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => { setAgreed(e.target.checked); setErrors((p) => ({ ...p, agreed: "" })); }}
                      className="w-4 h-4 accent-[#1890FF]"
                    />
                    I agree to terms &amp; conditions
                  </label>
                  {errors.agreed && <p className="text-red-500 text-xs mt-1">{errors.agreed}</p>}
                </div>

                {apiError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                    {apiError}
                  </div>
                )}

                <div className="mt-10 mb-[60px]">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-[6px] font-medium text-base text-white transition-shadow disabled:opacity-60"
                    style={{ background: "var(--color5)" }}
                  >
                    {loading ? "Creating account…" : "Register now"}
                  </button>
                </div>
              </form>

              <p className="text-center text-sm" style={{ color: "var(--color7)" }}>
                Already have an account?{" "}
                <Link href="/login" className="font-medium" style={{ color: "var(--color5)" }}>
                  Login Now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
