import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Clario - AI Content Repurposing Tool for Creators";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#0c0a09",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "72px 88px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Orange glow */}
        <div
          style={{
            position: "absolute",
            width: 560,
            height: 560,
            background: "#f97316",
            borderRadius: "50%",
            filter: "blur(130px)",
            opacity: 0.1,
            top: "50%",
            right: -80,
            transform: "translateY(-50%)",
          }}
        />

        {/* Logo mark */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 44, position: "relative" }}>
          <div
            style={{
              width: 52,
              height: 52,
              background: "#f97316",
              borderRadius: 13,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span style={{ fontSize: 36, fontWeight: 300, color: "#fff", letterSpacing: "-0.02em" }}>
            Clario
          </span>
        </div>

        {/* Headline */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(249,115,22,.15)",
              border: "1px solid rgba(249,115,22,.35)",
              color: "#f97316",
              fontSize: 14,
              fontWeight: 700,
              padding: "5px 14px",
              borderRadius: 100,
              marginBottom: 24,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            <div style={{ width: 7, height: 7, background: "#f97316", borderRadius: "50%" }} />
            Built for content creators
          </div>

          <div
            style={{
              fontSize: 72,
              fontWeight: 300,
              color: "#fff",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              marginBottom: 24,
            }}
          >
            Your content,{" "}
            <span style={{ color: "#f97316", fontStyle: "italic" }}>repurposed</span>
            <br />
            for every platform.
          </div>

          <div style={{ fontSize: 22, color: "rgba(255,255,255,.45)", lineHeight: 1.6, maxWidth: 620, marginBottom: 44 }}>
            AI-powered summarizer, remix studio, brand voice library & chat — built for YouTubers, podcasters, and bloggers.
          </div>

          {/* Feature pills */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {["Text Summarizer", "Content Remix Studio", "Brand Voice", "AI Chat"].map((f) => (
              <div
                key={f}
                style={{
                  background: "rgba(255,255,255,.07)",
                  border: "1px solid rgba(255,255,255,.12)",
                  color: "rgba(255,255,255,.7)",
                  fontSize: 16,
                  fontWeight: 500,
                  padding: "8px 18px",
                  borderRadius: 8,
                }}
              >
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom right — price badge */}
        <div
          style={{
            position: "absolute",
            bottom: 56,
            right: 88,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 6,
          }}
        >
          <div style={{ fontSize: 15, color: "rgba(255,255,255,.3)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>
            Start free
          </div>
          <div style={{ fontSize: 48, fontWeight: 300, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1 }}>
            $0<span style={{ fontSize: 20, color: "rgba(255,255,255,.35)", fontWeight: 400 }}>/month</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
