/**
 * KpssTopicDetailModal.tsx
 * KPSS Konu detay özet pop-up modali.
 */

interface KpssTopicDetailModalProps {
  topic: {
    title: string;
    description: string;
  };
  detailsTitle: string;
  onClose: () => void;
}

function IconX() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function KpssTopicDetailModal({
  topic,
  detailsTitle,
  onClose,
}: KpssTopicDetailModalProps) {
  return (
    <div className="kpss-modal-overlay" onClick={onClose}>
      <div className="kpss-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="kpss-modal-header">
          <h3>
            {detailsTitle}: {topic.title}
          </h3>
          <button className="kpss-close-btn" onClick={onClose}>
            <IconX />
          </button>
        </div>
        <div className="kpss-modal-body">
          <p>{topic.description}</p>
        </div>
      </div>
    </div>
  );
}
