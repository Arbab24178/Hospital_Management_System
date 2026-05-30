import React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline"
  size?: "sm" | "md" | "lg"
}

export function Button({ className, variant = "primary", size = "md", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97]",
        {
          "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500": variant === "primary",
          "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500": variant === "secondary",
          "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500": variant === "danger",
          "hover:bg-gray-100 text-gray-700": variant === "ghost",
          "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50": variant === "outline",
        },
        {
          "px-3 py-1.5 text-sm": size === "sm",
          "px-4 py-2 text-sm": size === "md",
          "px-6 py-3 text-base": size === "lg",
        },
        className
      )}
      {...props}
    />
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ className, label, error, id, ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { label: string; value: string }[]
}

export function Select({ className, label, error, options, id, ...props }: SelectProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          "block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
          error && "border-red-500",
          className
        )}
        {...props}
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn("rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5", className)}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <div className={cn("border-b border-gray-100 px-6 py-4", className)}>
      {children}
    </div>
  )
}

export function CardContent({ children, className }: CardProps) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>
}

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color?: string
  delay?: number
}

export function StatCard({ title, value, icon, color = "blue", delay = 0 }: StatCardProps) {
  const colorMap: Record<string, string> = {
    blue: "bg-red-50 text-red-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    yellow: "bg-yellow-50 text-yellow-600",
    purple: "bg-purple-50 text-purple-600",
    indigo: "bg-indigo-50 text-indigo-600",
  }

  return (
    <div
      className="animate-fade-in-up opacity-0 [animation-fill-mode:forwards]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{title}</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
            </div>
            <div className={cn("rounded-lg p-3 transition-transform duration-300 group-hover:scale-110", colorMap[color] || colorMap.blue)}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface BadgeProps {
  children: React.ReactNode
  variant?: "success" | "warning" | "danger" | "info" | "default"
  className?: string
}

export function Badge({ children, variant, className }: BadgeProps) {
  const variants: Record<string, string> = {
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-red-100 text-red-800",
    default: "bg-gray-100 text-gray-800",
  }

  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", variant && variants[variant], !variant && !className && variants.default, className)}>
      {children}
    </span>
  )
}

interface TableProps {
  children: React.ReactNode
}

export function Table({ children }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">{children}</table>
    </div>
  )
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-gray-50">{children}</thead>
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-gray-200 bg-white">{children}</tbody>
}

interface TableRowProps {
  children: React.ReactNode
  className?: string
}

export function TableRow({ children, className }: TableRowProps) {
  return <tr className={cn("hover:bg-gray-50", className)}>{children}</tr>
}

interface TableCellProps {
  children: React.ReactNode
  className?: string
  header?: boolean
}

export function TableCell({ children, className, header = false }: TableCellProps) {
  const Tag = header ? "th" : "td"
  return (
    <Tag className={cn("px-6 py-3 text-sm", header ? "text-left text-xs font-medium uppercase tracking-wider text-gray-500" : "text-gray-900", className)}>
      {children}
    </Tag>
  )
}

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 animate-fade-in" onClick={onClose} />
      <div className="relative z-50 w-full max-w-2xl rounded-xl bg-white shadow-xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
