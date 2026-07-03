"use client";

import { Layout } from "@/components/Layout";
import { ModelsShowcase } from "@/components/ModelsShowcase";
import { NimHealthPanel } from "@/components/NimHealthPanel";

export default function ModelsPage() {
  return (
    <Layout>
      <section style={{ padding: "48px 0 32px" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "28px",
            color: "var(--text)",
            marginBottom: "8px",
          }}
        >
          NVIDIA Models Used by PROTEUS
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-soft)", maxWidth: "560px" }}>
          Each step in the pipeline is powered by a dedicated NVIDIA NIM model.
          Models are health-checked every 6 hours and auto-replaced if they go down.
        </p>
      </section>

      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        <NimHealthPanel />
        <ModelsShowcase />
      </div>
    </Layout>
  );
}
