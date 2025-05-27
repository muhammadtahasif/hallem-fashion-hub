
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
            className="fixed top-4 right-4 z-[100] bg-white border border-gray-200 shadow-xl min-w-[350px] max-w-[450px] rounded-lg animate-slide-in-right"
          >
            <div className="flex items-start gap-3 p-4">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(variant)}
              </div>
              <div className="grid gap-1 flex-1">
                {title && (
                  <ToastTitle className="text-gray-900 font-semibold text-sm leading-tight">
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
      <ToastViewport className="fixed top-0 right-0 flex flex-col-reverse p-4 gap-2 w-full md:max-w-[420px] list-none z-[100] outline-none" />
    </ToastProvider>
  )
}
