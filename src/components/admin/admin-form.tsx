"use client";

import { ReactNode, FormHTMLAttributes, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function FormField({ label, error, required, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-1 text-sm text-red-400"
          >
            <AlertCircle size={14} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isLoading?: boolean;
  successMessage?: string;
}

export function AdminForm({
  children,
  onSubmit,
  isLoading,
  successMessage,
  ...props
}: FormProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSubmit) {
      try {
        await onSubmit(e);
        if (successMessage) {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        }
      } catch {
        // Error handled by individual fields
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} {...props}>
      <div className="space-y-6">{children}</div>

      <AnimatePresence>
        {showSuccess && successMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-6 flex items-center gap-2 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400"
          >
            <CheckCircle size={18} />
            <span>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading && (
        <div className="mt-6 flex items-center justify-center gap-2 text-cyan-400">
          <Loader2 size={18} className="animate-spin" />
          <span>Saving...</span>
        </div>
      )}
    </form>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function FormInput({ error, className, ...props }: InputProps) {
  return (
    <input
      className={`w-full px-4 py-2.5 bg-slate-900/50 border rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
        error
          ? "border-red-500/50 focus:ring-red-500/50"
          : "border-slate-700 focus:ring-cyan-500/50"
      } ${className || ""}`}
      {...props}
    />
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function FormTextarea({ error, className, ...props }: TextareaProps) {
  return (
    <textarea
      className={`w-full px-4 py-2.5 bg-slate-900/50 border rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-colors resize-none ${
        error
          ? "border-red-500/50 focus:ring-red-500/50"
          : "border-slate-700 focus:ring-cyan-500/50"
      } ${className || ""}`}
      {...props}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: { value: string; label: string }[];
}

export function FormSelect({ error, options, className, ...props }: SelectProps) {
  return (
    <select
      className={`w-full px-4 py-2.5 bg-slate-900/50 border rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:border-transparent transition-colors cursor-pointer ${
        error
          ? "border-red-500/50 focus:ring-red-500/50"
          : "border-slate-700 focus:ring-cyan-500/50"
      } ${className || ""}`}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
