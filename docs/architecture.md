# AskNewton Architecture Overview

AskNewton is an AI-native health insurance platform powered by a multi-agent orchestration kernel (“Society of Mind”), a modular Node.js backend, and real-time voice automation through ElevenLabs.

This document provides a high-level tour of the system architecture.

---

# 🏗 High-Level System Architecture

```mermaid
flowchart LR
    subgraph User Side
        U1[Web User<br/>Founder / Nomad]
        U2[Voice User<br/>(Phone / Browser)]
    end

    subgraph Frontend
        C[Client App<br/>(React / Next-style)]
    end

    subgraph Backend
        S[Server<br/>Node.js / Express]
        SOC[Society of Agents<br/>(Multi-Agent Orchestrator)]
        SHARED[Shared Libs<br/>Types / Utils]
        DATA[Data Layer<br/>In-memory / Future DB]
    end

    subgraph External Services
        EL[ElevenLabs<br/>Voice & Webhooks]
        OA[OpenAI<br/>LLM / Tools]
        ST[Stripe<br/>Billing]
        HS[HubSpot<br/>CRM]
    end

    U1 --> C
    U2 --> EL
    C --> S
    EL -->|/webhooks/eleven/*| S

    S --> SOC
    SOC --> OA
    SOC --> ST
    SOC --> HS
    SOC --> DATA

