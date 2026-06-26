import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Construction,
  ExternalLink,
  GraduationCap,
  Handshake,
  Landmark,
  Mail,
  MapPin,
  Menu,
  ShieldCheck,
  Trash2,
  WalletCards,
  X,
  Zap
} from 'lucide-react';
import './styles.css';

const images = {
  endorsement: '/def5b3_20443aee018547d7a2447072030763e1~mv2.avif',
  sign: '/IMG_0373_HEIC.avif',
  termLimits: '/0CAD1D60-EF74-4400-9C54-E35EA6C85826_JPG.avif',
  army: '/Army.avif',
  baltimore: '/baltimore-hero.png'
};

const issues = [
  {
    icon: Landmark,
    title: 'Fighting for Our Democracy',
    text: 'Jeremy will work to create three individual delegate districts, establish independent congressional districting, support term limits, and open primaries.'
  },
  {
    icon: WalletCards,
    title: 'Reducing Cost of Living',
    text: 'He will fight lower income taxes, oppose junk fees, and make home ownership in Baltimore more attainable for young people and working families.'
  },
  {
    icon: GraduationCap,
    title: 'Improving Our Schools',
    text: 'As the husband of a Baltimore City teacher, Jeremy will push for support staff, social workers, and classroom-first education spending.'
  },
  {
    icon: Construction,
    title: 'Investing in Infrastructure',
    text: 'He will work to repave roads, repair bridges, improve sidewalks and crosswalks, and make driving, walking, and biking safer.'
  },
  {
    icon: Zap,
    title: 'Lowering Utility Costs',
    text: 'Jeremy will take on rising BGE bills, pause utility and gasoline taxes, and press for power-grid updates before new data centers move forward.'
  },
  {
    icon: Trash2,
    title: 'Cleaning Our Streets',
    text: 'Jeremy picks up trash around his neighborhood and wants temporary jobs that clean streets and sidewalks across Baltimore and Maryland.'
  }
];

const neighborhoods = [
  'Bayview',
  'Brewers Hill',
  'Brooklyn',
  'Butchers Hill',
  'Canton',
  'Cherry Hill',
  'Federal Hill',
  "Fell's Point",
  'Graceland Park',
  'Greektown',
  'Harbor East',
  'Highlandtown',
  'Jonestown',
  'Lakeland',
  'Little Italy',
  'Locust Point',
  'McElderry Park',
  'Mt. Winans',
  'Otterbein',
  'Patterson Park',
  'Riverside',
  'St. Helena',
  'Westport'
];

