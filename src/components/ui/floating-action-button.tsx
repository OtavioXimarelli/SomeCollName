"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { forwardRef } from "react";

interface FloatingActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label?: string;
  size?: "sm" | "md" | "lg";
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  variant?: "primary" | "secondary" | "accent";
}

const FloatingActionButton = forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  ({ icon: Icon, label, size = "md", position = "bottom-right", variant = "primary", className, ...props }, ref) => {
    const sizeClasses = {
      sm: "h-12 w-12",
      md: "h-14 w-14",
      lg: "h-16 w-16"
    };

    const iconSizes = {
      sm: "h-5 w-5",
      md: "h-6 w-6", 
      lg: "h-7 w-7"
    };

    const positionClasses = {
      "bottom-right": "fixed bottom-6 right-6",
      "bottom-left": "fixed bottom-6 left-6",
      "top-right": "fixed top-24 right-6",
      "top-left": "fixed top-24 left-6"
    };

    const variantClasses = {
      primary: "bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-600 hover:to-fuchsia-600 text-white shadow-2xl hover:shadow-pink-500/25",
      secondary: "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-2xl hover:shadow-rose-500/25",
      accent: "bg-gradient-to-r from-fuchsia-500 to-purple-500 hover:from-fuchsia-600 hover:to-purple-600 text-white shadow-2xl hover:shadow-fuchsia-500/25"
    };

    return (
      <div className={cn(positionClasses[position], "z-50")}>
        <Button
          ref={ref}
          className={cn(
            "group rounded-full p-0 border-0 transition-all duration-300 hover:scale-110 active:scale-95",
            sizeClasses[size],
            variantClasses[variant],
            className
          )}
          {...props}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <Icon className={cn(iconSizes[size], "relative z-10 group-hover:rotate-12 transition-transform duration-300")} />
          <span className="sr-only">{label}</span>
        </Button>
        
        {label && (
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-black/80 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap">
              {label}
            </div>
          </div>
        )}
      </div>
    );
  }
);

FloatingActionButton.displayName = "FloatingActionButton";

export { FloatingActionButton };
