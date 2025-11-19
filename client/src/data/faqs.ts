export interface FAQ {
  question: string;
  answer: string;
}

export const generalFAQs: FAQ[] = [
  {
    question: "Is AskNewton an insurance company?",
    answer: "No, we're not an insurer. We're licensed insurance professionals who provide guidance and help you navigate California's health insurance landscape."
  },
  {
    question: "How much does your service cost?",
    answer: "Our guidance is completely free. We're compensated by insurance companies when you enroll through our recommendations, not by you."
  },
  {
    question: "What if I'm here on a tourist visa?",
    answer: "Tourist visas typically require travel medical insurance. We'll help you understand coverage limits and find options that work for short-term stays."
  },
  {
    question: "How quickly can I get covered?",
    answer: "For most plans, coverage can start within 24-48 hours. We'll walk you through the enrollment process and ensure you understand your coverage before you activate it."
  }
];

export const travelerFAQs: FAQ[] = [
  {
    question: "What's the difference between travel insurance and travel medical insurance?",
    answer: "Travel insurance often covers trip cancellations and lost baggage. Travel medical insurance specifically covers medical emergencies during your trip. For U.S. visits, you need travel medical insurance."
  },
  {
    question: "Will my home country insurance work in the U.S.?",
    answer: "Most likely no. U.S. healthcare costs are among the highest in the world, and most international plans either don't cover U.S. care or have very limited coverage."
  },
  {
    question: "What happens if I need emergency care?",
    answer: "Call 911 for life-threatening emergencies. For urgent but non-life-threatening issues, find an in-network urgent care center. Always carry your insurance card and policy number."
  },
  {
    question: "How much does travel medical insurance typically cost?",
    answer: "Expect to pay $50-200 per month depending on your age, coverage limits, and length of stay. We'll help you find a plan that fits your budget."
  }
];

export const studentFAQs: FAQ[] = [
  {
    question: "What is a SHIP waiver and do I need one?",
    answer: "A SHIP waiver allows you to opt out of your school's insurance plan if you have comparable coverage. Requirements vary by university, and waiver deadlines are strict—we'll help ensure your plan qualifies."
  },
  {
    question: "Can I add my spouse or children to my student plan?",
    answer: "Many plans allow dependents, but costs and eligibility vary. Some SHIP plans charge extra for dependents, while private plans may offer better family rates."
  },
  {
    question: "What if I need coverage during school breaks?",
    answer: "SHIP plans typically cover breaks, but verify your specific plan. If you're traveling internationally during breaks, you may need additional travel medical coverage."
  },
  {
    question: "Do I need dental and vision coverage?",
    answer: "Most medical plans don't include dental and vision. You can often add these separately or purchase standalone plans. We'll help you compare options and costs."
  }
];

export const nomadFAQs: FAQ[] = [
  {
    question: "What's the difference between short-term and marketplace plans?",
    answer: "Short-term plans don't cover pre-existing conditions and have limited benefits, but are available year-round. Marketplace plans offer comprehensive coverage but have enrollment periods. We'll help you decide based on your timeline and health needs."
  },
  {
    question: "Can I get coverage before I arrive in California?",
    answer: "Some plans allow you to purchase before arrival, while others require a California address. We'll guide you through the timing and address requirements."
  },
  {
    question: "What if I'm planning to stay longer than 12 months?",
    answer: "For stays over 12 months, marketplace plans usually make more sense. We'll help you time your enrollment with special enrollment periods or open enrollment."
  },
  {
    question: "Do these plans cover pre-existing conditions?",
    answer: "Marketplace plans cover pre-existing conditions; short-term plans typically don't. Travel medical plans may have limited pre-existing condition coverage. Your specific health needs will guide which plan type works best."
  }
];

export type PersonaId = "traveler" | "student" | "nomad";

export function getFAQsForPersona(persona?: PersonaId): FAQ[] {
  switch (persona) {
    case "traveler":
      return travelerFAQs;
    case "student":
      return studentFAQs;
    case "nomad":
      return nomadFAQs;
    default:
      return generalFAQs;
  }
}
