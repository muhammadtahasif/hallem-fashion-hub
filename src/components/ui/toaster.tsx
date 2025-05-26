
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  const getIcon = (variant?: string) => {
    switch (variant) {
      case "destructive":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} {...props} className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white border shadow-lg min-w-[350px] animate-fade-in">
            <div className="flex items-start gap-3 p-4">
              {getIcon(variant)}
              <div className="grid gap-1 flex-1">
                {title && <ToastTitle className="text-gray-900 font-semibold">{title}</ToastTitle>}
                {description && (
                  <ToastDescription className="text-gray-600">{description}</ToastDescription>
                )}
              </div>
              {action}
              <ToastClose className="text-gray-400 hover:text-gray-600" />
            </div>
          </Toast>
        )
      })}
      <ToastViewport className="fixed top-0 left-0 w-full h-full pointer-events-none flex items-center justify-center z-[100]" />
    </ToastProvider>
  )
}
