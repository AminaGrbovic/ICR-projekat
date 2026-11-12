import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDownWideNarrow, ArrowUpWideNarrow, Eye, PawPrint, Pencil, Pill, Plus, Search, Stethoscope, Trash2, Users } from "lucide-react";
import api, { getApiError } from "../api.js";
import DetailDialog from "../components/DetailDialog.jsx";
import FormDialog from "../components/FormDialog.jsx";
import LoadingState from "../components/LoadingState.jsx";

const definitions = {
  owners: {
    title: "Vlasnici", singular: "vlasnika", addLabel: "", subtitle: "Pregled aktivnih vlasnika ljubimaca i njihovih kontakt podataka.", idKey: "vlasnik_id", icon: Users,
    resource: api.owners, canCreate: false, canEdit: true, canDelete: true,
    columns: [["ime", "Ime"], ["prezime", "Prezime"], ["username", "Korisničko ime"], ["email", "E-pošta"], ["tel", "Telefon"]],
    fields: [
      { name: "ime", label: "Ime", section: "Lični podaci", required: true, maxLength: 255 },
      { name: "prezime", label: "Prezime", section: "Lični podaci", required: true, maxLength: 255 },
      { name: "adresa", label: "Adresa", section: "Kontakt podaci", required: true, maxLength: 255 },
      { name: "tel", label: "Telefon", section: "Kontakt podaci", required: true, maxLength: 255 },
      { name: "email", label: "E-pošta", section: "Kontakt podaci", type: "email", required: true, maxLength: 255 },
      { name: "username", label: "Korisničko ime", section: "Nalog", required: true, maxLength: 255 },
      { name: "password", label: "Nova lozinka", section: "Nalog", type: "password", min: 6, hint: "Ostavite prazno ako ne želite da menjate lozinku." },
    ],
  },
  pets: {
    title: "Ljubimci", singular: "ljubimca", addLabel: "ljubimca", subtitle: "Vaši ljubimci, njihove važne informacije i sledeći koraci nege.", idKey: "ljubimac_id", icon: PawPrint,
    resource: api.pets, canCreate: true, canEdit: true, canDelete: true,
    columns: [["ime", "Ime"], ["vrsta", "Vrsta"], ["rasa", "Rasa"], ["pol", "Pol"], ["datum_rodjenja", "Datum rođenja"], ["tezina", "Težina"]],
    fields: [
      { name: "ime", label: "Ime ljubimca", section: "O ljubimcu", placeholder: "npr. Luna" },
      { name: "vrsta", label: "Vrsta", section: "O ljubimcu", placeholder: "npr. Pas, mačka" },
      { name: "rasa", label: "Rasa", section: "O ljubimcu", placeholder: "npr. Zlatni retriver" },
      { name: "pol", label: "Pol", section: "O ljubimcu", placeholder: "npr. Ženka, mužjak" },
      { name: "datum_rodjenja", label: "Datum rođenja", section: "Dodatne informacije", type: "date" },
      { name: "tezina", label: "Težina (kg)", section: "Dodatne informacije", type: "number", min: 0, step: "any", placeholder: "npr. 4.5" },
    ],
    adminOnly: false,
  },
  vets: {
    title: "Veterinari", singular: "veterinara", addLabel: "veterinara", subtitle: "Upoznajte tim koji brine o zdravlju vaših ljubimaca.", idKey: "veterinar_id", icon: Stethoscope,
    resource: api.vets, canCreate: true, canEdit: true, canDelete: true, adminOnly: true,
    columns: [["ime", "Ime"], ["prezime", "Prezime"], ["specijalizacija", "Specijalizacija"], ["kontakt", "Kontakt"]],
    fields: [
      { name: "ime", label: "Ime", section: "Podaci o veterinaru" }, { name: "prezime", label: "Prezime", section: "Podaci o veterinaru" },
      { name: "specijalizacija", label: "Specijalizacija", section: "Profesionalni podaci" }, { name: "kontakt", label: "Kontakt", section: "Profesionalni podaci" },
    ],
  },
  medicines: {
    title: "Lekovi", singular: "leka", addLabel: "lek", subtitle: "Pregledajte i ažurirajte katalog lekova u ambulanti.", idKey: "lijek_id", icon: Pill,
    resource: api.medicines, canCreate: true, canEdit: true, canDelete: true,
    columns: [["naziv", "Naziv leka"], ["cijena", "Cena"]],
    fields: [
      { name: "naziv", label: "Naziv leka", section: "Podaci o leku", placeholder: "Unesite naziv leka" },
      { name: "cijena", label: "Cena", section: "Podaci o leku", type: "number", min: 0, step: "0.01", placeholder: "0.00" },
    ],
  },
};

const valueFor = (record, field) => {
  const value = record[field];
  if (value === undefined || value === null || value === "") return "—";
  if (field === "cijena") return Number(value).toFixed(2);
  if (field === "tezina") return `${value} kg`;
  return String(value);
};

