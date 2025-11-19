import { Card, CardContent } from "@/components/ui/card";
import { FAQ as FAQType, PersonaId, getFAQsForPersona } from "@/data/faqs";

interface FAQProps {
  persona?: PersonaId;
  faqs?: FAQType[];
}

export default function FAQ({ persona, faqs }: FAQProps) {
  const displayFAQs = faqs || getFAQsForPersona(persona);

  return (
    <section className="py-16 bg-muted/50 rounded-2xl" data-testid="section-faq">
      <div className="max-w-4xl mx-auto px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {displayFAQs.map((faq, index) => (
            <Card key={index} data-testid={`faq-item-${index}`}>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
