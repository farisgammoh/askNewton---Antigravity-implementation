import { Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
}

export default function Logo({ className }: LogoProps) {
    return (
        <div className={cn("flex items-center space-x-2", className)}>
            <Calculator className="w-6 h-6" />
            <span className="font-semibold text-foreground">askNewton</span>
        </div>
    );
}