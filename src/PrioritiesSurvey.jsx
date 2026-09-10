import React from 'react';
import { ArrowRight, ArrowLeft, BarChart3, CheckCircle2 } from 'lucide-react';
import './survey.css';
import content from './surveyContent.json';
import MessageJeremy from './MessageJeremy';

const { options } = content;

const receiptKey = 'priorities-survey-v1';

function readReceipt() {
  try { return JSON.parse(localStorage.getItem(receiptKey)) || {}; }
  catch { return {}; }
}

export default function PrioritiesSurvey() {
  const [selected, setSelected] = React.useState([]);
  const [otherText, setOtherText] = React.useState('');
  const [submitted, setSubmitted] = React.useState(() => readReceipt().saved === true);
  const [view, setView] = React.useState(() => readReceipt().saved ? 'results' : 'form');
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const requestId = React.useRef(readReceipt().id);
  const inFlight = React.useRef(false);
  const heading = React.useRef(null);
  React.useLayoutEffect(() => {
    if (window.location.hash !== '#your-priorities') return;
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    let frame;
    let stopped = false;
    const section = document.getElementById('your-priorities');
    const alignSurvey = () => {
      if (stopped) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          if (!stopped && window.location.hash === '#your-priorities') {
            section?.scrollIntoView({ behavior: 'instant', block: 'start' });
          }
        });
      });
    };
    // Watch late image layout without overriding a visitor's own scrolling.
    const observer = new ResizeObserver(alignSurvey);
    for (let element = section?.previousElementSibling; element; element = element.previousElementSibling) {
      observer.observe(element);
    }
    const stop = () => {
      stopped = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.history.scrollRestoration = previousRestoration;
    };
    const interactionEvents = ['touchstart', 'pointerdown', 'wheel', 'keydown', 'hashchange'];
    interactionEvents.forEach(type => window.addEventListener(type, stop, { passive: true }));
    const timeout = window.setTimeout(stop, 15000);
    document.fonts.ready.then(alignSurvey);
    alignSurvey();
    // Align after image layout and browser page restoration have settled.
    window.addEventListener('load', alignSurvey, { once: true });
    window.addEventListener('pageshow', alignSurvey);
    return () => {
      stop();
      clearTimeout(timeout);
      interactionEvents.forEach(type => window.removeEventListener(type, stop));
      window.removeEventListener('load', alignSurvey);
      window.removeEventListener('pageshow', alignSurvey);
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);
  const loadResults = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/survey', { cache: 'no-store' });
      if (!response.ok) throw new Error();
      const result = await response.json();
      if (!Number.isInteger(result.total) || result.total < 0 || !result.counts) throw new Error();
      setData(result);
    } catch { setError(content.resultsError); }
    finally { setLoading(false); }
  }, []);
  React.useEffect(() => {
    if (view === 'results') loadResults();
  }, [view, loadResults]);
  const changeView = (next) => {
    setError('');
    setView(next);
    requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true });
      document.getElementById('your-priorities')?.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
  };
  const toggle = (id) => {
    setSelected((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : current.length < 3 ? [...current, id] : current);
  };
  const submit = async (event) => {
    event.preventDefault();
    if (selected.length !== 3 || (selected.includes('other') && !otherText.trim()) || submitted || inFlight.current) return;
    inFlight.current = true;
    setSaving(true);
    setError('');
    try {
      requestId.current ||= crypto.randomUUID();
      try { localStorage.setItem(receiptKey, JSON.stringify({ id: requestId.current })); } catch { /* In-memory retry protection remains available. */ }
      const response = await fetch('/api/survey', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: requestId.current, choices: selected, otherText: selected.includes('other') ? otherText : undefined })
      });
      if (!response.ok || !(await response.json()).saved) throw new Error();
      try { localStorage.setItem(receiptKey, JSON.stringify({ id: requestId.current, saved: true })); } catch { /* Storage may be disabled by the browser. */ }
      setSubmitted(true);
      changeView('results');
    } catch { setError(content.submitError); }
    finally { inFlight.current = false; setSaving(false); }
  };
  const total = data?.total ?? 0;
  const results = options.map(({ id, title }) => ({
    id, title,
    percent: total ? Math.round((data.counts[id] ?? 0) / total * 100) : 0
  })).sort((a, b) => b.percent - a.percent);

  return (
    <section className="section priorities-survey" id="your-priorities" aria-labelledby="survey-title">
      <div className="survey-inner">
        <div className="survey-topline"><p className="eyebrow">{content.sectionLabel}</p><MessageJeremy /></div>
        <h2 id="survey-title" ref={heading} tabIndex={-1}>
          {view === 'form' ? content.formTitle : content.resultsTitle}
        </h2>
        <p className="survey-sponsor">{content.sponsor}</p>
        <p className="survey-sponsor">{content.privacyNotice}</p>
        {data?.environment === 'preview' && <p className="survey-demo">{content.stagingNotice}</p>}

        {view === 'form' ? (
          <form onSubmit={submit} aria-busy={saving}>
            <fieldset className="survey-fieldset" disabled={saving}>
              <legend>{submitted ? content.reviewNotice : content.question}</legend>
              <div className="survey-toolbar">
                <span role="status">{submitted ? content.responseSaved : content.selectionCount.replace('{count}', selected.length)}{!submitted && selected.length === 3 ? ` · ${content.selectionLimitHint}` : ''}</span>
                <button className="survey-text-button" type="button" onClick={() => changeView('results')}>
                  <BarChart3 size={15} aria-hidden="true" /> {content.viewResponses}
                </button>
              </div>
              <div className="survey-options">
                {options.map(({ id, title, description }) => {
                  if (submitted) return (
                    <details className="survey-option survey-review-option" key={id}>
                      <summary>{title}</summary>
                      <p className="survey-description">{description}</p>
                    </details>
                  );
                  const checked = selected.includes(id);
                  return (
                    <div className={`survey-option${checked ? ' is-selected' : ''}`} key={id}>
                      <label>
                        <input type="checkbox" checked={checked} onChange={() => toggle(id)} disabled={!checked && selected.length === 3} aria-describedby={checked ? `${id}-description` : undefined} />
                        <span>{title}</span>
                      </label>
                      {checked && <p id={`${id}-description`} className="survey-description">{description}</p>}
                      {checked && id === 'other' && <div className="survey-other-input">
                        <label htmlFor="other-issue">{content.otherLabel}</label>
                        <input id="other-issue" type="text" required maxLength={50} value={otherText} onChange={event => setOtherText(event.target.value)} aria-describedby="other-hint other-count" />
                        <div id="other-count" className="other-count">{otherText.length}/50</div>
                        <p id="other-hint">{content.otherHint}</p>
                      </div>}
                    </div>
                  );
                })}
              </div>
            </fieldset>
            {!submitted && <div className="survey-actions">
              <button className="button primary" type="submit" disabled={selected.length !== 3 || (selected.includes('other') && !otherText.trim()) || saving}>{saving ? content.saving : content.submitResponse} <ArrowRight size={18} aria-hidden="true" /></button>
              <span>{content.selectionHint}</span>
            </div>}
            {error && <p className="survey-error" role="alert">{error}</p>}
          </form>
        ) : (
          <div>
            {submitted && <div className="survey-thanks" role="status"><CheckCircle2 size={22} aria-hidden="true" /><div><strong>{content.thankYouTitle}</strong><p>{content.thankYouMessage}</p></div></div>}
            {loading && <p role="status">{content.loading}</p>}
            {error && <div className="survey-error" role="alert"><p>{error}</p><button className="survey-text-button" type="button" onClick={loadResults}>{content.retry}</button></div>}
            {!loading && !error && data && <>
            <div className="survey-results-heading">
              <h3>{content.chartTitle}</h3>
            </div>
            <p className="survey-chart-note">{content.chartNote}</p>
            {total === 0 && <p>{content.emptyResults}</p>}
            <ol className="survey-chart" aria-label={content.chartAccessibleLabel}>
              {results.map(({ id, title, percent }) => (
                <li key={id}>
                  <div className="survey-bar-label"><span>{title}</span><strong>{percent}%</strong></div>
                  <div className="survey-bar-track" aria-hidden="true"><div style={{ width: `${percent}%` }} /></div>
                </li>
              ))}
            </ol>
            </>}
            <div className="survey-result-actions">
              <button className="survey-text-button" type="button" onClick={() => changeView('form')}><ArrowLeft size={16} aria-hidden="true" />{content.backToSurvey}</button>
              {submitted && <button className="survey-text-button" type="button" disabled={loading} onClick={loadResults}>{content.refreshResults}</button>}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
