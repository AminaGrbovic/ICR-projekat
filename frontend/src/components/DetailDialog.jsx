import { X } from "lucide-react";
import { createPortal } from "react-dom";

const labels = {
  ime: "Ime",
  prezime: "Prezime",
  adresa: "Adresa",
  tel: "Telefon",
  email: "E-pošta",
  username: "Korisničko ime",
  status: "Status",
  vrsta: "Vrsta",
  rasa: "Rasa",
  pol: "Pol",
  datum_rodjenja: "Datum rođenja",
  tezina: "Težina",
  vlasnik_id: "ID vlasnika",
  ljubimac_id: "ID ljubimca",
  veterinar_id: "ID veterinara",
  rezervacija_id: "ID termina",
  datum: "Datum i vreme",
  specijalizacija: "Specijalizacija",
  kontakt: "Kontakt",
  naziv: "Naziv",
  cijena: "Cena",
  owner: "Vlasnik",
  pet: "Ljubimac",
  vet: "Veterinar",
};
const nice = (key) => labels[key] || key.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const format = (key, value) => {
  if (value === null || value === undefined || value === "") return "—";
  if ((key === "datum" || key === "datum_rodjenja") && !Number.isNaN(Date.parse(value))) return new Date(value).toLocaleString("sr-Latn");
  if (key === "status") return Number(value) === 1 ? "Aktivan" : "Neaktivan";
  if (typeof value === "object") return Object.entries(value).filter(([field]) => !["_id", "__v", "password"].includes(field)).map(([field, item]) => `${nice(field)}: ${String(item ?? "—")}`).join(" · ") || "—";
  return String(value);
};

export default function DetailDialog({ title, record, onClose }) {
  const fields = Object.entries(record || {}).filter(([key]) => !["_id", "__v", "password"].includes(key));
  return createPortal(<div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="modal-card detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title">
      <div className="modal-heading"><div><span className="section-kicker">RECORD DETAILS</span><h2 id="detail-title">{title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button></div>
      <dl className="detail-list">{fields.map(([key, value]) => <div key={key}><dt>{nice(key)}</dt><dd>{format(key, value)}</dd></div>)}</dl>
      <div className="modal-actions"><button className="button primary" onClick={onClose}>Done</button></div>
    </section>
  </div>, document.body);
}
