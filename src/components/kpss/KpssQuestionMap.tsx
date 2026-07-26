interface MapMarker {
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  label: string; // e.g. "I", "II", "III"
}

interface MapConfig {
  highlightRegions?: string[]; // e.g. ["marmara", "karadeniz"]
  markers?: MapMarker[];
}

interface KpssQuestionMapProps {
  map: MapConfig;
}

export function KpssQuestionMap({ map }: KpssQuestionMapProps) {
  const highlightRegions = map.highlightRegions || [];
  const markers = map.markers || [];

  const isHighlighted = (regionName: string) =>
    highlightRegions.includes(regionName);

  return (
    <div
      className="kpss-map-container"
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "460px",
        margin: "0 auto 16px",
      }}
    >
      {/* SVG Stylized Turkey Outline with 7 Regions */}
      <svg
        viewBox="0 0 400 180"
        width="100%"
        height="auto"
        style={{
          display: "block",
          background: "rgba(0, 0, 0, 0.2)",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "10px",
        }}
      >
        <g
          stroke="rgba(255,255,255,0.15)"
          stroke-width="1.5"
          fill="rgba(255,255,255,0.03)"
        >
          {/* 1. Marmara */}
          <polygon
            points="10,20 100,20 120,45 105,80 50,85 10,55"
            className={`kpss-map-region ${isHighlighted("marmara") ? "highlighted" : ""}`}
            style={{ transition: "all 0.3s ease", cursor: "default" }}
          />
          {/* 2. Ege */}
          <polygon
            points="10,55 50,85 105,80 115,145 10,145"
            className={`kpss-map-region ${isHighlighted("ege") ? "highlighted" : ""}`}
            style={{ transition: "all 0.3s ease", cursor: "default" }}
          />
          {/* 3. Akdeniz */}
          <polygon
            points="115,145 105,80 135,90 220,100 240,150 170,150"
            className={`kpss-map-region ${isHighlighted("akdeniz") ? "highlighted" : ""}`}
            style={{ transition: "all 0.3s ease", cursor: "default" }}
          />
          {/* 4. Karadeniz */}
          <polygon
            points="120,45 220,45 220,70 320,70 320,35 385,35 385,80 300,80 200,75 120,60"
            className={`kpss-map-region ${isHighlighted("karadeniz") ? "highlighted" : ""}`}
            style={{ transition: "all 0.3s ease", cursor: "default" }}
          />
          {/* 5. İç Anadolu */}
          <polygon
            points="120,45 120,60 200,75 220,100 135,90 105,80"
            className={`kpss-map-region ${isHighlighted("ic_anadolu") ? "highlighted" : ""}`}
            style={{ transition: "all 0.3s ease", cursor: "default" }}
          />
          {/* 6. Doğu Anadolu */}
          <polygon
            points="220,100 300,80 385,80 385,130 290,130 240,150"
            className={`kpss-map-region ${isHighlighted("dogu_anadolu") ? "highlighted" : ""}`}
            style={{ transition: "all 0.3s ease", cursor: "default" }}
          />
          {/* 7. Güneydoğu Anadolu */}
          <polygon
            points="240,150 290,130 385,130 385,160 240,160"
            className={`kpss-map-region ${isHighlighted("guneydogu_anadolu") ? "highlighted" : ""}`}
            style={{ transition: "all 0.3s ease", cursor: "default" }}
          />
        </g>

        {/* Region Labels */}
        <g
          fill="rgba(255, 255, 255, 0.45)"
          font-size="7"
          font-weight="bold"
          font-family="sans-serif"
          text-anchor="middle"
        >
          <text x="50" y="45">
            MARMARA
          </text>
          <text x="50" y="115">
            EGE
          </text>
          <text x="160" y="130">
            AKDENİZ
          </text>
          <text x="165" y="70">
            İÇ ANADOLU
          </text>
          <text x="260" y="52">
            KARADENİZ
          </text>
          <text x="310" y="110">
            DOĞU
          </text>
          <text x="310" y="120">
            ANADOLU
          </text>
          <text x="300" y="150">
            GÜNEYDOĞU ANADOLU
          </text>
        </g>
      </svg>

      {/* Render absolute pins over the SVG container */}
      {markers.map((marker, idx) => (
        <div
          key={idx}
          className="kpss-map-pin"
          style={{
            position: "absolute",
            left: `${marker.x}%`,
            top: `${marker.y}%`,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        >
          {marker.label}
        </div>
      ))}
    </div>
  );
}
