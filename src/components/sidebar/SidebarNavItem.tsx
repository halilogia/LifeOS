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
  onClick: () => void;
  onDragStart: (e: any) => void;
  onDragEnd: () => void;
  onDragOver: (e: any) => void;
  onDrop: (e: any) => void;
}

export function SidebarNavItem({
  itemKey,
  label,
  active,
  isDragging,
  onClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: SidebarNavItemProps) {
  const itemClass = `sidebar-btn ${active ? "active" : ""} ${isDragging ? "dragging" : ""}`;

  return (
    <button
      id={`view-${itemKey}-btn`}
      className={itemClass}
      onClick={onClick}
      draggable={true}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <SidebarIcon itemKey={itemKey} />
      <span>{label}</span>
    </button>
  );
}
