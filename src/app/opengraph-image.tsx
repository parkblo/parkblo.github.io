import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OpengraphImage() {
  const publicDir = path.join(process.cwd(), "public", "fonts");
  const [galmuriFont, pixelIconFont] = await Promise.all([
    readFile(path.join(publicDir, "Galmuri9.ttf")),
    readFile(path.join(publicDir, "pixelart-icons-font.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 20,
          padding: "84px",
          background:
            "linear-gradient(135deg, rgb(245, 245, 244) 0%, rgb(231, 229, 228) 100%)",
          color: "rgb(28, 25, 23)",
          fontFamily: "Galmuri9",
        }}
      >
        <div
          style={{
            fontFamily: "PixelartIcons",
            fontSize: 56,
            lineHeight: 1,
            opacity: 0.85,
          }}
        >
          {"\ueb92"}
        </div>
        <div
          style={{
            fontSize: 118,
            fontWeight: 400,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            whiteSpace: "pre-wrap",
          }}
        >
          {"brad.\ndev blog"}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Galmuri9",
          data: galmuriFont,
          style: "normal",
          weight: 400,
        },
        {
          name: "PixelartIcons",
          data: pixelIconFont,
          style: "normal",
          weight: 400,
        },
      ],
    },
  );
}
