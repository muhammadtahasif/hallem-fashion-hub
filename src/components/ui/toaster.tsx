
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
        return <XCircle className="h-4 w-4 text-red-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast 
            key={id} 
            {...props} 
            className="fixed top-4 right-4 z-[100] bg-white border border-gray-200 shadow-lg max-w-[400px] rounded-md p-4 animate-slide-in-right"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(variant)}
              </div>
              <div className="grid gap-1 flex-1">
                {title && (
                  <ToastTitle className="text-gray-900 font-medium text-sm leading-tight">
                    {title}
                  </ToastTitle>
                )}
                {description && (
                  <ToastDescription className="text-gray-600 text-sm leading-relaxed">
                    {description}
                  </ToastDescription>
                )}
              </div>
              <div className="flex items-center gap-1">
                {action}
                <ToastClose className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100" />
              </div>
            </div>
          </Toast>
        )
      })}
      <ToastViewport className="fixed top-0 right-0 flex flex-col-reverse p-4 gap-3 w-full md:max-w-[420px] list-none z-[100] outline-none" />
    </ToastProvider>
  )
}
