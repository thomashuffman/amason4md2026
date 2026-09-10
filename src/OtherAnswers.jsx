import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import content from './surveyContent.json';

export default function OtherAnswers() {
  const [open, setOpen] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [attempt, setAttempt] = React.useState(0);
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const list = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    fetch(`/api/survey?view=other&page=${page}`, { cache: 'no-store', signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error();
        const result = await response.json();
        if (!Array.isArray(result.answers)) throw new Error();
        if (!controller.signal.aborted) {
          setData(result);
          if (list.current) list.current.scrollTop = 0;
        }
      })
      .catch(() => { if (!controller.signal.aborted) setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [open, page, attempt]);
  return (
    <details className="other-answers" onToggle={event => setOpen(event.currentTarget.open)}>
      <summary>{content.otherAnswersLabel}</summary>
      <div className="other-answers-body" aria-busy={loading}>
        {loading && <p role="status">{content.loading}</p>}
        {error && <div role="alert"><p>{content.resultsError}</p><button type="button" className="survey-text-button" onClick={() => setAttempt(value => value + 1)}>{content.retry}</button></div>}
        {!loading && !error && data && <>
          {data.answers.length === 0 ? <p>{content.otherEmpty}</p> : (
            <ul ref={list} className="other-answer-list" tabIndex={0} aria-label={content.otherAnswersLabel}>
              {data.answers.map((answer, index) => <li key={`${page}-${index}`}>{answer}</li>)}
            </ul>
          )}
          <div className="other-pagination">
            <button type="button" disabled={page === 0} aria-label={content.previousPage} title={content.previousPage} onClick={() => setPage(value => value - 1)}><ChevronLeft size={18} /></button>
            <span aria-live="polite">{content.otherPage.replace('{page}', page + 1)}</span>
            <button type="button" disabled={!data.hasMore} aria-label={content.nextPage} title={content.nextPage} onClick={() => setPage(value => value + 1)}><ChevronRight size={18} /></button>
          </div>
        </>}
      </div>
    </details>
  );
}
