import { useState } from "preact/hooks";
import { Note } from "@/types/types.js";
import { extractInternalLinks } from "@/services/zettelkastenEngine.js";
import { getTranslation } from "@/utils/i18n.js";
import type { Language } from "@/types/types.js";
import { NoteEditorHeader } from "./NoteEditorHeader.js";
import { NoteEditorBody } from "./NoteEditorBody.js";
import { WikiAutocomplete } from "./WikiAutocomplete.js";
import { NoteBacklinksPanel } from "./NoteBacklinksPanel.js";

export type NoteType = "note" | "diary" | "cornell";

interface NoteEditorModalProps {
  isOpen: boolean;
  lang: Language;
  noteType: NoteType;
  noteTitle: string;
  noteContent: string;
  noteCues: string;
  noteSummary: string;
  notesPlaceholder: string;
  notesContentPlaceholder: string;
  availableNotes?: Note[];
  onClose: () => void;
  onNoteTypeChange: (type: NoteType) => void;
  onNoteTitleChange: (val: string) => void;
  onNoteContentChange: (val: string) => void;
  onNoteCuesChange: (val: string) => void;
  onNoteSummaryChange: (val: string) => void;
  onSave: () => void;
}

export function NoteEditorModal({
  isOpen,
  lang,
  noteType,
  noteTitle,
  noteContent,
  noteCues,
  noteSummary,
  notesPlaceholder,
  notesContentPlaceholder,
  availableNotes,
  onClose,
  onNoteTypeChange,
  onNoteTitleChange,
  onNoteContentChange,
  onNoteCuesChange,
  onNoteSummaryChange,
  onSave,
}: NoteEditorModalProps) {
  const [showLinkSuggestions, setShowLinkSuggestions] = useState(false);
  const [linkQuery, setLinkQuery] = useState("");

  const t = getTranslation(lang);
  if (!isOpen) {
    return null;
  }

  const backlinks =
    availableNotes && noteTitle.trim()
      ? availableNotes.filter((n) => {
          if (n.title.toLowerCase().trim() === noteTitle.toLowerCase().trim()) {
            return false;
          }
          const links = extractInternalLinks(n.content || "");
          return links.some(
            (l) => l.toLowerCase().trim() === noteTitle.toLowerCase().trim(),
          );
        })
      : [];

  const filteredSuggestions = availableNotes
    ? availableNotes.filter((n) =>
        n.title.toLowerCase().includes(linkQuery.toLowerCase().trim()),
      )
    : [];

  const handleContentInput = (val: string) => {
    onNoteContentChange(val);
    const lastDoubleBracket = val.lastIndexOf("[[");
    if (
      lastDoubleBracket !== -1 &&
      val.indexOf("]]", lastDoubleBracket) === -1
    ) {
      const q = val.slice(lastDoubleBracket + 2);
      setLinkQuery(q);
      setShowLinkSuggestions(true);
    } else {
      setShowLinkSuggestions(false);
    }
  };

  const insertLink = (title: string) => {
    const lastDoubleBracket = noteContent.lastIndexOf("[[");
    if (lastDoubleBracket !== -1) {
      const newContent =
        noteContent.slice(0, lastDoubleBracket) + `[[${title}]] `;
      onNoteContentChange(newContent);
    }
    setShowLinkSuggestions(false);
  };

  return (
    <div className="settings-panel active" onClick={onClose}>
      <div
        className="settings-content note-modal-content"
        style={{ maxWidth: noteType === "cornell" ? "800px" : "600px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <NoteEditorHeader
          t={t}
          noteType={noteType}
          noteTitle={noteTitle}
          notesPlaceholder={notesPlaceholder}
          onTypeChange={onNoteTypeChange}
          onTitleChange={onNoteTitleChange}
          onClose={onClose}
        />

        <div
          className="note-editor-body"
          style={{ padding: "0 10px", position: "relative" }}
        >
          <NoteEditorBody
            t={t}
            noteType={noteType}
            noteContent={noteContent}
            noteCues={noteCues}
            noteSummary={noteSummary}
            notesContentPlaceholder={notesContentPlaceholder}
            onContentInput={handleContentInput}
            onCuesChange={onNoteCuesChange}
            onSummaryChange={onNoteSummaryChange}
          />

          {/* Autocomplete Popup when typing [[ */}
          {showLinkSuggestions && filteredSuggestions.length > 0 && (
            <WikiAutocomplete
              suggestions={filteredSuggestions}
              onSelect={insertLink}
            />
          )}

          {/* Backlinks Panel */}
          {backlinks.length > 0 && <NoteBacklinksPanel backlinks={backlinks} />}
        </div>

        <div className="settings-footer">
          <button
            id="save-note-btn"
            className="settings-add-btn"
            style={{ width: "auto", padding: "0 20px" }}
            onClick={onSave}
          >
            {t.notes_editor_save}
          </button>
        </div>
      </div>
    </div>
  );
}