function App() {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Jeremy Amason campaign home">
          <span className="brand-mark">JA</span>
          <span>
            <strong>Jeremy L. Amason</strong>
            <small>Maryland House District 46</small>
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
          <a href="#about" onClick={() => setMenuOpen(false)}>Get to Know Jeremy</a>
          <a href="#issues" onClick={() => setMenuOpen(false)}>Issues</a>
          <a href="#district" onClick={() => setMenuOpen(false)}>46th District</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
          <a className="nav-cta" href="mailto:amason4md2026@gmail.com" onClick={() => setMenuOpen(false)}>Get Involved</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Moderate Republican for 2026</p>
          <h1>Jeremy L. Amason for Maryland House District 46</h1>
          <p className="hero-text">
            Vote for a Better Baltimore with pragmatic leadership focused on
            democracy, affordability, schools, infrastructure, utility costs,
            and cleaner streets.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="https://elections.maryland.gov/voter_registration/application.html" target="_blank" rel="noreferrer">
              Register to vote <ArrowRight size={18} />
            </a>
            <a className="button secondary" href="mailto:amason4md2026@gmail.com">
              Request a sign
            </a>
          </div>
        </div>

        <div className="hero-media">
          <img className="hero-portrait" src={images.endorsement} alt="Jeremy Amason Forward Party endorsement graphic" />
          <div className="hero-note">
            <BadgeCheck size={20} />
            <span>Proudly endorsed by the Maryland Forward Party</span>
          </div>
        </div>
      </section>

      <section className="intro-band" aria-label="Campaign highlights">
        <div>
          <strong>District 46</strong>
          <span>Baltimore City neighborhoods</span>
        </div>
        <div>
          <strong>Veteran</strong>
          <span>Army aviation officer and UH-60 pilot</span>
        </div>
        <div>
          <strong>Coach</strong>
          <span>Consultant and high school basketball coach</span>
        </div>
      </section>

      <section className="section about" id="about">
        <div className="about-copy">
          <p className="eyebrow">Who I Am</p>
          <h2>Veteran. Coach. Leader.</h2>
          <p>
            Jeremy was raised in metro-Baltimore. He used an ROTC scholarship to
            attend Indiana University and commissioned as a U.S. Army Aviation
            Officer in 2019.
          </p>
          <p>
            He served as an Aviation Officer and UH-60 Blackhawk Pilot until
            2024. After leaving the military, Jeremy moved back to Baltimore,
            where he works as a consultant and high school basketball coach. His
            wife is a Baltimore City Public School teacher in Cherry Hill.
          </p>
        </div>
        <figure className="image-panel">
          <img src={images.army} alt="Jeremy Amason with fellow soldiers in front of a UH-60 helicopter" />
          <figcaption>Army aviation service informs Jeremy's approach to practical leadership.</figcaption>
        </figure>
      </section>

      <section className="section stand-for">
        <div className="section-heading">
          <p className="eyebrow">What I Stand For</p>
          <h2>Baltimore deserves new and pragmatic leadership in Annapolis.</h2>
        </div>
        <div className="statement-grid">
          <p>
            Jeremy believes in improving our democracy, empowering more of
            Baltimore's neighborhoods to choose their own leaders, improving
            city schools, making Baltimore more affordable, and improving roads
            and pedestrian infrastructure.
          </p>
          <p>
            He chose to run in the fall of 2025 because Baltimore deserves a
            choice at the polls. Jeremy believes common-sense action can improve
            day-to-day life for everyone in the 46th District.
          </p>
        </div>
      </section>

      <section className="section" id="issues">
        <div className="section-heading">
          <p className="eyebrow">The Issues</p>
          <h2>Common-sense priorities for the 46th District.</h2>
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
          <p className="eyebrow">46th District</p>
          <h2>Neighborhoods across South and Southeast Baltimore.</h2>
          <p>
            District 46 includes communities from Bayview and Brewers Hill to
            Cherry Hill, Federal Hill, Patterson Park, Riverside, Westport, and
            more.
          </p>
          <a className="text-link" href="https://mgaleg.maryland.gov/mgawebsite/members/district" target="_blank" rel="noreferrer">
            Find your district <ExternalLink size={16} />
          </a>
        </div>
        <div className="neighborhoods">
          {neighborhoods.map((name) => (
            <span key={name}><MapPin size={15} /> {name}</span>
          ))}
        </div>
      </section>

      <section className="section media-row">
        <figure className="image-panel sign-panel">
          <img src={images.sign} alt="Jeremy Amason District 46 campaign yard sign" />
          <figcaption>Live in District 46 and want a sign?</figcaption>
        </figure>
        <div className="media-copy">
          <p className="eyebrow">Social and Get Involved</p>
          <h2>Help build a better Baltimore.</h2>
          <p>
            Follow the campaign, request a sign, or reach out to get involved
            across District 46.
          </p>
          <div className="link-list">
            <a href="https://www.facebook.com/JeremyAmasonForDelegate" target="_blank" rel="noreferrer">
              Facebook <ExternalLink size={16} />
            </a>
            <a href="https://www.instagram.com/amason4md2026/" target="_blank" rel="noreferrer">
              Instagram <ExternalLink size={16} />
            </a>
            <a href="mailto:amason4md2026@gmail.com">
              Email the campaign <Mail size={16} />
            </a>
          </div>
        </div>
      </section>

      <section className="section endorsement" id="contact">
        <div>
          <p className="eyebrow">Endorsement</p>
          <h2>Proudly endorsed by the Maryland Forward Party.</h2>
          <p>
            Jeremy aligned with the Maryland Forward Party because of a shared
            commitment to returning power to the people and solving problems
            with fresh leadership.
          </p>
          <a className="button secondary" href="https://www.marylandforwardparty.com/" target="_blank" rel="noreferrer">
            Maryland Forward Party <ExternalLink size={17} />
          </a>
        </div>
        <img src={images.termLimits} alt="Jeremy Amason term limits pledge graphic" />
      </section>

      <footer className="site-footer">
        <div>
          <strong>Jeremy L. Amason for Maryland House District 46</strong>
          <p>Authority: Friends of Jeremy Amason. Megan Amason, Treasurer.</p>
        </div>
        <a href="mailto:amason4md2026@gmail.com"><Mail size={17} /> amason4md2026@gmail.com</a>
        <span><Handshake size={17} /> Vote for a Better Baltimore</span>
        <span><CheckCircle2 size={17} /> 2026 Primary Election</span>
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
