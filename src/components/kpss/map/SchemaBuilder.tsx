/**
 * SchemaBuilder.tsx
 * KPSS Şema Oluşturucu — archives/kpss-sema-olusturucu-v2.html mantığı (birebir).
 * Tire-tabanlı outline → klasik hiyerarşik ağaç diyagramı:
 *  - kök üstte ortalanır, dallar aşağıya doğru yanlara yayılır (tree layout)
 *  - kutu genişliği canvas ile gerçek metin genişliğinden ölçülür → taşma olmaz
 *  - parent→child arası yumuşak (bezier) eğri çizgiler aynı koordinatlardan türer
 * Hem tarih haritası (Devlet Teşkilatı) hem not editöründe kullanılır.
 */
import type { JSX } from "preact";
import { useMemo, useState, useRef } from "preact/hooks";

/* ---------- Veri modeli ---------- */

interface OutlineNode {
  text: string;
  children: OutlineNode[];
  level: number;
  depth: number;
  w: number;
  x: number;
  y: number;
}

const BOX_MIN_W = 120;
const BOX_MAX_W = 210;
const BOX_H = 48;
const ROW_GAP = 110; // satırlar arası dikey mesafe
const SIB_GAP = 34; // kardeş kutular arası yatay boşluk
const LINE_COLOR = "#a5905f";
const BOX_BORDER = "#7a2323";

/* ---------- Outline ayrıştırma (archives ile birebir) ---------- */

function parseOutline(text: string): OutlineNode[] {
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  const root: OutlineNode = {
    text: "ROOT",
    children: [],
    level: -1,
    depth: 0,
    w: 0,
    x: 0,
    y: 0,
  };
  const stack = [root];
  lines.forEach((raw) => {
    // seviye: satır başındaki "-" (tire) sayısı. Tab/boşluk da yedek olarak desteklenir.
    const dashMatch = raw.match(/^-*/)?.[0] || "";
    let level: number;
    let content: string;
    if (dashMatch.length > 0) {
      level = dashMatch.length;
      content = raw.slice(dashMatch.length).trim();
    } else {
      const indentMatch = raw.match(/^(\t| )*/)?.[0] || "";
      const tabs = (indentMatch.match(/\t/g) || []).length;
      const spaces = (indentMatch.match(/ /g) || []).length;
      level = tabs + Math.floor(spaces / 2);
      content = raw.trim();
    }
    if (!content) {
      return;
    }
    const node: OutlineNode = {
      text: content,
      children: [],
      level,
      depth: 0,
      w: 0,
      x: 0,
      y: 0,
    };
    while (stack.length > 1 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }
    stack[stack.length - 1].children.push(node);
    stack.push(node);
  });
  return root.children;
}

/* ---------- Genişlik ölçümü (canvas — taşmayı önler) ---------- */

let measureCtx: CanvasRenderingContext2D | null = null;

function measureWidth(text: string): number {
  if (!measureCtx && typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    measureCtx = canvas.getContext("2d");
  }
  if (measureCtx) {
    measureCtx.font = "700 13px 'Segoe UI', Arial, sans-serif";
    const w = measureCtx.measureText(text).width;
    return Math.min(BOX_MAX_W, Math.max(BOX_MIN_W, w + 40));
  }
  // canvas yoksa tahmini genişlik (fallback)
  const w = text.length * 8.1;
  return Math.min(BOX_MAX_W, Math.max(BOX_MIN_W, w + 40));
}

/* ---------- Yerleşim (archives ile birebir) ---------- */

function prepare(nodes: OutlineNode[], depth: number): void {
  nodes.forEach((n) => {
    n.w = measureWidth(n.text);
    n.depth = depth;
    if (n.children.length) {
      prepare(n.children, depth + 1);
    }
  });
}

function assignX(
  nodes: OutlineNode[],
  cursor: { val: number },
): { val: number } {
  nodes.forEach((n) => {
    if (n.children.length) {
      cursor = assignX(n.children, cursor);
      const first = n.children[0];
      const last = n.children[n.children.length - 1];
      n.x = (first.x + last.x) / 2;
    } else {
      n.x = cursor.val + n.w / 2;
      cursor.val += n.w + SIB_GAP;
    }
  });
  return cursor;
}

function collect(nodes: OutlineNode[], out: OutlineNode[]): OutlineNode[] {
  nodes.forEach((n) => {
    out.push(n);
    if (n.children.length) {
      collect(n.children, out);
    }
  });
  return out;
}

