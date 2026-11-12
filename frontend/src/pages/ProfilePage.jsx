import { useEffect, useState } from "react";
import { Save, UserRound } from "lucide-react";
import api, { getApiError } from "../api.js";
import LoadingState from "../components/LoadingState.jsx";

const fields = [
  ["ime", "Ime"], ["prezime", "Prezime"], ["adresa", "Adresa"],
  ["tel", "Telefon"], ["email", "E-pošta"], ["username", "Korisničko ime"],
];
const emptyValues = Object.fromEntries(fields.map(([key]) => [key, ""]));

export default function ProfilePage({ toast }) {
  const [values, setValues] = useState(emptyValues);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.owners.me().then((owner) => {
      if (active) setValues(Object.fromEntries(fields.map(([key]) => [key, owner[key] ?? ""])));
    }).catch((requestError) => { if (active) setError(getApiError(requestError)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const payload = Object.fromEntries(Object.entries(values).filter(([, value]) => value !== ""));
      if (values.password) payload.password = values.password;
      const updated = await api.owners.updateMe(payload);
      setValues((current) => ({ ...current, ...Object.fromEntries(fields.map(([key]) => [key, updated[key] ?? ""])), password: "" }));
      toast("Your profile was updated.");
    } catch (requestError) {
      const message = getApiError(requestError);
      setError(message);
      toast(message, "error");
    } finally {
      setBusy(false);
    }
  };

  return <section className="profile-page">
    <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-dot" /> PODEŠAVANJA NALOGA</div><h1>Moj profil</h1><p>Ažurirajte svoje kontakt podatke kako bi briga o vašem ljubimcu bila jednostavnija.</p></div></div>
    {loading ? <section className="panel profile-card"><LoadingState label="Učitavam profil…" /></section> : <section className="panel profile-card">
      <div className="profile-card-heading"><div className="metric-icon rose"><UserRound size={20} /></div><div><h2>Lični podaci</h2><p>Vaši podaci su vidljivi samo vašoj ambulanti.</p></div></div>
      {error && <div className="inline-error" role="alert">{error}</div>}
      <form className="form-stack profile-form" onSubmit={submit}>
        <div className="profile-fields">{fields.map(([name, label]) => <label key={name}>{label}<input name={name} type={name === "email" ? "email" : "text"} value={values[name] ?? ""} onChange={(event) => setValues((current) => ({ ...current, [name]: event.target.value }))} maxLength={255} /></label>)}
          <label>Nova lozinka (opciono)<input name="password" type="password" minLength={6} value={values.password || ""} onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))} placeholder="Ostavite prazno da zadržite postojeću lozinku" /></label>
        </div>
        <div className="profile-actions"><span>Izmene se čuvaju na vašem PAWS nalogu.</span><button className="button primary" disabled={busy}><Save size={16} /> {busy ? "Čuvanje…" : "Sačuvaj profil"}</button></div>
      </form>
    </section>}
  </section>;
}
