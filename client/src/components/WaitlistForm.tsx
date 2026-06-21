import { useState } from "react";
import RegulatoryDisclosure from "./RegulatoryDisclosure";

// US states, ordered to match the guide page.
const STATES = [
  "California", "Texas", "New York", "Florida", "Illinois", "Pennsylvania",
  "Ohio", "Georgia", "North Carolina", "Michigan", "Washington", "Arizona",
  "Massachusetts", "Colorado", "Virginia", "Tennessee", "Indiana", "Missouri",
  "Maryland", "Wisconsin", "Minnesota", "South Carolina", "Alabama", "Louisiana",
  "Kentucky", "Oregon", "Oklahoma", "Connecticut", "Utah", "Iowa", "Nevada",
  "Arkansas", "Mississippi", "Kansas", "New Mexico", "Nebraska", "West Virginia",
  "Idaho", "Hawaii", "New Hampshire", "Maine", "Montana", "Rhode Island",
  "Delaware", "South Dakota", "North Dakota", "Alaska", "Vermont", "Wyoming",
];

const LANGS = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "ar", label: "العربية" },
];

type Status = "idle" | "loading" | "done" | "error";

export default function WaitlistForm({ source = "home" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("");
  const [language, setLanguage] = useState("en");
  const [newcomer, setNewcomer] = useState<"yes" | "no" | "">("");
  const [company, setCompany] = useState(""); // honeypot — kept empty by real users
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const dir = language === "ar" ? "rtl" : "ltr";

  const submit = async () => {
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, state, language, newcomer, company, source }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("done");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  };

  if (status === "done") {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm" data-testid="waitlist-success">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-foreground">You&apos;re on the list</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;ll reach out the moment proactive, multilingual coverage guidance opens in your state.
        </p>
      </div>
    );
  }

  const field =
    "w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground " +
    "outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20";

  return (
    <div dir={dir} className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm" data-testid="waitlist-form">
      <h3 className="text-xl font-semibold text-foreground">Join the waitlist</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Be first to get proactive, multilingual coverage guidance when askNewton opens in your state.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Email</label>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={field}
            data-testid="waitlist-email"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">State (optional)</label>
          <select value={state} onChange={(e) => setState(e.target.value)} className={field} data-testid="waitlist-state">
            <option value="">Select your state…</option>
            {STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Preferred language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className={field} data-testid="waitlist-language">
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
            New to the US healthcare system? (optional)
          </label>
          <div className="flex gap-2">
            {(["yes", "no"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setNewcomer(newcomer === opt ? "" : opt)}
                className={
                  "flex-1 rounded-lg border px-4 py-2 text-sm font-medium capitalize transition " +
                  (newcomer === opt
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input bg-background text-muted-foreground hover:border-accent")
                }
                data-testid={`waitlist-newcomer-${opt}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Honeypot: visually hidden, off-screen, not announced to screen readers. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Company
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              data-testid="waitlist-company"
            />
          </label>
        </div>

        {error && <p className="text-sm text-destructive" data-testid="waitlist-error">{error}</p>}

        <button
          type="button"
          onClick={submit}
          disabled={status === "loading"}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          data-testid="waitlist-submit"
        >
          {status === "loading" ? "Joining…" : "Join the waitlist"}
        </button>

        <RegulatoryDisclosure />
      </div>
    </div>
  );
}
