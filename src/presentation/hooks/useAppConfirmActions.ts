/**
 * useAppConfirmActions Hook
 * Manages confirmation dialog actions for destructive operations.
 * Extracted from App.tsx to reduce monolith size.
 */

import { useCallback } from "preact/hooks";

interface UseAppConfirmActionsProps {
  showConfirm: (message: string, onConfirm: () => void) => void;
}

export function useAppConfirmActions({ showConfirm }: UseAppConfirmActionsProps) {
  const handleClearAllDataConfirm = useCallback(
    (onConfirm: () => void) => {
      showConfirm(
        "Tüm veriler kalıcı olarak silinecek. Emin misiniz?",
        onConfirm
      );
    },
    [showConfirm]
  );

  const handleResetKpssDataConfirm = useCallback(
    (onConfirm: () => void) => {
      showConfirm(
        "KPSS verileri sıfırlanacak. Bu işlem geri alınamaz. Emin misiniz?",
        onConfirm
      );
    },
    [showConfirm]
  );

  return {
    handleClearAllDataConfirm,
    handleResetKpssDataConfirm,
  };
}