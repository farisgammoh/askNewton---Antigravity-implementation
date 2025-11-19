import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface CTAProps {
  variant?: "primary" | "secondary" | "outline" | "whatsapp" | "calendly";
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  icon?: LucideIcon;
  size?: "sm" | "default" | "lg";
  external?: boolean;
  ariaLabel?: string;
  testId?: string;
  className?: string;
}

export default function CTA({
  variant = "primary",
  href,
  onClick,
  children,
  icon: Icon,
  size = "default",
  external = false,
  ariaLabel,
  testId,
  className = ""
}: CTAProps) {
  const variantStyles = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
    outline: "border-primary text-primary hover:bg-primary hover:text-primary-foreground",
    whatsapp: "bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600",
    calendly: "bg-blue-500 hover:bg-blue-600 text-white border-blue-500 hover:border-blue-600"
  };

  const buttonContent = (
    <Button
      variant={variant === "outline" ? "outline" : "default"}
      size={size}
      onClick={onClick}
      className={`${variantStyles[variant]} ${className} focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all`}
      data-testid={testId}
      aria-label={ariaLabel}
    >
      {Icon && <Icon className="w-4 h-4 mr-2" aria-hidden="true" />}
      {children}
    </Button>
  );

  if (external && href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex"
        aria-label={ariaLabel}
      >
        {buttonContent}
      </a>
    );
  }

  if (href) {
    return (
      <Link href={href}>
        {buttonContent}
      </Link>
    );
  }

  return buttonContent;
}
