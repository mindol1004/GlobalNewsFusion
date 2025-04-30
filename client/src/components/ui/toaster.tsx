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
      // 토스트 외부 클릭 시 모든 토스트 닫기 - 즉시 처리
      const toastElements = document.querySelectorAll('[role="status"]');
      let shouldDismiss = true;
      
      // 클릭한 요소가 토스트 안에 있는지 확인
      toastElements.forEach(element => {
        if (element.contains(event.target as Node)) {
          shouldDismiss = false;
        }
      });
      
      // 토스트 외부 클릭 시 모든 토스트 닫기
      if (shouldDismiss && toastElements.length > 0) {
        document.querySelectorAll('[data-radix-toast-close]').forEach((closeBtn) => {
          (closeBtn as HTMLElement).click();
        });
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
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
