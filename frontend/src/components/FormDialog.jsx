import { useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, X } from "lucide-react";

export default function FormDialog({ title, description, fields, initial = {}, onClose, onSubmit, submitLabel = "Save changes" }) {
  const [values, setValues] = useState(() => Object.fromEntries(fields.map((field) => [field.name, initial[field.name] ?? ""])));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const payload = {};
      for (const field of fields) {
        const value = values[field.name];
        if (field.type === "number") {
          if (value !== "") payload[field.name] = Number(value);
        } else if (field.valueType === "number") {
          if (value !== "") payload[field.name] = Number(value);
        } else if (field.type === "password" && !value) {
          continue;
        } else if (value !== "" || field.includeEmpty) {
          payload[field.name] = value;
        }
      }
      await onSubmit(payload);
    } catch (requestError) {
      const message = typeof requestError === "string" ? requestError : requestError?.message || "Unable to save changes.";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const sections = fields.reduce((result, field) => {
    const section = field.section || "Osnovni podaci";
    if (!result.length || result[result.length - 1].title !== section) result.push({ title: section, fields: [] });
    result[result.length - 1].fields.push(field);
    return result;
  }, []);
  const unavailableRequiredField = fields.find((field) => field.required && field.disabled);

  return createPortal(<div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <section className="modal-card form-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-heading"><div><span className="section-kicker">PAWS · EVIDENCIJA</span><h2 id="modal-title">{title}</h2>{description && <p>{description}</p>}</div><button className="icon-button modal-close" onClick={onClose} aria-label="Zatvori" disabled={busy}><X size={19} /></button></div>
      <form className="dialog-form" onSubmit={submit}>
        <div className="dialog-scroll">
          {error && <div className="form-error" role="alert"><AlertCircle size={17} /><span>{error}</span></div>}
          {sections.map((section) => <section className="field-section" key={section.title}><h3>{section.title}</h3><div className="field-grid">{section.fields.map((field) => <label className={`field-control ${field.fullWidth ? "field-full" : ""}`} key={field.name} htmlFor={`record-${field.name}`}><span className="field-label">{field.label}{field.required && <i aria-label="obavezno polje">*</i>}{!field.required && <small>opciono</small>}</span>
            {field.type === "select" ? <select id={`record-${field.name}`} name={field.name} value={values[field.name] ?? ""} onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))} required={field.required} disabled={field.disabled}>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : <input id={`record-${field.name}`} name={field.name} type={field.type || "text"} value={values[field.name] ?? ""} onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))} required={field.required} maxLength={field.maxLength} min={field.min} max={field.max} step={field.step} placeholder={field.placeholder || (field.type === "number" ? "Unesite broj" : "Unesite podatak")} autoComplete={field.autoComplete} />}
            {field.hint && <span className="field-hint">{field.hint}</span>}
          </label>)}</div></section>)}
        </div>
        <div className="modal-actions"><button type="button" className="button secondary" onClick={onClose} disabled={busy}>Odustani</button><button type="submit" className="button primary" disabled={busy || unavailableRequiredField}>{busy ? "Čuvanje…" : unavailableRequiredField?.disabledMessage || submitLabel}</button></div>
      </form>
    </section>
  </div>, document.body);
}
