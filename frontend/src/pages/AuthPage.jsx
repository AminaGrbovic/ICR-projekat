import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, PawPrint } from "lucide-react";
import api, { getApiError } from "../api.js";

const initialForm = { ime: "", prezime: "", adresa: "", tel: "", email: "", username: "", password: "" };

export default function AuthPage({ register = false, onSignIn, toast }) {
  const [values, setValues] = useState(initialForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const update = (event) => setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = register
        ? await api.register({
            ime: values.ime, prezime: values.prezime, adresa: values.adresa,
            tel: values.tel, email: values.email, username: values.username, password: values.password,
          })
        : await api.login({ username: values.username, password: values.password });
      onSignIn(result);
    } catch (requestError) {
      const message = getApiError(requestError);
      setError(message);
      toast(message, "error");
    } finally {
      setBusy(false);
    }
  };

  return <div className="auth-page">
    <div className="auth-art">
      <Link className="auth-art-brand" to="/"><span className="brand-mark"><PawPrint size={21} /></span> PAWS</Link>
      <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
      <div className="art-copy">
        <div className="eyebrow"><Heart size={14} fill="currentColor" /> VETERINARSKA AMBULANTA PAWS</div>
        <h1>Njihove šape.<br />Naše <em>srce.</em></h1>
        <p>Jedno mesto za brigu o ambulanti, veterinarskom timu i ljubimcima koji nam ulepšavaju svaki dan.</p>
        <div className="art-paw"><PawPrint size={91} strokeWidth={1.2} /></div>
      </div>
      <div className="art-footnote">Sa pažnjom, za svaku šapu.</div>
    </div>
    <main className="auth-main">
      <Link className="auth-mobile-brand" to="/"><PawPrint size={20} /> PAWS</Link>
      <div className="auth-box">
        <div className="auth-kicker">{register ? "BRIGA O VAŠEM LJUBIMCU POČINJE OVDE" : "DOBRO DOŠLI NAZAD"}</div>
        <h2>{register ? "Napravite nalog" : "Prijavite se na PAWS"}</h2>
        <p className="auth-subtitle">{register ? "Napravite svoj nalog i pratite brigu o ljubimcu na jednom mestu." : "Vaša ambulanta, ljubimci i termini na jednom mestu."}</p>
        {error && <div className="inline-error" role="alert">{error}</div>}
        <form className="form-stack auth-form" onSubmit={submit}>
          {register && <>
            <div className="form-row">
              <label>Ime<input name="ime" value={values.ime} onChange={update} required maxLength={255} autoComplete="given-name" /></label>
              <label>Prezime<input name="prezime" value={values.prezime} onChange={update} required maxLength={255} autoComplete="family-name" /></label>
            </div>
            <label>Adresa<input name="adresa" value={values.adresa} onChange={update} required maxLength={255} autoComplete="street-address" /></label>
            <div className="form-row">
              <label>Telefon<input name="tel" value={values.tel} onChange={update} required maxLength={255} autoComplete="tel" /></label>
              <label>E-pošta<input name="email" type="email" value={values.email} onChange={update} required maxLength={255} autoComplete="email" /></label>
            </div>
          </>}
          <label>Korisničko ime<input name="username" value={values.username} onChange={update} required maxLength={register ? 255 : undefined} autoComplete="username" /></label>
          <label>Lozinka<input name="password" type="password" value={values.password} onChange={update} required minLength={register ? 6 : undefined} autoComplete={register ? "new-password" : "current-password"} /></label>
          <button className="button primary wide auth-submit" disabled={busy}>{busy ? "Sačekajte…" : register ? "Napravi nalog" : "Prijavi se"} <ArrowRight size={17} /></button>
        </form>
        <div className="auth-switch">{register ? "Već imate nalog?" : "Prvi put ste ovde?"} <Link to={register ? "/login" : "/register"}>{register ? "Prijavite se" : "Registrujte se"}</Link></div>
        <div className="auth-note">Siguran pristup za vlasnike ljubimaca i tim ambulante</div>
      </div>
    </main>
  </div>;
}
