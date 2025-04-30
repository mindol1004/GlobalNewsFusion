import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"

export function Toaster() {
  const { toasts } = useToast()

  // 외부 클릭 처리를 위한 이벤트 리스너
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 모든 토스트 요소 찾기
      const toastElements = document.querySelectorAll('[role="status"]');
      let clickedInside = false;
      
      // 클릭이 토스트 안에서 발생했는지 확인
      toastElements.forEach(element => {
        if (element.contains(event.target as Node)) {
          clickedInside = true;
        }
      });
      
      // 토스트 외부 클릭 시 모든 토스트 닫기
      if (!clickedInside && toastElements.length > 0) {
        // 모든 토스트의 닫기 버튼 찾아서 클릭
        document.querySelectorAll('[toast-close]').forEach(closeBtn => {
          (closeBtn as HTMLElement).click();
        });
      }
    };

    // 문서 전체에 클릭 이벤트 리스너 추가
    document.addEventListener('click', handleClickOutside);
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
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