function computeLayout(text: string): {
  all: OutlineNode[];
  totalWidth: number;
  totalHeight: number;
} {
  const forest = parseOutline(text);
  if (forest.length === 0) {
    return { all: [], totalWidth: 0, totalHeight: 0 };
  }
  prepare(forest, 0);
  const cursor = { val: 0 };
  assignX(forest, cursor);
  const totalWidth = cursor.val - SIB_GAP;

  let maxDepth = 0;
  const all = collect(forest, []);
  all.forEach((n) => {
    n.y = n.depth * ROW_GAP;
    if (n.depth > maxDepth) {
      maxDepth = n.depth;
    }
  });
  const totalHeight = maxDepth * ROW_GAP + BOX_H + 20;
  return { all, totalWidth, totalHeight };
}

/* ---------- Bileşen ---------- */

const DEFAULT_OUTLINE = `SULTAN
-MELİK
--IKTA SİSTEMİ
-ATABEY
-DİVAN-I SALTANAT
--TUĞRACI
--PERVANE
---EMİR-İ DAD
--MÜSTEVFİ`;

const BOX_STYLE: JSX.CSSProperties = {
  position: "absolute",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  padding: "10px 14px",
  borderRadius: 10,
  fontSize: 13,
  fontWeight: 700,
  color: "#2b2320",
  background: "linear-gradient(180deg,#fbf4e4,#f4e8d0)",
  border: `2px solid ${BOX_BORDER}`,
  boxShadow: "0 3px 5px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.6)",
  lineHeight: 1.3,
  boxSizing: "border-box",
  zIndex: 1,
  wordBreak: "break-word",
  whiteSpace: "normal",
  userSelect: "none",
  WebkitUserSelect: "none",
};

const SCHEMA_ANIM_CSS = `
@keyframes schemaBoxIn {
  from { opacity: 0; transform: scale(0.55); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes schemaLinkIn {
  from { opacity: 0; stroke-dashoffset: 120; }
  to   { opacity: 1; stroke-dashoffset: 0; }
}
`;

interface SchemaBuilderProps {
  /** Tire-tabanlı hiyerarşik metin (isteğe bağlı; varsayılan örnek) */
  outline?: string;
  /** Şema başlığı */
  title?: string;
  /** Editör modunda: kullanıcı metni düzenleyebilsin mi? */
  editable?: boolean;
  onChange?: (text: string) => void;
  /** Kutu sayısıyla sınırlı animasyonlu belirme (opsiyonel) */
  revealedCount?: number;
}

