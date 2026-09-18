import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircleIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { AppNav } from '../components/layout/AppNav';
import { Button, buttonClasses } from '../components/ui/Button';
import { inputClasses, inputErrorClasses } from '../components/ui/Input';
import { twMerge } from 'tailwind-merge';
import { usePolls } from '../contexts/PollsContext';

function draft(value = '') {
  return { key: Math.random().toString(36).slice(2, 8), value };
}

export function CreatePoll() {
  const navigate = useNavigate();
  const { createPoll } = usePolls();

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([draft(), draft()]);
  const [allowOneVote, setAllowOneVote] = useState(true);
  const [questionError, setQuestionError] = useState('');
  const [optionErrors, setOptionErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateOption = (key, value) =>
    setOptions((prev) => prev.map((o) => (o.key === key ? { ...o, value } : o)));

  const removeOption = (key) =>
    setOptions((prev) => (prev.length <= 2 ? prev : prev.filter((o) => o.key !== key)));

  const submit = async (event) => {
    event.preventDefault();

    const nextOptionErrors = {};
    options.forEach((o) => {
      if (!o.value.trim()) nextOptionErrors[o.key] = 'Option cannot be empty.';
    });

    const filled = options.filter((o) => o.value.trim().length > 0);
    setQuestionError(question.trim() ? '' : 'Question is required.');
    setOptionErrors(nextOptionErrors);
    setFormError(filled.length < 2 ? 'Please add at least two options.' : '');

    if (!question.trim() || Object.keys(nextOptionErrors).length > 0 || filled.length < 2) return;

    setLoading(true);
    try {
      const poll = await createPoll({
        question,
        options: filled.map((o) => o.value),
        allowOneVote,
      });
      toast.success('Poll created successfully!');
      navigate(`/polls/${poll.id}/created`);
    } catch (err) {
      setFormError(err.message || 'Could not create poll. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-full w-full flex-col bg-canvas">
      <AppNav />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 lg:py-10">
        <h1 className="text-[26px] font-extrabold tracking-tight text-ink sm:text-3xl">
          Create a New Poll
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
          Ask a question and add the options you want your audience to vote on.
        </p>

        <form onSubmit={submit} noValidate className="mt-8 space-y-5">
          {/* Question */}
          <section className="rounded-xl border border-line bg-white p-5 shadow-card sm:p-6">
            <label htmlFor="poll-question" className="block text-sm font-bold text-ink">
              Question
            </label>
            <p className="mt-1 text-xs text-ink-subtle">Keep it short and specific.</p>
            <input
              id="poll-question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What programming language do you prefer?"
              aria-invalid={questionError ? true : undefined}
              aria-describedby={questionError ? 'poll-question-error' : undefined}
              className={twMerge(
                inputClasses,
                'mt-3 h-12 text-[15px]',
                questionError ? inputErrorClasses : ''
              )}
            />
            {questionError ? (
              <p
                id="poll-question-error"
                className="mt-2 flex items-center gap-1.5 text-xs font-medium text-danger-600"
              >
                <AlertCircleIcon className="h-3.5 w-3.5" aria-hidden="true" />
                {questionError}
              </p>
            ) : null}

            {/* Options */}
            <div className="mt-8">
              <h2 className="text-sm font-bold text-ink">Answer Options</h2>
              <p className="mt-1 text-xs text-ink-subtle">At least two options are required.</p>

              <ul className="mt-3 space-y-3">
                {options.map((option, index) => (
                  <li key={option.key}>
                    <div className="flex items-start gap-2">
                      <span className="mt-3 w-16 shrink-0 text-xs font-semibold text-ink-subtle tabular-nums">
                        Option {index + 1}
                      </span>
                      <div className="flex-1">
                        <label className="sr-only" htmlFor={`option-${option.key}`}>
                          Option {index + 1}
                        </label>
                        <input
                          id={`option-${option.key}`}
                          value={option.value}
                          onChange={(e) => updateOption(option.key, e.target.value)}
                          placeholder={`e.g. ${
                            ['Java', 'Python', 'JavaScript', 'C++'][index] ?? 'Another option'
                          }`}
                          aria-invalid={optionErrors[option.key] ? true : undefined}
                          className={twMerge(
                            inputClasses,
                            optionErrors[option.key] ? inputErrorClasses : ''
                          )}
                        />
                        {optionErrors[option.key] ? (
                          <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-danger-600">
                            <AlertCircleIcon className="h-3.5 w-3.5" aria-hidden="true" />
                            {optionErrors[option.key]}
                          </p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeOption(option.key)}
                        disabled={options.length <= 2}
                        aria-label={`Remove option ${index + 1}`}
                        className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line text-ink-subtle transition-colors duration-150 ease-swift hover:border-danger-100 hover:bg-danger-50 hover:text-danger-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:bg-transparent disabled:hover:text-ink-subtle"
                      >
                        <Trash2Icon className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => setOptions((prev) => [...prev, draft()])}
                className={buttonClasses('secondary', 'sm', 'mt-4')}
              >
                <PlusIcon className="h-4 w-4" aria-hidden="true" />
                Add Option
              </button>
            </div>
          </section>

          {/* Settings */}
          <section className="rounded-xl border border-line bg-white p-5 shadow-card sm:p-6">
            <h2 className="text-sm font-bold text-ink">Poll Settings</h2>
            <label className="mt-4 flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={allowOneVote}
                onChange={(e) => setAllowOneVote(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-line-strong text-brand-600 focus:ring-brand-200"
              />
              <span>
                <span className="font-semibold text-ink">Allow one vote per participant</span>
                <span className="mt-0.5 block text-xs text-ink-muted">
                  Each device can submit a single vote for this poll.
                </span>
              </span>
            </label>
          </section>

          {formError ? (
            <div
              role="alert"
              className="flex items-center gap-2.5 rounded-lg border border-danger-100 bg-danger-50 px-4 py-3"
            >
              <AlertCircleIcon className="h-4 w-4 shrink-0 text-danger-600" aria-hidden="true" />
              <p className="text-sm font-semibold text-danger-600">{formError}</p>
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Link to="/dashboard" className={buttonClasses('secondary', 'lg')}>
              Cancel
            </Link>
            <Button type="submit" size="lg" loading={loading} loadingLabel="Creating Poll…">
              Create Poll
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
