import { Style, TextInput } from '@makeswift/runtime/controls'

import { runtime } from '@/lib/makeswift/runtime'
import EmailForm from '.'

export const EMAIL_FORM_TYPE = 'EmailForm'

runtime.registerComponent(EmailForm, {
  label: 'Email Form',
  type: EMAIL_FORM_TYPE,
  props: {
    emailPlaceholder: TextInput({ label: 'Email Placeholder', defaultValue: 'your@email.com' }),
    messagePlaceholder: TextInput({ label: 'Message Placeholder', defaultValue: 'Your message...' }),
    submitLabel: TextInput({ label: 'Submit Label', defaultValue: 'Send' }),
    className: Style(),
    successMessage: TextInput({ label: 'Success Message', defaultValue: "Message sent — I'll be in touch!" }),
  },
})
