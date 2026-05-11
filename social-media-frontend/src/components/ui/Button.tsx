"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import Spinner from "./Spinner";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: ReactNode;
}

const variantClasses = {
  primary:
    "bg-blue-600 hover:bg-blue-700 text-white border-transparent disabled:bg-blue-300",
  secondary:
    "bg-white hover:bg-gray-50 text-gray-700 border-gray-300 disabled:opacity-50",
  ghost:
    "bg-transparent hover:bg-gray-100 text-gray-600 border-transparent disabled:opacity-50",
  danger:
    "bg-red-600 hover:bg-red-700 text-white border-transparent disabled:bg-red-300",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg border transition-colors cursor-pointer
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}
        disabled:cursor-not-allowed`}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}
