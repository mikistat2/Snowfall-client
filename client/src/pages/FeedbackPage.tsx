import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api, apiErrorMessage } from '../lib/api';
import { t } from '../i18n/strings';

/**
 * Feedback / Improvement page. Submits to the server, which emails the
 * feedback (with gym name + submitter contact attached) straight to the
 * product owner — the admin never leaves the app or opens a mail client.
 */
export function FeedbackPage() {
  const [category, setCategory] = useState('suggestion');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const categories = [
    { value: 'suggestion', label: t('feedback.suggestion') },
    { value: 'bug', label: t('feedback.bug') },
    { value: 'improvement', label: t('feedback.improvement') },
    { value: 'other', label: t('feedback.other') },
  ];

  const mutation = useMutation({
    mutationFn: async () =>
      api.post('/feedback', { category, subject: subject || undefined, message }),
    onSuccess: () => {
      setSubject('');
      setMessage('');
      setCategory('suggestion');
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (message.trim().length > 0) mutation.mutate();
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">{t('feedback.title')}</h1>
      <p className="text-sm text-slate-600">{t('feedback.intro')}</p>

      <form onSubmit={onSubmit} className="card space-y-4">
        {mutation.isSuccess && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{t('feedback.thanks')}</p>
        )}
        {mutation.isError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{apiErrorMessage(mutation.error)}</p>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">{t('feedback.category')}</label>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">{t('feedback.subject')}</label>
            <input
              className="input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Short summary"
            />
          </div>
        </div>
        <div>
          <label className="label">{t('feedback.message')}</label>
          <textarea
            className="input min-h-[160px] resize-y"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('feedback.messagePlaceholder')}
            required
          />
        </div>

        <button className="btn-primary" disabled={mutation.isPending || message.trim().length === 0}>
          {mutation.isPending ? t('feedback.sending') : t('feedback.send')}
        </button>
      </form>
    </div>
  );
}
