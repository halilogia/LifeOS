/**
 * SidebarNavItem.tsx
 * Sürükle-bırak destekli, aktif durumlu navigasyon butonu bileşeni.
 * Pin ikonu: hover'da görünür; pinli öğelerde kalıcı mor.
 */

import { SidebarIcon } from "./SidebarIcons.js";

interface SidebarNavItemProps {
  itemKey: string;
  label: string;
  active: boolean;
  isDragging: boolean;
  isDragOver?: boolean;
  isPinned?: boolean;
  onPinToggle?: () => void;
  onHideToggle?: () => void;
  hideTitle?: string;
  pinTitle?: string;
  onClick: () => void;
  onDragStart: (e: DragEvent) => void;
  onDragEnd: () => void;
  onDragOver: (e: DragEvent) => void;
  onDragLeave?: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
}

export function SidebarNavItem({
  itemKey,
  label,
  active,
  isDragging,
  isDragOver = false,
  isPinned = false,
  onPinToggle,
  onHideToggle,
  hideTitle,
  pinTitle,
  onClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}: SidebarNavItemProps) {
  const itemClass = `sidebar-btn ${active ? "active" : ""} ${isDragging ? "dragging" : ""} ${isDragOver ? "drag-over" : ""} ${isPinned ? "pinned" : ""}`;

  const handleHideClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onHideToggle?.();
  };

  const handlePinClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onPinToggle?.();
  };

  return (
    <button
      id={`view-${itemKey}-btn`}
      className={itemClass}
      onClick={onClick}
      draggable={true}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <SidebarIcon itemKey={itemKey} />
      <span>{label}</span>
      <div className="sidebar-item-controls">
        <span
          className="sidebar-action-icon sidebar-hide-btn"
          title={hideTitle || "Hide"}
          onClick={handleHideClick}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </span>
        <span
          className={`sidebar-action-icon sidebar-pin ${isPinned ? "visible pinned-icon" : ""}`}
          title={pinTitle || "Pin"}
          onClick={handlePinClick}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={isPinned ? "currentColor" : "none"}
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="12" y1="17" x2="12" y2="22" />
            <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
          </svg>
        </span>
      </div>
    </button>
  );
}
