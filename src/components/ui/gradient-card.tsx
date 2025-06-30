"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface GradientCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary" | "accent" | "glass";
  size?: "sm" | "md" | "lg" | "xl";
  interactive?: boolean;
  glowEffect?: boolean;
}

const GradientCard = forwardRef<HTMLDivElement, GradientCardProps>(
  ({ variant = "primary", size = "md", interactive = false, glowEffect = false, className, children, ...props }, ref) => {
    const variantClasses = {
      primary: "bg-gradient-to-br from-pink-50 to-fuchsia-50 border-pink-200/50",
      secondary: "bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200/50", 
      accent: "bg-gradient-to-br from-fuchsia-50 to-purple-50 border-fuchsia-200/50",
      glass: "bg-white/70 backdrop-blur-xl border-pink-200/30"
    };

    const sizeClasses = {
      sm: "p-4 rounded-xl",
      md: "p-6 rounded-2xl",
      lg: "p-8 rounded-3xl",
      xl: "p-10 rounded-3xl"
    };

    const interactiveClasses = interactive 
      ? "transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
      : "";

    const glowClasses = glowEffect
      ? {
          primary: "hover:shadow-pink-500/20",
          secondary: "hover:shadow-rose-500/20",
          accent: "hover:shadow-fuchsia-500/20",
          glass: "hover:shadow-pink-500/20"
        }[variant]
      : "";

    return (
      <div
        ref={ref}
        className={cn(
          "border shadow-xl",
          variantClasses[variant],
          sizeClasses[size],
          interactiveClasses,
          glowClasses,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GradientCard.displayName = "GradientCard";

export { GradientCard };
