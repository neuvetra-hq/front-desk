import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Plus, BookOpen } from "lucide-react"
import { toast } from "sonner"

const API_URL = import.meta.env.VITE_API_URL as string

interface KBItem {
  id: string
  question: string
  answer: string
  createdAt: string
}

const schema = z.object({
  question: z.string().min(3, "Enter a question"),
  answer:   z.string().min(3, "Enter an answer"),
})
type FormData = z.infer<typeof schema>

export function KnowledgeBaseTab() {
  const { business } = useAuth()
  const [items, setItems] = useState<KBItem[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const fetchItems = async () => {
    if (!business?.id) return
    const res = await fetch(`${API_URL}/businesses/${business.id}/knowledge-base`)
    const data = await res.json() as { items: KBItem[] }
    setItems(data.items ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchItems() }, [business?.id])

  const handleAdd = async (data: FormData) => {
    if (!business?.id) return
    setAdding(true)
    try {
      const res = await fetch(`${API_URL}/businesses/${business.id}/knowledge-base`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const result = await res.json() as { item?: KBItem; error?: string }
      if (result.error) throw new Error(result.error)
      setItems((prev) => [...prev, result.item!])
      reset()
      setShowForm(false)
      toast.success("Added to knowledge base")
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to add item")
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!business?.id) return
    try {
      await fetch(`${API_URL}/businesses/${business.id}/knowledge-base/${id}`, { method: "DELETE" })
      setItems((prev) => prev.filter((i) => i.id !== id))
      toast.success("Removed")
    } catch {
      toast.error("Failed to remove item")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-indigo-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Knowledge Base</h2>
          <p className="text-sm text-neutral-400 mt-0.5">
            Q&A pairs your AI uses to answer calls. The more you add, the better it performs.
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)} className="gap-1.5">
          <Plus size={15} />
          Add Q&A
        </Button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmit(handleAdd)} className="rounded-xl border border-indigo-200 bg-indigo-50 p-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="question">Question</Label>
            <Input id="question" placeholder="What are your business hours?" {...register("question")} />
            {errors.question && <p className="text-xs text-red-500">{errors.question.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="answer">Answer</Label>
            <Input id="answer" placeholder="We're open Monday–Friday, 9am–6pm." {...register("answer")} />
            {errors.answer && <p className="text-xs text-red-500">{errors.answer.message}</p>}
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={adding}>
              {adding ? "Saving…" : "Save"}
            </Button>
            <Button type="button" variant="outline" onClick={() => { setShowForm(false); reset() }}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Items list */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-12 w-12 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
            <BookOpen size={20} className="text-neutral-400" />
          </div>
          <h3 className="font-semibold text-neutral-700">No Q&A pairs yet</h3>
          <p className="text-sm text-neutral-400 mt-1">
            Add your business hours, services, pricing, and FAQs.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border border-neutral-200 bg-white p-5 flex gap-4">
              <div className="flex-1 space-y-1 min-w-0">
                <p className="font-medium text-neutral-900 text-sm">{item.question}</p>
                <p className="text-sm text-neutral-500">{item.answer}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(item.id)}
                className="shrink-0 h-7 w-7 text-neutral-300 hover:text-red-500 mt-0.5"
                aria-label="Delete"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
