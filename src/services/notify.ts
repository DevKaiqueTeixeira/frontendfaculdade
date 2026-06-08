import { toast } from "sonner";

export const notify = {
  success(message: string) {
    toast.success(message);
  },

  error(message: string) {
    toast.error(message);
  },

  info(message: string) {
    toast.info(message);
  },

  confirm(message: string, onConfirm: () => void, cancelLabel = "Cancelar", confirmLabel = "Excluir") {
    toast.warning(message, {
      action: {
        label: confirmLabel,
        onClick: onConfirm,
      },
      cancel: {
        label: cancelLabel,
        onClick: () => {},
      },
      duration: 8000,
    });
  },
};
