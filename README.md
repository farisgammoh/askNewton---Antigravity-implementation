# AskNewton - Health Insurance for California Newcomers

Simple health insurance guidance for California newcomers. Get clear, fast coverage options for Nomads, Travelers, and Students.

## Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

This starts the development server at `http://localhost:5000`.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
client/src/
├── components/
│   ├── marketing/      # Reusable marketing components
│   │   ├── cta.tsx           # Call-to-action button component
│   │   ├── feature-list.tsx  # Feature list component
│   │   ├── hero.tsx          # Hero section component
│   │   ├── layout.tsx        # Layout wrapper with SEO
│   │   └── section.tsx       # Section wrapper component
│   ├── ui/            # shadcn/ui components
│   ├── FAQ.tsx        # FAQ component
│   ├── Footer.tsx     # Site footer
│   └── Header.tsx     # Site header
├── data/
│   ├── faqs.ts        # FAQ content for all personas
│   └── personas.ts    # Persona data and features
├── pages/
│   ├── home.tsx       # Landing page
│   ├── traveler.tsx   # Traveler persona page
│   ├── student.tsx    # Student persona page
│   ├── nomad.tsx      # Nomad persona page
│   └── ...            # Other pages
└── styles/
    └── index.css      # Global styles and theme variables
```

## Adding a New Persona Page

You can add a new persona page in under 5 minutes by composing existing components:

### Step 1: Add Persona Data

Edit `client/src/data/personas.ts` and add your new persona:

```typescript
export const personas: Record<string, PersonaData> = {
  // ... existing personas
  yourPersona: {
    id: "yourPersona",
    name: "Your Persona",
    tagline: "Your tagline here",
    description: "Brief description",
    icon: YourIcon,
    heroTitle: "For Your Persona — your value proposition",
    heroDescription: "Detailed description of what you offer",
    whatsappMessage: "Hi AskNewton, I'm [your persona]",
    metaDescription: "SEO meta description for this persona",
    features: [
      {
        icon: Shield,
        description: "Key feature 1"
      },
      // ... more features
    ],
    benefits: [
      {
        icon: Clock,
        title: "Benefit title",
        description: "Benefit description"
      },
      // ... more benefits
    ]
  }
};
```

### Step 2: Add FAQ Content

Edit `client/src/data/faqs.ts`:

```typescript
export const yourPersonaFAQs: FAQ[] = [
  {
    question: "Common question 1?",
    answer: "Answer to question 1"
  },
  // ... more FAQs
];

// Update the getFAQsForPersona function
export function getFAQsForPersona(persona?: "traveler" | "student" | "nomad" | "yourPersona"): FAQ[] {
  switch (persona) {
    // ... existing cases
    case "yourPersona":
      return yourPersonaFAQs;
    default:
      return generalFAQs;
  }
}
```

### Step 3: Create the Page Component

Create `client/src/pages/your-persona.tsx`:

```typescript
import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";
import Layout from "@/components/marketing/layout";
import Hero from "@/components/marketing/hero";
import Section from "@/components/marketing/section";
import FeatureList from "@/components/marketing/feature-list";
import CTA from "@/components/marketing/cta";
import FAQ from "@/components/FAQ";
import { Button } from "@/components/ui/button";
import { getPersonaData } from "@/data/personas";

export default function YourPersona() {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "14157697858";
  const persona = getPersonaData("yourPersona")!;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(persona.whatsappMessage)}`;

  return (
    <Layout
      title="Your Persona - Health Insurance in California"
      description={persona.metaDescription}
      canonical="https://asknewton.com/your-persona"
    >
      <div className="max-w-4xl mx-auto space-y-10">
        <Link href="/">
          <Button variant="ghost" className="mb-6" data-testid="button-back-home">
            <ChevronLeft className="w-4 h-4 mr-2" aria-hidden="true" />
            Back to home
          </Button>
        </Link>

        <Hero
          title={persona.heroTitle}
          description={<>Your <strong>compelling</strong> description here</>}
        >
          <CTA
            variant="primary"
            href="/start?persona=yourPersona"
            size="lg"
            testId="button-start-wizard"
          >
            Start assessment
          </CTA>
          <CTA
            variant="whatsapp"
            href={whatsappUrl}
            external
            size="lg"
            testId="button-hero-whatsapp"
            ariaLabel="Chat with us on WhatsApp"
          >
            Chat on WhatsApp
          </CTA>
        </Hero>

        <Section>
          <FeatureList features={persona.features} />
        </Section>

        {/* Add your custom sections here */}
        
        <FAQ persona="yourPersona" />
      </div>
    </Layout>
  );
}
```

### Step 4: Add the Route

Edit `client/src/App.tsx` and add your route:

```typescript
import YourPersona from "@/pages/your-persona";

// In the Router component
<Route path="/your-persona" component={YourPersona} />
```

### Step 5: Update Navigation (Optional)

Add a link to your new persona in:
- `client/src/components/Header.tsx` (navigation)
- `client/src/components/Footer.tsx` (footer links)
- `client/src/pages/home.tsx` (persona cards section)

### Step 6: Update SEO Files

Add your new page to `public/sitemap.xml`:

```xml
<url>
  <loc>https://asknewton.com/your-persona</loc>
  <lastmod>2024-01-01</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>
```

That's it! Your new persona page is ready with:
- ✅ Proper SEO meta tags
- ✅ Accessible HTML structure
- ✅ Responsive design
- ✅ Consistent styling
- ✅ Reusable components

## Code Quality

### Linting and Formatting

```bash
# Check for lint errors
npm run lint

# Format code with Prettier
npm run format
```

### Key Accessibility Features

- Semantic HTML with proper heading hierarchy
- Skip-to-content link for keyboard navigation
- ARIA labels for icons and interactive elements
- Focus-visible styles for keyboard navigation
- Proper color contrast (WCAG AA minimum)
- Alt text for all images
- Role attributes where appropriate

### Performance Optimizations

- Font loading with `display=swap`
- Optimized images with width/height attributes
- Lazy loading for images
- Code splitting via route-based chunks
- CSS variables for theming

### SEO Best Practices

- Unique title and meta description per page
- Canonical URLs
- Open Graph and Twitter Card meta tags
- Semantic HTML structure
- Sitemap.xml and robots.txt
- Meaningful link text

## License

MIT
