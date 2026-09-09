import React from 'react';
import { ArrowRight, ArrowLeft, BarChart3, CheckCircle2 } from 'lucide-react';
import './survey.css';
import content from './surveyContent.json';

const { options } = content;

// Fictional totals for a local preview, never presented as actual responses.
const sampleCounts = {
  'cost-of-living': 68, housing: 54, utilities: 43, crime: 38, budget: 30,
  education: 26, infrastructure: 18, 'campaign-finance': 9, democracy: 8, districting: 6
};

export default function PrioritiesSurvey() {
  const [selected, setSelected] = React.useState([]);
  const [submitted, setSubmitted] = React.useState(false);
  const [view, setView] = React.useState('form');
  const heading = React.useRef(null);
  React.useEffect(() => {
    if (window.location.hash !== '#your-priorities') return;
    const frame = requestAnimationFrame(() => {
      document.getElementById('your-priorities')?.scrollIntoView({ behavior: 'instant' });
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  const changeView = (next) => {
    setView(next);
    requestAnimationFrame(() => heading.current?.focus());
  };
  const toggle = (id) => {
    setSelected((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : current.length < 3 ? [...current, id] : current);
  };
  const total = 100 + (submitted ? 1 : 0);
  const results = options.map(({ id, title }) => ({
    id, title,
    percent: Math.round(((sampleCounts[id] ?? 0) + (submitted && selected.includes(id) ? 1 : 0)) / total * 100)
  })).sort((a, b) => b.percent - a.percent);

  return (
    <section className="section priorities-survey" id="your-priorities" aria-labelledby="survey-title">
      <div className="survey-inner">
        <p className="eyebrow">{content.sectionLabel}</p>
        <h2 id="survey-title" ref={heading} tabIndex={-1}>
          {view === 'form' ? content.formTitle : content.resultsTitle}
        </h2>
        <p className="survey-sponsor">{content.sponsor}</p>
        <p className="survey-demo">{content.demoNotice}</p>

        {view === 'form' ? (
          <form onSubmit={(event) => {
            event.preventDefault();
            if (selected.length !== 3 || submitted) return;
            setSubmitted(true);
            changeView('results');
          }}>
            <fieldset className="survey-fieldset">
              <legend>{content.question}</legend>
              <div className="survey-toolbar">
                <span role="status">{content.selectionCount.replace('{count}', selected.length)}{selected.length === 3 ? ` · ${content.selectionLimitHint}` : ''}</span>
                <button className="survey-text-button" type="button" onClick={() => changeView('results')}>
                  <BarChart3 size={15} aria-hidden="true" /> {content.viewResponses}
                </button>
              </div>
              <div className="survey-options">
                {options.map(({ id, title, description }) => {
                  const checked = selected.includes(id);
                  return (
                    <div className={`survey-option${checked ? ' is-selected' : ''}`} key={id}>
                      <label>
                        <input type="checkbox" checked={checked} onChange={() => toggle(id)} disabled={!checked && selected.length === 3} aria-describedby={checked ? `${id}-description` : undefined} />
                        <span>{title}</span>
                      </label>
                      {checked && <p id={`${id}-description`} className="survey-description">{description}</p>}
                    </div>
                  );
                })}
              </div>
            </fieldset>
            <div className="survey-actions">
              <button className="button primary" type="submit" disabled={selected.length !== 3}>{content.submitResponse} <ArrowRight size={18} aria-hidden="true" /></button>
              <span>{content.selectionHint}</span>
            </div>
          </form>
        ) : (
          <div>
            {submitted && <div className="survey-thanks" role="status"><CheckCircle2 size={22} aria-hidden="true" /><div><strong>{content.thankYouTitle}</strong><p>{content.thankYouMessage}</p></div></div>}
            <div className="survey-results-heading">
              <h3>{content.chartTitle}</h3>
              <span>{(submitted ? content.submittedResponseCount : content.sampleResponseCount).replace('{count}', total)}</span>
            </div>
            <p className="survey-chart-note">{content.chartNote}</p>
            <ol className="survey-chart" aria-label={content.chartAccessibleLabel}>
              {results.map(({ id, title, percent }) => (
                <li key={id}>
                  <div className="survey-bar-label"><span>{title}</span><strong>{percent}%</strong></div>
                  <div className="survey-bar-track" aria-hidden="true"><div style={{ width: `${percent}%` }} /></div>
                </li>
              ))}
            </ol>
            <button className="survey-text-button" type="button" onClick={() => {
              if (submitted) { setSubmitted(false); setSelected([]); }
              changeView('form');
            }}><ArrowLeft size={16} aria-hidden="true" />{submitted ? content.tryAgain : content.backToSurvey}</button>
          </div>
        )}
      </div>
    </section>
  );
}
