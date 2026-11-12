import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, PawPrint, Plus, Search, Stethoscope, Trash2 } from "lucide-react";
import api, { getApiError } from "../api.js";
import FormDialog from "../components/FormDialog.jsx";
import LoadingState from "../components/LoadingState.jsx";

const dateFormat = new Intl.DateTimeFormat(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const getPet = (reservation) => reservation.pet?.ime || `Pet #${reservation.ljubimac_id}`;
const getVet = (reservation) => reservation.vet ? `Dr. ${reservation.vet.ime} ${reservation.vet.prezime}` : `Veterinarian #${reservation.veterinar_id}`;

export default function ReservationPage({ role, toast }) {
  const [reservations, setReservations] = useState([]);
  const [pets, setPets] = useState([]);
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState(false);
  const isAdmin = role === "admin";

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [visits, petRecords, vetRecords] = await Promise.all([api.reservations.list(), api.pets.list(), api.vets.list()]);
      setReservations(visits);
      setPets(petRecords);
      setVets(vetRecords);
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const visible = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return reservations.filter((visit) => !term || [getPet(visit), getVet(visit), visit.owner?.ime, visit.owner?.prezime, visit.datum].some((value) => String(value || "").toLocaleLowerCase().includes(term)));
  }, [reservations, search]);

  const fields = useMemo(() => [
    { name: "ljubimac_id", label: "Ljubimac", section: "Koga dovodite?", type: "select", required: true, options: [{ value: "", label: "Izaberite svog ljubimca" }, ...pets.map((pet) => ({ value: pet.ljubimac_id, label: `${pet.ime || "Ljubimac"} · #${pet.ljubimac_id}` }))] },
    { name: "veterinar_id", label: "Veterinar", section: "Koga dovodite?", type: "select", required: true, options: [{ value: "", label: "Izaberite veterinara" }, ...vets.map((vet) => ({ value: vet.veterinar_id, label: `Dr ${vet.ime} ${vet.prezime} · ${vet.specijalizacija || "Opšta praksa"}` }))] },
    { name: "datum", label: "Datum i vreme pregleda", section: "Kada vam odgovara?", type: "datetime-local", required: true, min: new Date().toISOString().slice(0, 16), fullWidth: true },
  ], [pets, vets]);

  const create = async (payload) => {
    try {
      await api.reservations.create({ ...payload, datum: new Date(payload.datum).toISOString() });
      setDialog(false);
      toast("Termin je uspešno zakazan.");
      await refresh();
    } catch (requestError) {
      const message = getApiError(requestError);
      toast(message, "error");
      throw new Error(message);
    }
  };

  const cancel = async (visit) => {
    if (!window.confirm(`Da li želite da otkažete termin za ljubimca ${getPet(visit)} dana ${dateFormat.format(new Date(visit.datum))}?`)) return;
    try {
      await api.reservations.remove(visit.rezervacija_id);
      toast("Termin je otkazan.");
      await refresh();
    } catch (requestError) {
      const message = getApiError(requestError);
      setError(message);
      toast(message, "error");
    }
  };

  return <section className="resource-page">
    <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-dot" /> PAWS · TERMINI</div><h1>Zakazani pregledi</h1><p>{isAdmin ? "Pregledajte termine i posete u ambulanti." : "Zakažite posetu za svog ljubimca i pratite predstojeće preglede."}</p></div><button className="button primary" onClick={() => setDialog(true)} disabled={!pets.length || !vets.length}><Plus size={17} /> Zakaži termin</button></div>
    {!loading && (!pets.length || !vets.length) && <div className="info-banner"><PawPrint size={17} /> {!pets.length ? "Dodajte aktivnog ljubimca pre zakazivanja pregleda." : "Trenutno nema dostupnih veterinara za zakazivanje."}</div>}
    <section className="panel data-panel">
      <div className="table-toolbar"><div><strong>{loading ? "—" : reservations.length}</strong><span> zakazanih pregleda</span></div><label className="search-field"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pretraži termine…" aria-label="Pretraži termine" /></label></div>
      {error && <div className="inline-error table-error" role="alert">{error}<button onClick={refresh}>Pokušaj ponovo</button></div>}
      {loading ? <LoadingState label="Učitavam termine…" /> : error ? <div className="empty-state"><CalendarDays size={26} /><h3>Termini trenutno nisu dostupni</h3><p>Proverite vezu i pokušajte ponovo.</p><button className="button secondary" onClick={refresh}>Pokušaj ponovo</button></div> : !visible.length ? <div className="empty-state"><CalendarDays size={26} /><h3>{reservations.length ? "Nema rezultata pretrage" : "Ovde počinje briga"}</h3><p>{reservations.length ? "Pokušajte sa drugim pojmom za pretragu." : "Vaši predstojeći pregledi biće prikazani ovde."}</p>{!reservations.length && pets.length > 0 && vets.length > 0 && <button className="button secondary" onClick={() => setDialog(true)}><Plus size={16} /> Zakaži prvi pregled</button>}</div> :
        <div className="appointment-list">{visible.map((visit) => <article className="appointment-card" key={visit.rezervacija_id}>
          <div className="appointment-date"><span>{new Date(visit.datum).toLocaleDateString(undefined, { month: "short" })}</span><strong>{new Date(visit.datum).getDate()}</strong><small>{new Date(visit.datum).toLocaleDateString(undefined, { weekday: "short" })}</small></div>
          <div className="appointment-main"><div className="appointment-title"><h3>{getPet(visit)}</h3><span className="appointment-id">Visit #{visit.rezervacija_id}</span></div><div className="appointment-meta"><span><Clock3 size={14} /> {dateFormat.format(new Date(visit.datum))}</span><span><Stethoscope size={14} /> {getVet(visit)}</span>{isAdmin && visit.owner && <span><PawPrint size={14} /> {visit.owner.ime} {visit.owner.prezime}</span>}</div></div>
          <button className="icon-button danger-icon cancel-visit" title="Cancel appointment" aria-label="Cancel appointment" onClick={() => cancel(visit)}><Trash2 size={17} /></button>
        </article>)}</div>}
      <div className="table-footer">Termini su prikazani prema zakazanom datumu.</div>
    </section>
    {dialog && <FormDialog title="Zakaži pregled" description="Izaberite ljubimca, veterinara i vreme koje vam odgovara." fields={fields} initial={{}} submitLabel="Potvrdi termin" onClose={() => setDialog(false)} onSubmit={create} />}
  </section>;
}
