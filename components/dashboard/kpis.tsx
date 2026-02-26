import { Card } from "@/components/ui/card";

const kpis = [
  { label: "Clients actifs", value: "24" },
  { label: "Plans nutrition", value: "18" },
  { label: "Séances cette semaine", value: "46" },
  { label: "Messages non lus", value: "7" }
];

export function Kpis() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.label}>
          <p className="text-sm text-muted">{kpi.label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{kpi.value}</p>
        </Card>
      ))}
    </div>
  );
}
