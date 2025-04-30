import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  // useEffect to automatically dismiss toasts after a delay
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 토스트 외부 클릭 시 모든 토스트 닫기
      const toastElement = document.querySelector('[role="status"]');
      if (toastElement && !toastElement.contains(event.target as Node)) {
        document.querySelectorAll('[data-radix-toast-close]').forEach((closeBtn) => {
          (closeBtn as HTMLElement).click();
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
