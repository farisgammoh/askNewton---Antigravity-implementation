import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { BrainResult } from '../../../lib/brain/types';

// Deterministic template fallback renderer if API key is missing
function generateFallbackExplanation(brainResult: BrainResult, lang: 'en' | 'es' | 'ar'): string {
  const { window, eligibility, plans, topRisk, nextAction } = brainResult;
  const p1 = plans[0] ? `${plans[0].name} (${plans[0].monthlyCost} USD)` : 'N/A';
  const p2 = plans[1] ? `${plans[1].name} (${plans[1].monthlyCost} USD)` : 'N/A';
  const p3 = plans[2] ? `${plans[2].name} (${plans[2].monthlyCost} USD)` : 'N/A';

  if (lang === 'ar') {
    return `مرحباً بك في askNewton. لقد قمنا بتحليل ملفك التأميني بالكامل بناءً على القواعد التنظيمية المحددة:

• **الموعد النهائي للتسجيل**: ينتهي التسجيل الخاص بك في **${window.deadline}** (نوع النافذة: ${window.type}).
• **الدعم المالي**: ${eligibility.subsidyLikely ? 'نعم، أنت مؤهل للحصول على دعم مالي لخفض التكاليف.' : 'بناءً على دخلك، الدعم المالي المباشر قد يكون محدوداً.'}
• **الخطط المقترحة**:
  1. **${p1}** (الخيار الأعلى تقييماً)
  2. **${p2}**
  3. **${p3}**
• **الخطر الأكبر الذي يجب تجنبه**: ${topRisk}
• **إجراء هذا الأسبوع**: **${nextAction}**

*يرجى ملاحظة أن هذه تفاصيل توضيحية فقط. askNewton لا تبيع أو تضمن خطط التأمين. لاختيار خطتك النهائية، يرجى التحدث مع مستشار مرخص.*`;
  }

  if (lang === 'es') {
    return `Bienvenido a askNewton. Hemos procesado su perfil de seguro de acuerdo con nuestras reglas deterministas:

• **Plazo de inscripción**: Su ventana cierra el **${window.deadline}** (Tipo: ${window.type}).
• **Subsidio financiero**: ${eligibility.subsidyLikely ? 'Sí, es altamente probable que califique para subsidios de prima.' : 'Basado en sus ingresos, los subsidios directos pueden ser mínimos.'}
• **Planes sugeridos**:
  1. **${p1}** (Opción recomendada)
  2. **${p2}**
  3. **${p3}**
• **Riesgo crítico a evitar**: ${topRisk}
• **Acción inmediata recomendada**: **${nextAction}**

*Nota: Este análisis es meramente informativo. askNewton no vende ni vincula seguros. Para vinculación oficial de pólizas, debe consultar con un asesor con licencia.*`;
  }

  // Default English
  return `Welcome to askNewton. We have analyzed your insurance profile using our deterministic rules engine:

• **Enrollment Deadline**: Your window closes on **${window.deadline}** (Window Type: ${window.type}).
• **Financial Subsidy**: ${eligibility.subsidyLikely ? 'Yes, you likely qualify for marketplace premium subsidies.' : 'Based on your income band, premium tax credits may be limited.'}
• **Ranked Plan Shortlist**:
  1. **${p1}** (Highest fit score)
  2. **${p2}**
  3. **${p3}**
• **Key Risk Flag**: ${topRisk}
• **Next Best Action**: **${nextAction}**

*Please note: This guide is informational only. askNewton does not sell or bind insurance. To select a plan or bind coverage, please connect with a licensed advisor.*`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { brainResult, language = 'en' } = body as { brainResult: BrainResult; language: 'en' | 'es' | 'ar' };

    if (!brainResult || !brainResult.window) {
      return NextResponse.json({ error: 'Missing brainResult input' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      // Graceful fallback renderer
      console.log('ANTHROPIC_API_KEY missing. Running deterministic fallback template.');
      const fallbackText = generateFallbackExplanation(brainResult, language);
      return NextResponse.json({
        explanation: fallbackText,
        isFallback: true,
      });
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({ apiKey });

    // System prompt enforcing constraints strictly
    const systemPrompt = `You are the plain-language explanation assistant for askNewton, an informational guidance service. You do not sell, solicit, recommend, or bind insurance plans. 
Your single job is to explain the structured JSON output of the Insurance Brain rules engine in a warm, clear, calm, and plain-spoken tone.

Core constraints you MUST follow:
1. You may ONLY use facts and numbers present in the provided BrainResult JSON.
2. NEVER invent, fabricate, or alter any deadline, eligibility flag, plan name, cost, network tier, coverages, exclusions, risks, or next-best actions.
3. NEVER make any recommendations that the Insurance Brain did not produce.
4. Translate your explanation into the requested language: "${language}" (use Arabic with RTL considerations if requested, Spanish if requested, or English by default).
5. If the user requires regulated advice (plan selection, binding coverage, filing appeals), you must explain that you will connect them to a licensed advisor and do not advise.
6. Keep the message structured, starting with a brief warm welcome, followed by bullet points explaining the enrollment window deadline, the subsidy status, the 3 plans (with cost and network tier), the top risk to avoid, and the next best action this week.
7. End with a standard informational disclaimer that this guide is illustrative only and binding requires a human licensed professional.`;

    const userPrompt = `Target explanation language: ${language}
BrainResult JSON to explain:
${JSON.stringify(brainResult, null, 2)}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const explanation = response.content[0].type === 'text' ? response.content[0].text : '';

    return NextResponse.json({
      explanation,
      isFallback: false,
    });

  } catch (error: any) {
    console.error('Error generating AI explanation:', error);
    // Secure fallback on API call failure
    try {
      const body = await req.json();
      const fallbackText = generateFallbackExplanation(body.brainResult, body.language || 'en');
      return NextResponse.json({
        explanation: fallbackText,
        isFallback: true,
        error: error.message
      });
    } catch {
      return NextResponse.json(
        { error: 'Failed to process explain request and fallback failed.' },
        { status: 500 }
      );
    }
  }
}
