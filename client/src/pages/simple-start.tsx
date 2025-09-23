import { useEffect } from "react";
import ConversationalOnboarding from "@/components/ConversationalOnboarding";

export default function SimpleStart() {
  useEffect(() => {
    // Set page title and meta description for SEO
    document.title = "Quick Health Insurance Chat - AskNewton";
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Get personalized health insurance recommendations through a quick 5-question chat. Perfect for newcomers to California.');
    } else {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      metaDescription.setAttribute('content', 'Get personalized health insurance recommendations through a quick 5-question chat. Perfect for newcomers to California.');
      document.head.appendChild(metaDescription);
    }

    // Add comprehensive Open Graph tags
    const ogTags = [
      { property: 'og:title', content: 'Quick Health Insurance Chat - AskNewton' },
      { property: 'og:description', content: 'Get personalized health insurance recommendations through a quick 5-question chat. Perfect for newcomers to California.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: window.location.href }
    ];

    ogTags.forEach(({ property, content }) => {
      let existingTag = document.querySelector(`meta[property="${property}"]`);
      if (existingTag) {
        existingTag.setAttribute('content', content);
      } else {
        const newTag = document.createElement('meta');
        newTag.setAttribute('property', property);
        newTag.setAttribute('content', content);
        document.head.appendChild(newTag);
      }
    });
  }, []);

  return <ConversationalOnboarding />;
}