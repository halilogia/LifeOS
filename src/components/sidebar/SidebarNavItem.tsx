/**
 * SidebarNavItem.tsx
 * Sürükle-bırak destekli, aktif durumlu navigasyon butonu bileşeni.
 */

import { SidebarIcon } from "./SidebarIcons.js";

interface SidebarNavItemProps {
  itemKey: string;
  label: string;
  active: boolean;
  isDragging: boolean;
  isDragOver?: boolean;
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
  onClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}: SidebarNavItemProps) {
  const itemClass = `sidebar-btn ${active ? "active" : ""} ${isDragging ? "dragging" : ""} ${isDragOver ? "drag-over" : ""}`;

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
    </button>
  );
}
