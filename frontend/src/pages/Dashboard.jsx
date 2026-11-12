import { useEffect, useState } from "react";
import { Activity, ArrowUpRight, CalendarDays, Heart, PawPrint, Stethoscope, Users } from "lucide-react";
import { Link } from "react-router-dom";
import api, { getApiError } from "../api.js";

const dateLabel = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const displayDate = (value) => value ? dateLabel.format(new Date(value)) : "Date not set";

export default function Dashboard({ session }) {
  const [summary, setSummary] = useState({ health: null, welcome: "", vets: 0, pets: [], reservations: [], owners: 0 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const calls = [
      api.health(), api.welcome(), api.vetsCount(), api.pets.list(), api.reservations.list(),
      ...(session.role === "admin" ? [api.owners.list()] : []),
    ];
    Promise.all(calls).then((results) => {
      if (!active) return;
      setSummary({
        health: results[0], welcome: typeof results[1] === "string" ? results[1] : "",
        vets: results[2].count, pets: results[3], reservations: results[4],
        owners: session.role === "admin" ? results[5].length : 0,
      });
    }).catch((requestError) => { if (active) setError(getApiError(requestError)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session.role]);

  const metrics = [
    ...(session.role === "admin" ? [{ label: "Aktivni vlasnici", value: summary.owners, icon: Users, tone: "rose" }] : []),
    { label: session.role === "admin" ? "Registrovani ljubimci" : "Moji ljubimci", value: summary.pets.length, icon: PawPrint, tone: "peach" },
    { label: "Veterinari", value: summary.vets, icon: Stethoscope, tone: "lilac" },
    { label: "Zakazani termini", value: summary.reservations.length, icon: CalendarDays, tone: "mint" },
  ];
  const nextVisits = summary.reservations.slice(0, 4);

  return <div className="dashboard-page">
    <section className="welcome-banner">
      <div><div className="eyebrow"><Heart size={14} fill="currentColor" /> YOUR CARE SPACE</div><h1>{session.role === "admin" ? "A lovely day to care." : `Welcome${session.user?.ime ? `, ${session.user.ime}` : " back"}.`}</h1><p>{session.role === "admin" ? "Here's what's happening at your clinic today." : "Your pet's wellbeing is in good hands."}</p></div>
      <div className="banner-illustration"><PawPrint size={94} strokeWidth={1} /><span className="sparkle sparkle-a">✦</span><span className="sparkle sparkle-b">✧</span></div>
    </section>
    {error && <div className="inline-error" role="alert"><strong>Kontrolna tabla nije učitana:</strong> {error} Proverite da li je server dostupan.</div>}
    <section className="metric-grid">
      {metrics.map(({ label, value, icon: Icon, tone }) => <article className="metric-card" key={label}><div className={`metric-icon ${tone}`}><Icon size={19} /></div><div className="metric-copy"><span>{label}</span><strong>{loading || error ? "—" : value}</strong></div><ArrowUpRight className="metric-arrow" size={17} /></article>)}
    </section>
    <section className="dashboard-columns">
      <article className="panel visits-panel">
        <div className="panel-heading"><div><span className="section-kicker">SLEDEĆI TERMINI</span><h2>Pregledi koji dolaze</h2></div><Link className="text-link" to="/reservations">Svi termini <ArrowUpRight size={15} /></Link></div>
        {loading ? <div className="skeleton-list"><i /><i /><i /></div> : error ? <div className="empty-state"><Activity size={25} /><p>Termini trenutno nisu dostupni.</p></div> : nextVisits.length ? <div className="visit-list">{nextVisits.map((visit) => <div className="visit-row" key={visit.rezervacija_id}><div className="visit-date"><CalendarDays size={17} /></div><div className="visit-copy"><strong>{visit.pet?.ime || `Ljubimac #${visit.ljubimac_id}`}</strong><span>Dr {visit.vet?.ime || "Veterinar"} {visit.vet?.prezime || ""}{session.role === "admin" && visit.owner?.ime ? ` · ${visit.owner.ime} ${visit.owner.prezime}` : ""}</span></div><time>{displayDate(visit.datum)}</time></div>)}</div> : <div className="empty-state"><CalendarDays size={25} /><p>Još nema zakazanih pregleda.</p><Link to="/reservations">Pogledajte termine</Link></div>}
      </article>
      <article className="panel quick-panel">
        <div className="panel-heading"><div><span className="section-kicker">BRZI PRISTUP</span><h2>Briga na jednom mestu</h2></div></div>
        <div className="quick-links">
          <Link to="/pets"><span className="quick-icon rose"><PawPrint size={17} /></span><span><strong>Ljubimci</strong><small>Profili i podaci ljubimaca</small></span><ArrowUpRight size={16} /></Link>
          <Link to="/reservations"><span className="quick-icon pink"><CalendarDays size={17} /></span><span><strong>Termini</strong><small>Zakažite ili pregledajte posete</small></span><ArrowUpRight size={16} /></Link>
          <Link to="/vets"><span className="quick-icon lilac"><Stethoscope size={17} /></span><span><strong>Naš tim</strong><small>Upoznajte veterinare</small></span><ArrowUpRight size={16} /></Link>
        </div>
      </article>
    </section>
    <div className="connection-line"><span className={`connection-indicator ${summary.health?.status === "ok" ? "online" : ""}`} /> {summary.health?.status === "ok" ? "Clinic API is connected" : loading ? "Checking clinic connection…" : "Clinic API connection unavailable"} <span className="connection-separator">·</span> {summary.welcome || "PAWS clinic portal"}</div>
  </div>;
}
