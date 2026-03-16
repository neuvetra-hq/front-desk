import { createContext, useContext, useEffect, useState } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

export interface Business {
  id: string
  name: string
  status: "active" | "inactive" | "suspended"
  businessType: string | null
  twilioNumber: string | null
}

interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  business: Business | null
  businessLoading: boolean
  signOut: () => Promise<void>
  refreshBusiness: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function fetchUserBusiness(userId: string): Promise<Business | null> {
  const { data } = await supabase
    .from("business_members")
    .select("businesses(id, name, status, business_type, twilio_number)")
    .eq("user_id", userId)
    .eq("role", "owner")
    .limit(1)
    .maybeSingle()

  if (!data?.businesses) return null
  const b = data.businesses as Record<string, unknown>
  return {
    id: b.id as string,
    name: b.name as string,
    status: b.status as Business["status"],
    businessType: (b.business_type as string) ?? null,
    twilioNumber: (b.twilio_number as string) ?? null,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [business, setBusiness] = useState<Business | null>(null)
  const [businessLoading, setBusinessLoading] = useState(false)

  const loadBusiness = async (userId: string) => {
    setBusinessLoading(true)
    const b = await fetchUserBusiness(userId)
    setBusiness(b)
    setBusinessLoading(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session)
      if (data.session?.user) {
        await loadBusiness(data.session.user.id)
      }
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        loadBusiness(session.user.id)
      } else {
        setBusiness(null)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setBusiness(null)
  }

  // Silent refresh — does NOT set businessLoading, so ProtectedRoute never unmounts children
  const refreshBusiness = async () => {
    if (session?.user) {
      const b = await fetchUserBusiness(session.user.id)
      setBusiness(b)
    }
  }

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, business, businessLoading, signOut, refreshBusiness }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
