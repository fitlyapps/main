import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";

const coaches = [
  { name: "Lena Cross", specialty: "Hypertrophie", location: "Paris, FR", rating: 4.9 },
  { name: "Marco Silva", specialty: "Perte de poids", location: "Lisbon, PT", rating: 4.8 },
  { name: "Ava Morgan", specialty: "Performance athlétique", location: "Austin, US", rating: 4.7 }
];

export default function CoachesPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-12">
      <h1 className="text-4xl font-semibold tracking-tight">Catalogue de coachs</h1>
      <p className="mt-3 text-muted">Recherche par spécialité, localisation, langues et note.</p>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {coaches.map((coach) => (
          <Card key={coach.name}>
            <p className="text-lg font-semibold">{coach.name}</p>
            <p className="mt-2 text-sm text-muted">{coach.specialty}</p>
            <p className="mt-1 text-sm text-muted">{coach.location}</p>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span>{coach.rating}</span>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
