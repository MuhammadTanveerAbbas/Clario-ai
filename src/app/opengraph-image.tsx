import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const alt = "Clario - AI content platform for creators";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fraunces = await readFile(join(process.cwd(), "assets/Fraunces-Regular.ttf"));
const cantarell = await readFile(join(process.cwd(), "assets/Cantarell-Regular.ttf"));

export default function OGImage() {
  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Cantarell" }}>
        <div style={{ width: 1120, height: 630, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 540 }}>
            <div style={{ width: 92, height: 92, borderRadius: 22, background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 26 }}>
              <svg width="54" height="54" viewBox="0 0 32 32" fill="none">
                <g stroke="white" strokeWidth="2.8" strokeLinecap="round" fill="none">
                  <path d="M16 6L6 11l10 5 10-5-10-5z" />
                  <path d="M6 21l10 5 10-5" />
                  <path d="M6 16l10 5 10-5" />
                </g>
              </svg>
            </div>
            <div style={{ fontFamily: "Fraunces", fontSize: 76, lineHeight: 1, color: "#171412", letterSpacing: "-0.03em", marginBottom: 20 }}>clario</div>
            <div style={{ fontSize: 26, color: "#6f675e", lineHeight: 1.4, textAlign: "center" }}>Create content that sounds like your brand.</div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: [
      { name: "Fraunces", data: fraunces, style: "normal", weight: 400 },
      { name: "Cantarell", data: cantarell, style: "normal", weight: 400 },
    ] }
  );
}
