import { Card } from "@/components/ui/card";

const clients = [
  { name: "Nora Bell", goal: "Prise de masse", checkin: "2 photos en attente" },
  { name: "Ethan Park", goal: "Perte de gras", checkin: "RAS" },
  { name: "Maya Chen", goal: "Force", checkin: "1 photo reçue" }
];

export default function ClientsPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Espace Clients</h1>
      <p className="mt-2 text-muted">Suivi personnalisé, plans et photos.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {clients.map((client) => (
          <Card key={client.name}>
            <p className="text-lg font-semibold">{client.name}</p>
            <p className="mt-2 text-sm text-muted">Objectif: {client.goal}</p>
            <p className="mt-1 text-sm text-muted">Suivi: {client.checkin}</p>
          </Card>
        ))}
      </div>
    </main>
  );
}
