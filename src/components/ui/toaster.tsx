
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
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast 
            key={id} 
            {...props} 
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100] bg-white border border-gray-200 shadow-2xl min-w-[400px] max-w-[500px] rounded-xl animate-scale-in"
          >
            <div className="flex items-start gap-4 p-6">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(variant)}
              </div>
              <div className="grid gap-2 flex-1">
                {title && (
                  <ToastTitle className="text-gray-900 font-semibold text-base leading-tight">
                    {title}
                  </ToastTitle>
                )}
                {description && (
                  <ToastDescription className="text-gray-600 text-sm leading-relaxed">
                    {description}
                  </ToastDescription>
                )}
              </div>
              {action}
              <ToastClose className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100" />
            </div>
          </Toast>
        )
      })}
      <ToastViewport className="fixed top-0 left-0 w-full h-full pointer-events-none flex items-center justify-center z-[100] p-4" />
    </ToastProvider>
  )
}
