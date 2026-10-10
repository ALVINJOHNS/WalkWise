import { Link, Map, Server } from 'lucide-react';
import { Link as RouterLink, BrowserRouter, Route, Routes } from 'react-router-dom';
import { seedVenue } from '../shared/seedVenue';

function Home() {
  return <main className="mx-auto max-w-5xl px-6 py-16">
    <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">VenueFlow foundation</p>
    <h1 className="mt-3 text-4xl font-bold tracking-tight">A shared starting point for the team.</h1>
    <p className="mt-4 max-w-2xl text-slate-600">Modular venue mapping workspace. Feature screens are ready for teammates to build in their owned folders.</p>
    <section className="mt-10 grid gap-4 sm:grid-cols-3">
      <RouterLink className="card" to="/organizer"><Map />Organizer Studio<span>Map editor placeholder</span></RouterLink>
      <RouterLink className="card" to={`/v/${seedVenue.slug}`}><Link />Visitor Map<span>Visitor screen placeholder</span></RouterLink>
      <a className="card" href="/api/health"><Server />API status<span>Open health endpoint</span></a>
    </section>
    <p className="mt-8 text-sm text-slate-500">Seed venue: {seedVenue.name}</p>
  </main>;
}
function Placeholder({ title }: { title: string }) { return <main className="mx-auto max-w-4xl px-6 py-14"><RouterLink to="/" className="text-teal-700">← Home</RouterLink><h1 className="mt-8 text-3xl font-bold">{title}</h1><p className="mt-3 text-slate-600">Feature screen placeholder. Implement this in its owned folder and follow docs/SHARED_CONTRACT.md.</p></main>; }
export default function App() { return <BrowserRouter><Routes><Route path="/" element={<Home />} /><Route path="/organizer/*" element={<Placeholder title="Organizer Studio" />} /><Route path="/v/:slug" element={<Placeholder title="Visitor Map" />} /><Route path="*" element={<Placeholder title="Page not found" />} /></Routes></BrowserRouter>; }
