import Link from "next/link";

type LegalBlock =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

function Block({ block }: { block: LegalBlock }) {
  if (block.type === "h2") {
    return (
      <h2
        style={{
          font: "700 20px/1.3 'Golos Text'",
          letterSpacing: "-.01em",
          color: "#1A1C1E",
          margin: "36px 0 12px",
        }}>
        {block.text}
      </h2>
    );
  }
  if (block.type === "ul") {
    return (
      <ul style={{ margin: "0 0 14px", paddingLeft: 22 }}>
        {block.items.map((item) => (
          <li key={item} style={{ font: "400 15px/1.65 'Golos Text'", color: "#4A5560", marginBottom: 6 }}>
            {item}
          </li>
        ))}
      </ul>
    );
  }
  return (
    <p style={{ font: "400 15px/1.65 'Golos Text'", color: "#4A5560", margin: "0 0 14px" }}>{block.text}</p>
  );
}

function LegalDocument({
  title,
  effectiveDate,
  intro,
  blocks,
  requisites,
}: {
  title: string;
  effectiveDate: string;
  intro?: string;
  blocks: LegalBlock[];
  requisites: string[];
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1200px 600px at 15% -10%, rgba(102,166,255,.12), transparent), radial-gradient(1000px 500px at 100% 0%, rgba(79,214,160,.10), transparent), #F4F6F8",
      }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "clamp(24px,4vw,56px) clamp(20px,5vw,40px)" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            font: "600 14px 'Golos Text'",
            color: "#5094F0",
            textDecoration: "none",
            marginBottom: 28,
          }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Slotix
        </Link>

        <div
          style={{
            background: "rgba(255,255,255,.85)",
            backdropFilter: "blur(24px) saturate(1.3)",
            WebkitBackdropFilter: "blur(24px) saturate(1.3)",
            border: "1px solid rgba(255,255,255,.7)",
            borderRadius: 24,
            boxShadow: "0 20px 50px rgba(20,40,70,.08)",
            padding: "clamp(28px,5vw,52px)",
          }}>
          <h1
            style={{
              font: "800 clamp(24px,3vw,34px)/1.2 'Golos Text'",
              letterSpacing: "-.02em",
              color: "#1A1C1E",
              margin: "0 0 8px",
            }}>
            {title}
          </h1>
          <div style={{ font: "500 14px 'Golos Text'", color: "#8E97A4", marginBottom: 28 }}>
            Редакция от {effectiveDate}
          </div>

          {intro && (
            <p style={{ font: "400 15px/1.65 'Golos Text'", color: "#4A5560", margin: "0 0 14px" }}>
              {intro}
            </p>
          )}

          {blocks.map((block, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static legal-document content, blocks never reorder
            <Block key={i} block={block} />
          ))}

          <div
            style={{
              marginTop: 36,
              paddingTop: 24,
              borderTop: "1px solid rgba(140,150,165,.18)",
              font: "400 13.5px/1.7 'Golos Text'",
              color: "#8E97A4",
            }}>
            {requisites.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export type { LegalBlock };
export default LegalDocument;
