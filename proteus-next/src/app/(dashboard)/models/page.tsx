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
          NVIDIA Models Used by PROTEUS
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-soft)", maxWidth: "560px", lineHeight: 1.6 }}>
          Each step in the pipeline is powered by a dedicated NVIDIA NIM model.
          Models are health-checked every 6 hours and auto-replaced if they go down.
        </p>
      </section>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <NimHealthPanel />
        <ModelsShowcase />
      </div>
    </Layout>
  );
}
