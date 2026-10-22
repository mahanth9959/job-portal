import { ArrowLeft, ArrowRight, MailCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { isValidEmail } from '../../lib/format'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/Fields'

export function ForgotPassword() {
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [sentTo, setSentTo] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { email: '' } })

  const onSubmit = async (values) => {
    setSubmitting(true)
    await new Promise((resolve) => window.setTimeout(resolve, 520))
    setSentTo(values.email)
    setSent(true)
    setSubmitting(false)
    toast.success('A reset link is on its way (demo).')
  }

  if (sent) {
    return (
      <div className="auth-success">
        <span className="auth-success-icon">
          <MailCheck aria-hidden="true" />
        </span>
        <div>
          <h2>Check your inbox</h2>
          <p className="mt-2">
            If an account exists for <strong className="text-ink">{sentTo}</strong>, a reset link
            would be waiting there. This is a static demo, so no email is actually sent.
          </p>
        </div>
        <div className="grid gap-2">
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              setSent(false)
              setSentTo('')
            }}
          >
            Send another link
          </Button>
          <Link className="btn btn-ghost" to="/login">
            <ArrowLeft aria-hidden="true" />
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="auth-form-head">
        <h1>Reset your password</h1>
        <p>Enter the email attached to your account and we’ll show you the next step.</p>
      </div>
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          error={errors.email?.message}
          {...register('email', {
            required: 'Enter your email address.',
            validate: (value) => isValidEmail(value) || 'Enter a valid email address.',
          })}
        />
        <Button
          type="submit"
          variant="primary"
          size="lg"
          block
          loading={submitting}
          className="auth-submit"
        >
          Send reset link
          <ArrowRight aria-hidden="true" />
        </Button>
      </form>
      <p className="auth-foot">
        Remembered it? <Link to="/login">Back to sign in</Link>
      </p>
    </>
  )
}