export default function ResourcePage({ kind, role, toast }) {
  const spec = definitions[kind];
  const admin = role === "admin";
  const canCreate = spec.canCreate && (!spec.adminOnly || admin);
  const canEdit = spec.canEdit && (!spec.adminOnly || admin);
  const canDelete = spec.canDelete && (!spec.adminOnly || admin);
  const [records, setRecords] = useState([]);
  const [owners, setOwners] = useState([]);
  const [ownersLoading, setOwnersLoading] = useState(false);
  const [ownersError, setOwnersError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState(spec.columns[0][0]);
  const [sortDirection, setSortDirection] = useState(1);
  const [editor, setEditor] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fields = useMemo(() => {
    if (kind !== "pets" || !admin) return spec.fields;
    return [...spec.fields, {
      name: "vlasnik_id", label: "Vlasnik ljubimca", section: "Dodela vlasniku", type: "select", valueType: "number", required: true,
      disabled: ownersLoading || owners.length === 0,
      disabledMessage: ownersError ? "Osvežite listu vlasnika" : ownersLoading ? "Učitavam vlasnike…" : "Dodajte vlasnika za nastavak",
      options: [{ value: "", label: owners.length ? "Izaberite vlasnika" : "Nema aktivnih vlasnika" }, ...owners.map((owner) => ({ value: owner.vlasnik_id, label: `${owner.ime} ${owner.prezime} · #${owner.vlasnik_id}` }))],
      hint: owners.length ? "Izaberite aktivnog vlasnika kojem pripada ovaj ljubimac." : "Najpre dodajte vlasnika, pa onda možete da evidentirate ljubimca.",
    }];
  }, [admin, kind, owners, spec]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const result = await spec.resource.list();
      if (!Array.isArray(result)) throw new Error("Server nije vratio očekivanu listu podataka.");
      setRecords(result);
    } catch (error) {
      setLoadError(getApiError(error));
    } finally {
      setLoading(false);
    }
  }, [spec]);

  const refreshOwners = useCallback(async () => {
    setOwnersLoading(true);
    setOwnersError("");
    try {
      setOwners(await api.owners.list());
    } catch (error) {
      setOwnersError(getApiError(error));
    } finally {
      setOwnersLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (kind !== "pets" || !admin) return undefined;
    refreshOwners();
  }, [admin, kind, refreshOwners]);

  const visible = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return records.filter((record) => !term || Object.entries(record).some(([key, value]) => key !== "password" && String(value ?? "").toLocaleLowerCase().includes(term)))
      .sort((left, right) => String(left[sortKey] ?? "").localeCompare(String(right[sortKey] ?? ""), undefined, { numeric: true, sensitivity: "base" }) * sortDirection);
  }, [records, query, sortKey, sortDirection]);

  const openDetail = async (record) => {
    setDetailLoading(true);
    try {
      const result = await spec.resource.get(record[spec.idKey]);
      if (!result) throw new Error("Ovaj zapis više nije dostupan.");
      setDetail(result);
    } catch (error) {
      const message = getApiError(error);
      setLoadError(message);
      toast(message, "error");
    } finally {
      setDetailLoading(false);
    }
  };

  const save = async (payload) => {
    try {
      if (editor.mode === "create") await spec.resource.create(payload);
      else await spec.resource.update(editor.record[spec.idKey], payload);
      setEditor(null);
      toast(editor.mode === "create" ? "Novi zapis je uspešno dodat." : "Izmene su uspešno sačuvane.");
      await refresh();
    } catch (error) {
      const message = getApiError(error);
      toast(message, "error");
      throw new Error(message);
    }
  };

  const remove = async (record) => {
    const label = record.ime || record.naziv || record.username || spec.singular;
    if (!window.confirm(`Da li sigurno želite da uklonite zapis „${label}“?`)) return;
    try {
      await spec.resource.remove(record[spec.idKey]);
      toast("Zapis je uklonjen.");
      await refresh();
    } catch (error) {
      const message = getApiError(error);
      setLoadError(message);
      toast(message, "error");
    }
  };

  const changeSort = (field) => {
    if (sortKey === field) setSortDirection((value) => value * -1);
    else { setSortKey(field); setSortDirection(1); }
  };

  return <section className="resource-page">
    <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-dot" /> PAWS · EVIDENCIJA</div><h1>{spec.title}</h1><p>{spec.subtitle}</p></div>{canCreate && <button className="button primary" onClick={() => setEditor({ mode: "create", record: {} })}><Plus size={17} /> Dodaj {spec.addLabel}</button>}</div>
    <section className={`panel data-panel ${kind === "pets" ? "pet-data-panel" : ""}`}>
      <div className="table-toolbar"><div><strong>{loading ? "—" : records.length}</strong><span> {spec.title.toLocaleLowerCase()} ukupno</span></div>
        <div className="directory-tools"><label className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Pretraži: ${spec.title.toLocaleLowerCase()}…`} aria-label={`Pretraži ${spec.title}`} /></label>
          <label className="sort-field"><span>Sortiraj</span><select value={sortKey} onChange={(event) => { setSortKey(event.target.value); setSortDirection(1); }}>{spec.columns.map(([field, label]) => <option value={field} key={field}>{label}</option>)}</select><button type="button" className="sort-direction" aria-label="Promeni smer sortiranja" onClick={() => setSortDirection((direction) => direction * -1)}>{sortDirection === 1 ? <ArrowDownWideNarrow size={16} /> : <ArrowUpWideNarrow size={16} />}</button></label>
        </div>
      </div>
      {loadError && <div className="directory-alert" role="alert"><span>{loadError}</span><button className="button secondary" onClick={refresh}>Pokušaj ponovo</button></div>}
      {kind === "pets" && admin && ownersError && <div className="directory-alert owner-alert" role="alert"><span>Ne mogu da učitam listu vlasnika: {ownersError}</span><button className="button secondary" onClick={refreshOwners}>Pokušaj ponovo</button></div>}
      {loading ? <LoadingState label="Učitavam podatke…" /> : loadError ? <div className="directory-empty"><div className="empty-illustration"><Search size={25} /></div><h3>Podaci trenutno nisu dostupni</h3><p>Proverite vezu sa serverom i pokušajte ponovo.</p><button className="button primary" onClick={refresh}>Osveži podatke</button></div> : visible.length === 0 ? <div className="directory-empty"><div className="empty-illustration"><spec.icon size={25} /></div><h3>{records.length ? "Nema rezultata pretrage" : `Još nema podataka za: ${spec.title.toLocaleLowerCase()}`}</h3><p>{records.length ? "Pokušajte sa drugim pojmom ili promenite filter." : canCreate ? "Dodajte prvi zapis i svi podaci će biti prikazani ovde." : "Aktivni zapisi će se pojaviti na ovom mestu."}</p>{canCreate && !records.length && <button className="button primary" onClick={() => setEditor({ mode: "create", record: {} })}><Plus size={16} /> Dodaj {spec.addLabel}</button>}</div> :
        <div className={`record-grid ${kind === "pets" ? "pet-grid" : ""}`}>{visible.map((record) => {
          const title = kind === "vets" ? `Dr ${record.ime || ""} ${record.prezime || ""}`.trim() : kind === "owners" ? `${record.ime || ""} ${record.prezime || ""}`.trim() : valueFor(record, spec.columns[0][0]);
          const subtitle = kind === "pets" ? (record.vrsta || "Ljubimac") : kind === "vets" ? (record.specijalizacija || "Veterinar") : kind === "owners" ? (record.email || record.username || "Vlasnik ljubimca") : kind === "medicines" ? "Katalog ambulante" : "";
          const displayColumns = kind === "owners" ? [["tel", "Telefon"], ["adresa", "Adresa"]] : kind === "pets" ? spec.columns.slice(2) : kind === "vets" ? [["kontakt", "Kontakt"]] : [["cijena", "Cena"]];
          return <article className="record-card" key={record[spec.idKey]}>
            <div className="record-card-top"><div className={`record-avatar record-avatar-${kind}`}><spec.icon size={20} /></div><span className="record-id">#{record[spec.idKey]}</span><div className="record-actions"><button className="icon-button" title="Pogledaj detalje" aria-label={`Pogledaj detalje: ${title}`} disabled={detailLoading} onClick={() => openDetail(record)}><Eye size={16} /></button>{canEdit && <button className="icon-button" title="Izmeni zapis" aria-label={`Izmeni: ${title}`} onClick={() => setEditor({ mode: "edit", record })}><Pencil size={15} /></button>}{canDelete && <button className="icon-button danger-icon" title="Ukloni zapis" aria-label={`Ukloni: ${title}`} onClick={() => remove(record)}><Trash2 size={16} /></button>}</div></div>
            <div className="record-card-title"><h2>{title || `${spec.singular} #${record[spec.idKey]}`}</h2><p>{subtitle}</p></div>
            {kind === "pets" && record.rasa && <span className="record-tag">{record.rasa}</span>}
            <div className="record-facts">{displayColumns.map(([field, label]) => <div key={field}><span>{label}</span><strong>{valueFor(record, field)}</strong></div>)}</div>
            <button type="button" className="record-detail-link" onClick={() => openDetail(record)}>Otvori ceo profil <span>→</span></button>
          </article>;
        })}</div>}
      <div className="table-footer">Prikazano {visible.length} od {records.length} {spec.title.toLocaleLowerCase()}</div>
    </section>
    {editor && <FormDialog title={editor.mode === "create" ? `Dodaj ${spec.addLabel}` : `Izmeni podatke · ${editor.record.ime || editor.record.naziv || ""}`} description={editor.mode === "create" ? "Popunite podatke ispod. Možete ih dopuniti i kasnije." : "Ažurirajte podatke i sačuvajte izmene."} fields={fields} initial={editor.record} submitLabel={editor.mode === "create" ? "Sačuvaj zapis" : "Sačuvaj izmene"} onClose={() => setEditor(null)} onSubmit={save} />}
    {detail && <DetailDialog title={`Podaci · ${spec.singular} #${detail[spec.idKey]}`} record={detail} onClose={() => setDetail(null)} />}
  </section>;
}
