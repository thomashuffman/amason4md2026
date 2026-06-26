import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowRight,
  CheckCircle2,
  HeartHandshake,
  Home,
  Mail,
  MapPin,
  Megaphone,
  Menu,
  ShieldCheck,
  Users,
  X
} from 'lucide-react';
import './styles.css';

const issues = [
  {
    icon: Home,
    title: 'Affordable Housing',
    text: 'Expand housing stability, protect renters, and support pathways to ownership for Baltimore families.'
  },
  {
    icon: ShieldCheck,
    title: 'Public Safety',
    text: 'Invest in accountable prevention, neighborhood services, and the public systems that keep residents safe.'
  },
  {
    icon: HeartHandshake,
    title: 'Health Care',
    text: 'Champion accessible care, mental health support, and better health outcomes across District 40.'
  },
  {
    icon: Users,
    title: 'Youth & Education',
    text: 'Create stronger opportunities for students, families, educators, and young people entering the workforce.'
  }
];

const neighborhoods = [
  'Bolton Hill',
  'Reservoir Hill',
  'Upton',
  'Sandtown-Winchester',
  'Druid Heights',
  'Mondawmin',
  'Hanlon',
  'Ashburton',
  'Woodberry'
];

function App() {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Paris Gray Amason campaign home">
          <span className="brand-mark">PGA</span>
          <span>
            <strong>Paris Gray Amason</strong>
            <small>Maryland Delegate, District 40</small>
          </span>
        </a>

        <button
          className="menu-button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className={menuOpen ? 'nav nav-open' : 'nav'}>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
          <a href="#issues" onClick={() => setMenuOpen(false)}>Issues</a>
          <a href="#district" onClick={() => setMenuOpen(false)}>District</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
          <a className="nav-cta" href="#volunteer" onClick={() => setMenuOpen(false)}>Get Involved</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-media" aria-hidden="true">
          <div className="portrait-frame">
            <div className="portrait-placeholder">Campaign Photo</div>
          </div>
        </div>

        <div className="hero-copy">
          <p className="eyebrow">Democrat for Maryland House of Delegates</p>
          <h1>Paris Gray Amason for District 40</h1>
          <p className="hero-text">
            Vote for a better Baltimore with a campaign focused on housing, safety,
            health care, education, and opportunity in every neighborhood.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#volunteer">
              Join the campaign <ArrowRight size={18} />
            </a>
            <a className="button secondary" href="#issues">Explore priorities</a>
          </div>
        </div>
      </section>

      <section className="intro-band" aria-label="Campaign highlights">
        <div>
          <strong>District 40</strong>
          <span>Baltimore City communities</span>
        </div>
        <div>
          <strong>2026</strong>
          <span>Maryland election cycle</span>
        </div>
        <div>
          <strong>People first</strong>
          <span>Housing, health, safety, youth</span>
        </div>
      </section>

      <section className="section split" id="about">
        <div>
          <p className="eyebrow">Meet Paris</p>
          <h2>Leadership rooted in service, community, and Baltimore’s future.</h2>
        </div>
        <div className="prose">
          <p>
            This starter template gives the campaign a modern foundation with clear
            messaging, mobile-friendly navigation, and sections that can grow as the
            platform, photos, endorsements, and donation workflows are finalized.
          </p>
          <p>
            Replace this copy with the official biography, campaign story, and
            approved language before launch.
          </p>
        </div>
      </section>

      <section className="section" id="issues">
        <div className="section-heading">
          <p className="eyebrow">Priorities</p>
          <h2>A platform built around everyday quality of life.</h2>
        </div>
        <div className="issue-grid">
          {issues.map(({ icon: Icon, title, text }) => (
            <article className="issue-card" key={title}>
              <Icon size={24} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section district" id="district">
        <div className="district-copy">
          <p className="eyebrow">District 40</p>
          <h2>Representing Baltimore neighborhoods with urgency and care.</h2>
          <p>
            The district section can become an interactive map, neighborhood guide,
            event list, or voter information hub.
          </p>
        </div>
        <div className="neighborhoods">
          {neighborhoods.map((name) => (
            <span key={name}><MapPin size={15} /> {name}</span>
          ))}
        </div>
      </section>

      <section className="section action-panel" id="volunteer">
        <div>
          <p className="eyebrow">Get involved</p>
          <h2>Help build momentum across Baltimore.</h2>
          <p>
            Add links here for donations, volunteer shifts, lawn signs, events, and
            email signup once those services are selected.
          </p>
        </div>
        <form className="signup-form">
          <label>
            Name
            <input type="text" name="name" placeholder="Your name" />
          </label>
          <label>
            Email
            <input type="email" name="email" placeholder="you@example.com" />
          </label>
          <button className="button primary" type="button">
            <Megaphone size={18} /> Sign me up
          </button>
        </form>
      </section>

      <footer className="site-footer" id="contact">
        <div>
          <strong>Paris Gray Amason for Maryland Delegate</strong>
          <p>Authority: Friends of Paris Gray Amason. Treasurer details go here.</p>
        </div>
        <a href="mailto:info@example.com"><Mail size={17} /> info@example.com</a>
        <span><CheckCircle2 size={17} /> Built as a React starter template</span>
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
