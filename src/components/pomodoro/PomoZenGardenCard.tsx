import { PomodoroLog } from "@/types/types.js";

interface PomoZenGardenCardProps {
  gridCells: any[];
  showPlantModal: boolean;
  focusNote: string;
  selectedElement: PomodoroLog["element"];
  t: any;
  onSetFocusNote: (val: string) => void;
  onSetSelectedElement: (el: PomodoroLog["element"]) => void;
  onPlantElement: () => void;
  renderZenElementSvg: (element: PomodoroLog["element"]) => any;
}

export function PomoZenGardenCard({
  gridCells,
  showPlantModal,
  focusNote,
  selectedElement,
  t,
  onSetFocusNote,
  onSetSelectedElement,
  onPlantElement,
  renderZenElementSvg,
}: PomoZenGardenCardProps) {
  return (
    <>
      {/* Zen Garden Sandbox Card */}
      <div className="zen-sandbox-card">
        <header className="zen-sandbox-header">
          <h3>{t.zen_garden_title}</h3>
          <p>{t.zen_garden_subtitle}</p>
        </header>
        <div className="zen-sandbox-canvas">
          {gridCells}
        </div>
      </div>

      {/* Zen Log Plant Modal Overlay */}
      {showPlantModal && (
        <div className="zen-plant-modal-overlay">
          <div className="zen-plant-modal">
            <h3>{t.zen_modal_title}</h3>
            
            <div className="zen-plant-modal-field">
              <label>{t.zen_modal_question}</label>
              <input
                type="text"
                className="zen-plant-input"
                placeholder={t.zen_modal_placeholder}
                value={focusNote}
                onInput={(e) => onSetFocusNote((e.target as HTMLInputElement).value)}
                autofocus
              />
            </div>

            <div className="zen-plant-modal-field">
              <label>{t.zen_modal_select}</label>
              <div className="zen-element-grid">
                {(["bonsai", "koi", "pagoda", "lantern", "bamboo", "pebble"] as const).map((el) => (
                  <div
                    key={el}
                    className={`zen-element-select-card ${selectedElement === el ? "selected" : ""}`}
                    onClick={() => onSetSelectedElement(el)}
                  >
                    <div style={{ width: "32px", height: "32px" }}>
                      {renderZenElementSvg(el)}
                    </div>
                    <span>{t[`zen_elem_${el}` as keyof typeof t] || el}</span>
                  </div>
                ))}
              </div>
            </div>

            <button className="zen-plant-submit-btn" onClick={onPlantElement}>
              {t.zen_modal_plant}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
