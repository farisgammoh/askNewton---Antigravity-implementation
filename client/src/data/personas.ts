import { LucideIcon, Globe, GraduationCap, Laptop, Shield, Clock, Heart, DollarSign, FileText } from "lucide-react";

export interface PersonaFeature {
  icon?: LucideIcon;
  title?: string;
  description: string;
}

export interface PersonaData {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  heroTitle: string;
  heroDescription: string;
  features: PersonaFeature[];
  benefits: PersonaFeature[];
  whatsappMessage: string;
  metaDescription: string;
}

export const personas: Record<string, PersonaData> = {
  traveler: {
    id: "traveler",
    name: "Travelers",
    tagline: "Straightforward U.S. medical coverage for 1–6 months",
    description: "Emergency-ready protection without overpaying",
    icon: Globe,
    heroTitle: "For Travelers — straightforward U.S. medical coverage for 1–6 months.",
    heroDescription: "If you want emergency-ready protection without overpaying, start here.",
    whatsappMessage: "Hi AskNewton, I'm a traveler visiting California",
    metaDescription: "Get emergency medical coverage for your California visit. Travel medical insurance guidance for 1-6 month stays with clear claims instructions and family options.",
    features: [
      {
        icon: Shield,
        description: "Know what travel medical really covers in U.S. hospitals"
      },
      {
        icon: FileText,
        description: "Clear claims instructions before you fly"
      },
      {
        icon: Heart,
        description: "Family add-ons and adventure-sports checks"
      }
    ],
    benefits: [
      {
        icon: Clock,
        title: "Quick Coverage",
        description: "Get covered within 24-48 hours of arrival"
      },
      {
        icon: DollarSign,
        title: "Affordable Options",
        description: "Plans starting from $50-200/month"
      },
      {
        icon: Shield,
        title: "Emergency Ready",
        description: "Coverage for ER visits, urgent care, and ambulance services"
      }
    ]
  },
  student: {
    id: "student",
    name: "Students",
    tagline: "SHIP vs private plans, waivers made simple",
    description: "Waiver-ready coverage and dependent options",
    icon: GraduationCap,
    heroTitle: "For Students — SHIP vs private plans, waivers made simple.",
    heroDescription: "If you want waiver-ready coverage and dependent options, start here.",
    whatsappMessage: "Hi AskNewton, I'm a student arriving in California",
    metaDescription: "Navigate student health insurance in California. SHIP waiver guidance, dependent coverage, and immunization compliance for international students.",
    features: [
      {
        icon: Shield,
        description: "Avoid waiver denials and missed deadlines"
      },
      {
        icon: Heart,
        description: "Network near campus + dental/vision add-ons"
      },
      {
        icon: FileText,
        description: "Immunization/TB compliance pointers"
      }
    ],
    benefits: [
      {
        icon: FileText,
        title: "Waiver Support",
        description: "Ensure your plan meets university requirements"
      },
      {
        icon: Heart,
        title: "Dependent Coverage",
        description: "Options for spouses and children"
      },
      {
        icon: Clock,
        title: "Year-Round Coverage",
        description: "Protection during breaks and holidays"
      }
    ]
  },
  nomad: {
    id: "nomad",
    name: "Nomads",
    tagline: "Get covered while you settle in",
    description: "Straight answers on travel vs short-term vs marketplace",
    icon: Laptop,
    heroTitle: "For Nomads in California — get covered while you settle in.",
    heroDescription: "If you're a remote worker or founder and want straight answers on travel vs short-term vs marketplace, start here.",
    whatsappMessage: "Hi AskNewton, I'm a nomad arriving in California",
    metaDescription: "Health insurance for digital nomads in California. Compare travel medical, short-term, and marketplace plans for remote workers and founders.",
    features: [
      {
        icon: Shield,
        description: "Avoid gotchas: networks, ER bills, pre-existing exclusions"
      },
      {
        icon: Clock,
        description: "Options within 24h, matched to your arrival and address status"
      },
      {
        icon: FileText,
        description: "Proof-of-coverage guidance for visas and co-working"
      }
    ],
    benefits: [
      {
        icon: DollarSign,
        title: "Flexible Plans",
        description: "Month-to-month or longer-term options"
      },
      {
        icon: Shield,
        title: "Comprehensive Coverage",
        description: "From basic emergency to full marketplace plans"
      },
      {
        icon: Clock,
        title: "Fast Enrollment",
        description: "Get covered within 24-48 hours"
      }
    ]
  }
};

export function getPersonaData(personaId: string): PersonaData | undefined {
  return personas[personaId];
}

export type PersonaId = "traveler" | "student" | "nomad";
