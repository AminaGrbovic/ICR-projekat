import { ArrowDown, ArrowRight, CalendarDays, Check, Clock3, Heart, HeartPulse, MapPin, PawPrint, ShieldPlus, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  { icon: HeartPulse, title: "Preventivni pregledi", text: "Redovne provere pomažu da na vreme brinemo o zdravlju i dobrom raspoloženju vašeg ljubimca.", color: "coral" },
  { icon: ShieldPlus, title: "Vakcinacija i saveti", text: "Podrška u planiranju nege, zaštite i svakodnevnih navika za svaku životnu dob.", color: "lavender" },
  { icon: CalendarDays, title: "Jednostavno zakazivanje", text: "Izaberite svog ljubimca, veterinara i termin koji vam odgovara kroz PAWS portal.", color: "mint" },
];

export default function HomePage({ session }) {
  return <main className="home-page">
    <header className="home-nav">
      <a className="home-logo" href="#pocetna" aria-label="PAWS početna strana"><span className="home-logo-icon"><PawPrint size={21} /></span><span>PAWS<span className="home-logo-dot">.</span></span></a>
      <nav className="home-nav-links" aria-label="Glavna navigacija">
        <a href="#usluge">Naša briga</a>
        <a href="#o-nama">O nama</a>
        <a href="#kontakt">Kontakt</a>
      </nav>
      <div className="home-nav-actions">
        {session ? <Link className="home-login" to="/dashboard">Moj portal <ArrowRight size={15} /></Link> : <>
          <Link className="home-login" to="/login">Prijava</Link>
          <Link className="button primary home-register" to="/register">Registracija <ArrowRight size={15} /></Link>
        </>}
      </div>
    </header>

    <section className="home-hero" id="pocetna">
      <div className="hero-glow hero-glow-a" /><div className="hero-glow hero-glow-b" />
      <div className="hero-content">
        <div className="home-eyebrow"><span className="home-eyebrow-icon"><Heart size={13} fill="currentColor" /></span> VETERINARSKA AMBULANTA PAWS</div>
        <h1>Njihove šape.<br />Naše <span>srce.</span></h1>
        <p className="hero-description">Svaki ljubimac zaslužuje pažnju, nežnost i brigu koja počinje slušanjem. Tu smo da zajedno čuvamo svaki njihov radosni korak.</p>
        <div className="hero-actions">
          <a className="button primary hero-button" href="#usluge">Upoznajte naše usluge <ArrowRight size={17} /></a>
          <a className="hero-discover" href="#o-nama"><span><ArrowDown size={16} /></span> Više o nama</a>
        </div>
        <div className="hero-reassurance"><div className="reassurance-icon"><Heart size={15} /></div><div><strong>Pažnja za svakog ljubimca</strong><span>Jer su porodica, a ne samo šape.</span></div></div>
      </div>
      <div className="hero-visual" aria-label="Ilustracija ljubimca">
        <div className="hero-sun" />
        <div className="hero-image-frame">
          <img src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1100&q=85" alt="Pas koji radoznalo gleda u kameru" />
          <div className="hero-image-wash" />
        </div>
        <div className="floating-note note-top"><span className="floating-icon"><HeartPulse size={17} /></span><span><strong>Briga sa srcem</strong><small>U svakom susretu</small></span></div>
        <div className="floating-note note-bottom"><span className="floating-icon peach"><PawPrint size={17} /></span><span><strong>Mali koraci, veliko zdravlje</strong><small>Za srećnije zajedničke dane</small></span></div>
        <span className="visual-sparkle sparkle-left">✦</span><span className="visual-sparkle sparkle-right">✧</span>
      </div>
      <a className="hero-scroll" href="#usluge" aria-label="Skroluj do usluga"><span /> POMERITE NADOLE</a>
    </section>

    <section className="care-section" id="usluge">
      <div className="section-intro"><div className="home-eyebrow"><span className="home-eyebrow-icon"><PawPrint size={13} /></span> NEGA KOJA PRATI NJIHOVE POTREBE</div><h2>Sve za njihove<br /><span>zdrave i srećne dane.</span></h2><p>Od prvog upoznavanja do redovnih kontrola, tu smo da vam olakšamo brigu o onima koje volite.</p></div>
      <div className="service-grid">{services.map(({ icon: Icon, title, text, color }, index) => <article className="service-card" key={title}><div className={`service-icon ${color}`}><Icon size={21} /></div><span className="service-number">0{index + 1}</span><h3>{title}</h3><p>{text}</p><a href="#kontakt" aria-label={`Kontaktirajte nas: ${title}`}><ArrowRight size={16} /></a></article>)}</div>
    </section>

    <section className="about-section" id="o-nama">
      <div className="about-photo"><img src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1000&q=85" alt="Dva psa uživaju u zajedničkoj igri" /><div className="photo-caption"><PawPrint size={17} /><span>Svaki karakter je poseban.<br /><strong>I svaka priča nam je važna.</strong></span></div></div>
      <div className="about-copy"><div className="home-eyebrow"><span className="home-eyebrow-icon"><Heart size={13} fill="currentColor" /></span> DOBRODOŠLI U PAWS</div><h2>Briga počinje<br />poverenjem.</h2><p>Znamo da je vaš ljubimac mnogo više od kućnog ljubimca. Zato želimo da svaki dolazak u ambulantu bude prijatan, a svaki savet razumljiv i koristan.</p><div className="about-points"><div><span><Check size={14} /></span><p><strong>Topao pristup</strong><small>Sa strpljenjem i pažnjom prema svakom ljubimcu.</small></p></div><div><span><Check size={14} /></span><p><strong>Vaša briga, na jednom mestu</strong><small>Pratite ljubimce i termine kroz svoj PAWS nalog.</small></p></div><div><span><Check size={14} /></span><p><strong>Tu smo za vaša pitanja</strong><small>Otvorena komunikacija je deo dobre nege.</small></p></div></div><a className="about-link" href="#kontakt">Kontaktirajte PAWS <ArrowRight size={16} /></a></div>
    </section>

    <section className="home-appointment">
      <div className="appointment-paw"><PawPrint size={58} strokeWidth={1.2} /></div>
      <div><span>VREME JE ZA MALO VIŠE PAŽNJE?</span><h2>Njihov sledeći pregled počinje ovde.</h2><p>Napravite nalog i jednostavno zakažite termin za svog ljubimca.</p></div>
      <a className="button home-cta-button" href="#usluge">Pogledajte usluge <ArrowRight size={16} /></a>
    </section>

    <footer className="home-footer" id="kontakt">
      <div className="footer-brand"><a className="home-logo" href="#pocetna"><span className="home-logo-icon"><PawPrint size={19} /></span><span>PAWS<span className="home-logo-dot">.</span></span></a><p>Veterinarska ambulanta sa pažnjom<br />za svaki važan korak.</p></div>
      <div className="footer-contact"><span className="footer-heading">TU SMO ZA VAS</span><a href="mailto:zdravo@paws.rs">zdravo@paws.rs</a><span><Clock3 size={14} /> Za termine, posetite PAWS portal</span><span><MapPin size={14} /> Dobro došli u našu ambulantu</span></div>
      <div className="footer-action"><span>Vaš PAWS kutak za brigu o ljubimcima</span><a href="#pocetna">Nazad na početak <ArrowRight size={14} /></a></div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} PAWS Veterinarska ambulanta</span><span>Sa pažnjom, za svaku šapu <Heart size={12} fill="currentColor" /></span></div>
    </footer>
  </main>;
}
