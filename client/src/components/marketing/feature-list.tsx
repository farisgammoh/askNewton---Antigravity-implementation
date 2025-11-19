import { LucideIcon, Check } from "lucide-react";

interface Feature {
  icon?: LucideIcon;
  title?: string;
  description: string;
}

interface FeatureListProps {
  features: Feature[];
  variant?: "simple" | "detailed";
  columns?: 1 | 2 | 3;
  className?: string;
}

export default function FeatureList({
  features,
  variant = "simple",
  columns = 1,
  className = ""
}: FeatureListProps) {
  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
  };

  if (variant === "simple") {
    return (
      <ul className={`space-y-3 text-muted-foreground ${className}`} data-testid="feature-list">
        {features.map((feature, index) => {
          const IconComponent = feature.icon || Check;
          return (
            <li key={index} className="flex items-start gap-3" data-testid={`feature-${index}`}>
              <IconComponent className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span>{feature.description}</span>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className={`grid ${columnClasses[columns]} gap-6 ${className}`} data-testid="feature-grid">
      {features.map((feature, index) => {
        const IconComponent = feature.icon || Check;
        return (
          <div
            key={index}
            className="flex flex-col space-y-2"
            data-testid={`feature-${index}`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <IconComponent className="w-5 h-5 text-accent" aria-hidden="true" />
              </div>
              {feature.title && (
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
              )}
            </div>
            <p className="text-muted-foreground text-sm">{feature.description}</p>
          </div>
        );
      })}
    </div>
  );
}
