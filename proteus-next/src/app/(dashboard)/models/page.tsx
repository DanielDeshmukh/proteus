"use client";

import { Layout } from "@/components/Layout";
import { ModelsShowcase } from "@/components/ModelsShowcase";
import { NimHealthPanel } from "@/components/NimHealthPanel";

export default function ModelsPage() {
  return (
    <Layout>
      <section style={{ padding: "40px 0 24px" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "clamp(20px, 4vw, 28px)",
            color: "var(--text)",
            marginBottom: "8px",
          }}
        >
          AI Models Used by PROTEUS
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-soft)", maxWidth: "560px", lineHeight: 1.6 }}>
          4 agents run on NVIDIA NIM; the cover letter agent runs on Groq.
          Models are health-checked every 3 hours and auto-replaced if they go down.
        </p>
      </section>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <NimHealthPanel />
        <ModelsShowcase />
      </div>
    </Layout>
  );
}
