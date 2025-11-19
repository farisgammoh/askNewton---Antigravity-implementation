import { ReactNode } from "react";

interface HeroProps {
  title: string;
  description: string | ReactNode;
  children?: ReactNode;
  className?: string;
}

export default function Hero({ title, description, children, className = "" }: HeroProps) {
  return (
    <section 
      className={`text-center space-y-6 py-12 ${className}`}
      data-testid="section-hero"
    >
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground mb-6 px-4">
        {title}
      </h1>
      <div className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto px-4">
        {description}
      </div>
      {children && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 px-4">
          {children}
        </div>
      )}
    </section>
  );
}
