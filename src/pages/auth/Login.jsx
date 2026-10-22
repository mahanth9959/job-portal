import { ArrowRight, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import { DEMO_ACCOUNTS, ROLES, STORAGE_KEYS } from '../../lib/constants'
import { isValidEmail } from '../../lib/format'
import { readRaw, removeStorage, writeRaw } from '../../lib/storage'
import { Button } from '../../components/ui/Button'
import { CheckboxField, PasswordField, TextField } from '../../components/ui/Fields'
import { Notice } from '../../components/ui/Layout'
import { UserAvatar } from '../../components/UserAvatar'

export function Login() {
  const { login, loginAsDemo } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [submitting, setSubmitting] = useState(false)
  const [demoLoading, setDemoLoading] = useState('')
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: readRaw(STORAGE_KEYS.rememberedEmail, ''),
      password: '',
      remember: Boolean(readRaw(STORAGE_KEYS.rememberedEmail, '')),
    },
  })

  const goNext = () => {
    const next = location.state?.from?.pathname || '/dashboard'
    navigate(next, { replace: true })
  }

  const onSubmit = async (values) => {
    setSubmitting(true)
    clearErrors('root')
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 420))
      const signedIn = login(values.email, values.password)
      if (values.remember) writeRaw(STORAGE_KEYS.rememberedEmail, values.email.trim())
      else removeStorage(STORAGE_KEYS.rememberedEmail)
      toast.success(`Welcome back, ${signedIn.name.split(' ')[0]}.`)
      goNext()
    } catch (error) {
      setError('root', { message: error.message })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDemo = async (account) => {
    setDemoLoading(account.role)
    clearErrors('root')
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 420))
      const signedIn = loginAsDemo(account.role)
      toast.success(`Signed in as ${signedIn.name}.`)
      goNext()
    } catch (error) {
      setError('root', { message: error.message })
    } finally {
      setDemoLoading('')
    }
  }

  return (
    <>
      <div className="auth-form-head">
        <h1>Welcome back</h1>
        <p>Sign in to your Hireline workspace. Your roles and applications are waiting.</p>
      </div>

      {location.state?.from ? (
        <Notice className="mb-5" tone="warning">
          Sign in to open that page. The demo accounts work immediately.
        </Notice>
      ) : null}

      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {errors.root ? (
          <Notice tone="error">{errors.root.message}</Notice>
        ) : null}
        <TextField
          label="Work email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          error={errors.email?.message}
          {...register('email', {
            required: 'Enter your email address.',
            validate: (value) =>
              isValidEmail(value) || 'Enter a valid email address.',
          })}
        />
        <PasswordField
          label="Password"
          autoComplete="current-password"
          placeholder="Your password"
          error={errors.password?.message}
          {...register('password', {
            required: 'Enter your password.',
            minLength: { value: 6, message: 'Passwords are at least 6 characters.' },
          })}
        />
        <div className="auth-row">
          <CheckboxField label="Keep me signed in" {...register('remember')} />
          <Link className="link text-xs" to="/forgot-password">
            Forgot password?
          </Link>
        </div>
        <Button
          type="submit"
          variant="primary"
          block
          size="lg"
          loading={submitting}
          className="auth-submit"
        >
          Sign in
          <ArrowRight aria-hidden="true" />
        </Button>
      </form>

      <div className="auth-divider">or open a demo workspace</div>
      <div className="demo-grid">
        {DEMO_ACCOUNTS.map((account) => (
          <button
            key={account.role}
            type="button"
            className="demo-card"
            onClick={() => handleDemo(account)}
            disabled={Boolean(demoLoading) || submitting}
          >
            <UserAvatar name={account.name} size="sm" />
            <span className="demo-card-body">
              <strong>{account.label}</strong>
              <span>{ROLES[account.role]} · {account.name}</span>
            </span>
          </button>
        ))}
      </div>
      <p className="auth-foot">
        New to Hireline? <Link to="/register">Create an account</Link>
      </p>
      <p className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-faint">
        <Sparkles className="size-3" aria-hidden="true" />
        Demo password: hireline123 · all data stays in this browser
      </p>
    </>
  )
}
