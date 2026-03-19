import { handleEmailFormSubmission } from '@/actions/email'
import { ContactForm } from '@/vibes/soul/sections/contact-form'

export interface EmailFormProps {
  emailPlaceholder?: string
  messagePlaceholder?: string
  submitLabel?: string
  className?: string
}

export default function EmailForm({ className, ...props }: EmailFormProps) {
  return (
    <div className={className}>
      <ContactForm {...props} action={handleEmailFormSubmission} />
    </div>
  )
}