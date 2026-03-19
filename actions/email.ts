'use server'

import { SubmissionResult } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { Resend } from 'resend'

import { schema } from '@/vibes/soul/sections/contact-form/schema'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function handleEmailFormSubmission(
  _prev: { lastResult: SubmissionResult | null; successMessage?: string },
  formData: FormData
) {
  // Honeypot — silently discard bot submissions
  if (formData.get('_trap')) {
    return { lastResult: null, successMessage: "Message sent — MCT630 will be in touch!" }
  }

  const submission = parseWithZod(formData, { schema })

  if (submission.status !== 'success') {
    return { lastResult: submission.reply() }
  }

  try {
    await resend.emails.send({
      from: 'MCT630 Contact Form <onboarding@resend.dev>', // swap for domain email once that's set up
      to: process.env.CONTACT_EMAIL!,
      replyTo: submission.value.email,
      subject: `New message from ${submission.value.email}`,
      text: `From: ${submission.value.email}\n\n${submission.value.message}`,
    })

    return {
      lastResult: submission.reply(),
      successMessage: "Message sent — MCT630 will be in touch!",
    }
  } catch (err) {
    console.error('Email send failed:', err)
    return {
      lastResult: submission.reply({ formErrors: ['Failed to send. Please try again.'] }),
    }
  }
}