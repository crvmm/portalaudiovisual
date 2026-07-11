"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

export function ApplicationForm({ jobPostingId }: { jobPostingId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("Debes iniciar sesión");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("applications").insert({
      job_posting_id: jobPostingId,
      applicant_id: user.id,
      cover_message: message || null,
      proposed_budget: budget ? parseFloat(budget) : null,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        id="cover_message"
        label="Mensaje de presentación"
        placeholder="Cuéntale al cliente por qué eres la persona ideal para este proyecto..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
      />
      <Input
        id="budget"
        label="Presupuesto propuesto (opcional)"
        type="number"
        min="0"
        step="0.01"
        placeholder="1500"
        value={budget}
        onChange={(e) => setBudget(e.target.value)}
      />
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      <Button type="submit" disabled={loading} className="w-full">
        <Send className="h-4 w-4" />
        {loading ? "Enviando..." : "Presentar candidatura"}
      </Button>
    </form>
  );
}
