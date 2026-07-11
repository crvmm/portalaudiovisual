import type { JobMatch, MatchExplanation } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle, XCircle } from "lucide-react";

export function MatchScoreCard({ match }: { match: JobMatch }) {
  const explanations = (match.match_explanation ?? []) as MatchExplanation[];
  const score = match.match_score;

  const scoreColor =
    score >= 80 ? "text-green-400" : score >= 60 ? "text-amber-400" : "text-muted-foreground";

  const scoreLabel =
    score >= 80 ? "Alta compatibilidad" : score >= 60 ? "Compatibilidad media" : "Baja compatibilidad";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Coincidencia contigo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-4">
          <span className={`text-3xl font-bold ${scoreColor}`}>{Math.round(score)}%</span>
          <Badge variant={score >= 80 ? "success" : score >= 60 ? "warning" : "muted"}>
            {scoreLabel}
          </Badge>
        </div>

        {explanations.length > 0 && (
          <ul className="space-y-2">
            {explanations.map((exp, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                {exp.positive ? (
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-400 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                )}
                <span className={exp.positive ? "text-foreground" : "text-muted-foreground"}>
                  {exp.message}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
