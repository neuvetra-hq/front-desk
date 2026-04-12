import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from "@/contexts/AuthContext"
import "./index.css"
import { App } from "./App"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <App />
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
