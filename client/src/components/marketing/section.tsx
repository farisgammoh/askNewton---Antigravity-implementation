import { ReactNode } from "react";

interface SectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
  variant?: "default" | "muted";
  id?: string;
}

export default function Section({
  title,
  children,
  className = "",
  variant = "default",
  id
}: SectionProps) {
  const variantClasses = {
    default: "",
    muted: "bg-muted/50 rounded-2xl"
  };

  return (
    <section
      id={id}
      className={`py-10 px-4 ${variantClasses[variant]} ${className}`}
      data-testid={`section-${id || "content"}`}
    >
      <div className="max-w-4xl mx-auto">
        {title && (
          <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-8 text-center">
            {title}
          </h2>
        )}
        {children}
      </div>
    </section>
  );
}
