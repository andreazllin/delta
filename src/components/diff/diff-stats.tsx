import { Badge } from '@/components/reui/badge';

interface DiffStatsProps {
  additions: number;
  deletions: number;
}

/** diffshub's diffstat, as a pair of ReUI badges. */
export function DiffStats({ additions, deletions }: DiffStatsProps) {
  return (
    <div className="flex items-center gap-1.5 font-mono text-xs tabular-nums">
      <Badge variant="success-light" size="sm">
        +{additions}
      </Badge>
      <Badge variant="destructive-light" size="sm">
        −{deletions}
      </Badge>
    </div>
  );
}
