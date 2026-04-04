import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? "SoundScene";
  const artist = searchParams.get("artist") ?? "Featured artist";
  const movie = searchParams.get("movie") ?? "SoundScene";
  const timestamp = searchParams.get("timestamp") ?? "00:00";
  const scene = searchParams.get("scene") ?? "Mapped soundtrack moment";
  const year = searchParams.get("year");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #fff8f1 0%, #f5ece4 100%)",
          color: "#141210",
          padding: "52px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            border: "3px solid rgba(196,94,42,0.18)",
            borderRadius: "32px",
            padding: "42px",
            background: "rgba(255,255,255,0.72)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{
                display: "flex",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                fontSize: 22,
                color: "#C45E2A",
              }}
            >
              {movie}
              {year ? ` (${year})` : ""}
            </div>
            <div style={{ display: "flex", fontSize: 60, fontWeight: 800, lineHeight: 1 }}>
              {title}
            </div>
            <div style={{ display: "flex", fontSize: 34, color: "#4F4842" }}>{artist}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div
              style={{
                display: "flex",
                fontSize: 24,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: "#C45E2A",
              }}
            >
              {timestamp}
            </div>
            <div style={{ display: "flex", fontSize: 28, lineHeight: 1.35, color: "#24201c" }}>
              "{scene}"
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 22,
              color: "#6F655C",
            }}
          >
            <div style={{ display: "flex" }}>soundscene</div>
            <div
              style={{
                display: "flex",
                color: "#C45E2A",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
              }}
            >
              Share Card
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