export function SchemaBuilder({
  outline,
  title = "ŞEMA",
  editable = false,
  onChange,
  revealedCount,
}: SchemaBuilderProps) {
  const [internalText, setInternalText] = useState<string>(
    outline ?? DEFAULT_OUTLINE,
  );
  const text = outline ?? internalText;

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number }>({
    x: 0,
    y: 0,
    panX: 0,
    panY: 0,
  });

  const onPointerDown = (e: PointerEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!isDragging) {
      return;
    }
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({ x: dragStartRef.current.panX + dx, y: dragStartRef.current.panY + dy });
  };

  const onPointerUp = () => {
    setIsDragging(false);
  };

  const { all, totalWidth, totalHeight } = useMemo(
    () => computeLayout(text),
    [text],
  );

  const handleEditorChange = (value: string) => {
    setInternalText(value);
    onChange?.(value);
  };

  // Animasyon: yalnızca ilk N kutu + iki ucu da görünen çizgiler
  const visibleSet =
    revealedCount !== undefined ? new Set(all.slice(0, revealedCount)) : null;
  // "Pat diye" değil, yumuşakça belirmesi için son eklenen öğeyi işaretle
  const lastIndex = revealedCount !== undefined ? revealedCount - 1 : -1;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        flex: 1,
        minWidth: 0,
        maxWidth: "100%",
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      <style>{SCHEMA_ANIM_CSS}</style>

      {editable && (
        <textarea
          value={text}
          onInput={(e) =>
            handleEditorChange((e.target as HTMLTextAreaElement).value)
          }
          placeholder={
            'Her satır bir kutu. Alt dal için satır başına "-" koy (ne kadar çok tire, o kadar derin).'
          }
          style={{
            width: "100%",
            maxWidth: "100%",
            minHeight: 140,
            fontFamily: "'Consolas','Courier New',monospace",
            fontSize: 13,
            padding: 10,
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 8,
            background: "rgba(0,0,0,0.4)",
            color: "#e2e8f0",
            resize: "vertical",
            whiteSpace: "pre",
            lineHeight: 1.5,
            boxSizing: "border-box",
          }}
        />
      )}

      {/* Şema tuvali — genişliği her zaman tam; sürükle-bırak pan destekli */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          position: "relative",
          flex: 1,
          minHeight: 320,
          minWidth: 0,
          width: "100%",
          maxWidth: "100%",
          overflow: "hidden",
          background: "#f2e6cc",
          borderRadius: 12,
          padding: "30px 20px 50px 20px",
          boxSizing: "border-box",
          cursor: isDragging ? "grabbing" : "grab",
          touchAction: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        {/* Başlık — boşsa gizli */}
        {title.trim() ? (
          <div
            style={{
              background: "#7a1414",
              color: "#fff",
              textAlign: "center",
              fontWeight: "bold",
              fontSize: 15,
              padding: "10px 24px",
              borderRadius: 5,
              margin: "0 auto 35px auto",
              width: "fit-content",
              minWidth: 280,
              letterSpacing: 0.5,
              boxShadow: "0 2px 4px rgba(0,0,0,.2)",
              userSelect: "none",
              WebkitUserSelect: "none",
            }}
          >
            {title}
          </div>
        ) : null}

        {/* Şema alanı — fare ile sürükleyerek kaydırma destekli */}
        <div
          style={{
            position: "relative",
            margin: "0 auto",
            width: "100%",
            height: all.length === 0 ? 200 : Math.max(totalHeight, 1),
            transform: `translate(${pan.x}px, ${pan.y}px)`,
            transition: isDragging ? "none" : "transform 0.05s ease-out",
          }}
        >
          {/* Boş şema durumu */}
          {all.length === 0 && (
            <div
              style={{
                position: "absolute",
                top: 40,
                left: 0,
                width: "100%",
                textAlign: "center",
                color: "#6b6252",
                fontSize: 13,
                fontStyle: "italic",
              }}
            >
              Şema oluşturmak için yukarıya hiyerarşik metin yazın
              <br />
              (satır başına "-" koyarak alt dal ekleyin)
            </div>
          )}

          {/* Merkez konteyner — şemanın gerçek genişliği; tuvalde ortalanır */}
          <div
            style={{
              position: "relative",
              margin: "0 auto",
              width: Math.max(totalWidth, 1),
              height: Math.max(totalHeight, 1),
            }}
          >
            {/* Eğri bağlantı çizgileri */}
            <svg
              width={totalWidth}
              height={totalHeight}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                overflow: "visible",
                pointerEvents: "none",
              }}
            >
              {all.map((n, idx) =>
                n.children.map((c) => {
                  const show =
                    !visibleSet || (visibleSet.has(n) && visibleSet.has(c));
                  if (!show) {
                    return null;
                  }
                  const x1 = n.x;
                  const y1 = n.y + BOX_H;
                  const x2 = c.x;
                  const y2 = c.y;
                  const midY = (y1 + y2) / 2;
                  // Child yeni eklenen öğeyse çizgi "çizilme" animasyonu alır
                  const cIdx = all.indexOf(c);
                  const isNew = cIdx === lastIndex;
                  return (
                    <path
                      key={`link-${idx}-${c.text}`}
                      d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                      fill="none"
                      stroke={LINE_COLOR}
                      strokeWidth={2.2}
                      strokeDasharray={isNew ? 120 : undefined}
                      strokeDashoffset={isNew ? 120 : undefined}
                      style={
                        isNew
                          ? {
                              animation: "schemaLinkIn 0.5s ease-out forwards",
                              opacity: 0,
                            }
                          : undefined
                      }
                    />
                  );
                }),
              )}
            </svg>

            {/* Kutular */}
            {all.map((n, nIdx) => {
              if (visibleSet && !visibleSet.has(n)) {
                return null;
              }
              const isNew = nIdx === lastIndex;
              return (
                <div
                  key={n.text}
                  style={{
                    ...BOX_STYLE,
                    left: n.x - n.w / 2,
                    top: n.y,
                    width: n.w,
                    height: BOX_H,
                    ...(isNew
                      ? {
                          transformOrigin: "center",
                          animation: "schemaBoxIn 0.45s ease-out forwards",
                          opacity: 0,
                        }
                      : {}),
                  }}
                >
                  {n.text}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sayaç */}
        {revealedCount !== undefined && (
          <div
            style={{
              marginTop: 14,
              fontSize: 11.5,
              color: "#6b6252",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {Math.min(revealedCount, all.length)} / {all.length}
          </div>
        )}
      </div>
    </div>
  );
}
