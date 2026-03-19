'use client'

import { useActionState } from 'react'
import { SubmissionResult, getFormProps, getInputProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { clsx } from 'clsx'
import { ArrowRight } from 'lucide-react'

import { FormStatus } from '@/vibes/soul/form/form-status'
import { Button } from '@/vibes/soul/primitives/button'
import { schema } from './schema'

type Action<State, Payload> = (
  prevState: Awaited<State>,
  formData: Payload
) => State | Promise<State>

export interface ContactFormProps {
  className?: string
  emailPlaceholder?: string
  messagePlaceholder?: string
  submitLabel?: string
  successMessage?: string
  action: Action<{ lastResult: SubmissionResult | null; successMessage?: string }, FormData>
}

export function ContactForm({
  className,
  action,
  emailPlaceholder = 'your@email.com',
  messagePlaceholder = 'Your message...',
  submitLabel = 'Send',
  successMessage: successMessageProp,
}: ContactFormProps) {
  const [{ lastResult, successMessage }, formAction, isPending] = useActionState(action, {
    lastResult: null,
  })

  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema })
    },
    shouldValidate: 'onSubmit',
    shouldRevalidate: 'onInput',
  })

  if (successMessage) {
    return (
      <div className={clsx('animate-in fade-in duration-500', className)}>
        <FormStatus>{successMessageProp ?? successMessage ?? "Message sent — I'll be in touch!"}</FormStatus>
      </div>
    )
  }

  return (
    <form {...getFormProps(form)} action={formAction} className={clsx('space-y-3', className)}>
      <input
        type="text"
        name="_trap"
        aria-hidden="true"
        tabIndex={-1}
        autoComplete="off"
        style={{ display: 'none' }}
      />

      <div
        className={clsx(
          'rounded-xl border transition-colors duration-200',
          fields.email.errors?.length && 'border-(--inline-email-form-error,var(--error))'
        )}
        style={!fields.email.errors?.length ? {
          borderColor: 'var(--color-primary)',
          backgroundColor: 'var(--color-background)',
        } : undefined}
      >
        <input
          {...getInputProps(fields.email, { type: 'email' })}
          key={fields.email.id}
          placeholder={emailPlaceholder}
          className="h-14 w-full bg-transparent px-5 focus:outline-hidden"
          style={{ color: 'var(--color-text)' }}
          data-1p-ignore
        />
      </div>
      {fields.email.errors?.map((error, i) => (
        <FormStatus key={i} type="error">{error}</FormStatus>
      ))}

      <div
        className={clsx(
          'rounded-xl border transition-colors duration-200',
          fields.message.errors?.length && 'border-(--inline-email-form-error,var(--error))'
        )}
        style={!fields.message.errors?.length ? {
          borderColor: 'var(--color-primary)',
          backgroundColor: 'var(--color-background)',
        } : undefined}
      >
        <textarea
          {...getInputProps(fields.message, { type: 'text' })}
          key={fields.message.id}
          placeholder={messagePlaceholder}
          rows={4}
          className="w-full resize-none bg-transparent px-5 py-4 focus:outline-hidden"
          style={{ color: 'var(--color-text)' }}
        />
      </div>
      {fields.message.errors?.map((error, i) => (
        <FormStatus key={i} type="error">{error}</FormStatus>
      ))}

      <div className="flex justify-end">
        <Button loading={isPending} size="medium" type="submit" variant="secondary">
          {submitLabel} <ArrowRight size={16} strokeWidth={1.5} />
        </Button>
      </div>
    </form>
  )
}