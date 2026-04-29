import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "interactive" | "glass";
  tone?: "default" | "success" | "warning" | "danger";
}

export function Card({ className, variant = "default", tone = "default", ...props }: CardProps) {
  const variantClasses = {
    default: "rounded-xl border border-slate-200 bg-white shadow-sm",
    elevated: "rounded-xl border border-slate-100 bg-white shadow-[0_1px_3px_0_rgb(0_0_0_/_0.05),0_1px_2px_-1px_rgb(0_0_0_/_0.05)]",
    interactive: "rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer",
    glass: "rounded-xl border border-slate-200/50 bg-white/80 backdrop-blur-sm shadow-sm",
  };

  const toneClasses = {
    default: "",
    success: "border-l-4 border-l-emerald-500 bg-emerald-50/50",
    warning: "border-l-4 border-l-amber-500 bg-amber-50/50",
    danger: "border-l-4 border-l-red-500 bg-red-50/50",
  };

  return (
    <div
      className={cn(variantClasses[variant], toneClasses[tone], "p-5", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5 pb-2", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg font-semibold tracking-tight text-slate-900", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-slate-500", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center pt-2 border-t border-slate-100", className)}
      {...props}
    />
  );
}