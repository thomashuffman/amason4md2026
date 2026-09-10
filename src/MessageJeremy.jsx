import React from 'react';
import { Mail, Send, X, CheckCircle2 } from 'lucide-react';
import copy from './messageContent.json';

const MessageContext = React.createContext(null);

export default function MessageJeremy({ children, className = 'survey-message-button', onClick }) {
  const open = React.useContext(MessageContext);
  return <button type="button" className={className} onClick={event => {
    const trigger = event.currentTarget;
    onClick?.(event);
    open(trigger);
  }}>{children || <><Mail size={17} aria-hidden="true" />{copy.button}</>}</button>;
}

export function MessageProvider({ children }) {
  const dialog = React.useRef(null);
  const trigger = React.useRef(null);
  const attempt = React.useRef(null);
  const busy = React.useRef(false);
  const [availability, setAvailability] = React.useState('checking');
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState('');
  const [draft, setDraft] = React.useState({ name: '', email: '', subject: '', message: '', website: '' });

  const checkAvailability = async () => {
    setAvailability('checking');
    try {
      const response = await fetch('/api/message', { cache: 'no-store' });
      if (!response.ok) throw new Error();
      setAvailability((await response.json()).available ? 'ready' : 'unavailable');
    } catch { setAvailability('error'); }
  };
  const close = () => {
    if (busy.current) return;
    dialog.current.close();
    trigger.current?.focus({ preventScroll: true });
  };
  const submit = async event => {
    event.preventDefault();
    if (availability !== 'ready' || busy.current || sent) return;
    busy.current = true;
    setSending(true);
    setError('');
    try {
      const fingerprint = JSON.stringify(draft);
      if (attempt.current?.fingerprint !== fingerprint) attempt.current = { fingerprint, id: crypto.randomUUID() };
      const response = await fetch('/api/message', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...draft, id: attempt.current.id })
      });
      if (!response.ok) {
        setError(response.status === 429 ? copy.rateLimit : response.status === 400 ? copy.invalid : copy.sendError);
        return;
      }
      if (!(await response.json()).sent) throw new Error();
      setSent(true);
      setDraft({ name: '', email: '', subject: '', message: '', website: '' });
      requestAnimationFrame(() => dialog.current.querySelector('button')?.focus());
    } catch { setError(copy.sendError); }
    finally { busy.current = false; setSending(false); }
  };
  const field = (key, label, type = 'text', maxLength = 80) => (
    <label className="message-field" htmlFor={`message-${key}`}>
      <span>{label}</span>
      <input id={`message-${key}`} type={type} required maxLength={maxLength} autoComplete={key === 'name' || key === 'email' ? key : 'off'} value={draft[key]} onChange={event => setDraft(current => ({ ...current, [key]: event.target.value }))} />
    </label>
  );
  const open = element => {
      trigger.current = element;
      setSent(false);
      setError('');
      dialog.current.showModal();
      checkAvailability();
  };
  return <MessageContext.Provider value={open}>
    {children}
    <dialog ref={dialog} className="message-dialog" aria-labelledby="message-title" onCancel={event => { event.preventDefault(); close(); }}>
      <div className="message-dialog-heading">
        <h2 id="message-title">{copy.title}</h2>
        <button className="message-close" type="button" disabled={sending} aria-label={copy.close} title={copy.close} onClick={close}><X size={20} /></button>
      </div>
      <p className="message-recipient">{copy.recipient}</p>
      {sent ? <div className="message-success" role="status"><CheckCircle2 size={26} /><h3>{copy.successTitle}</h3><p>{copy.success}</p><button type="button" className="button primary" onClick={close}>{copy.done}</button></div> : (
        <form onSubmit={submit} aria-busy={sending}>
          {availability === 'checking' && <p role="status">{copy.checking}</p>}
          {availability === 'unavailable' && <p className="message-notice" role="status">{copy.unavailable}</p>}
          {availability === 'error' && <div role="alert"><p>{copy.statusError}</p><button type="button" className="survey-text-button" onClick={checkAvailability}>{copy.retry}</button></div>}
          <fieldset disabled={sending} className="message-fields">
            {field('name', copy.name)}
            {field('email', copy.email, 'email', 254)}
            {field('subject', copy.subject, 'text', 120)}
            <label className="message-field" htmlFor="message-body"><span>{copy.message}</span><textarea id="message-body" required maxLength={3000} rows={5} value={draft.message} onChange={event => setDraft(current => ({ ...current, message: event.target.value }))} /></label>
            <span className="message-counter">{draft.message.length}/3000</span>
            <div className="message-trap" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={draft.website} onChange={event => setDraft(current => ({ ...current, website: event.target.value }))} /></label></div>
          </fieldset>
          <p className="message-privacy">{copy.privacy}</p>
          {error && <p className="survey-error" role="alert">{error}</p>}
          <button type="submit" className="button primary" disabled={sending || availability !== 'ready'}><Send size={17} aria-hidden="true" />{sending ? copy.sending : copy.send}</button>
        </form>
      )}
    </dialog>
  </MessageContext.Provider>;
}
