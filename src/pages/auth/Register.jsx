import { ArrowRight, Building2, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import { isValidEmail } from '../../lib/format'
import { Button } from '../../components/ui/Button'
import { CheckboxField, PasswordField, TextField } from '../../components/ui/Fields'
import { Notice } from '../../components/ui/Layout'

export function Register() {
  const { register: createAccount } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'candidate',
      terms: false,
    },
  })

  const onSubmit = async (values) => {
    setSubmitting(true)
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 480))
      const user = createAccount({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      })
      toast.success(`Welcome to Hireline, ${user.name.split(' ')[0]}.`)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setError('root', { message: error.message })
    } finally {
      setSubmitting(false)
    }
  }

  const password = watch('password')

  return (
    <>
      <div className="auth-form-head">
        <h1>Create your line.</h1>
        <p>One account for the roles you post or the roles you want next.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {errors.root ? <Notice tone="error">{errors.root.message}</Notice> : null}

        <fieldset>
          <legend className="field-label mb-2">I’m here to</legend>
          <div className="grid grid-cols-2 gap-2">
            <label className="role-card">
              <input
                type="radio"
                value="candidate"
                {...register('role', { required: 'Choose how you will use Hireline.' })}
              />
              <span className="role-icon">
                <UserRound aria-hidden="true" />
              </span>
              <span>
                <strong>Find a role</strong>
                <span>Search, save and track applications.</span>
              </span>
            </label>
            <label className="role-card">
              <input
                type="radio"
                value="recruiter"
                {...register('role', { required: 'Choose how you will use Hireline.' })}
              />
              <span className="role-icon">
                <Building2 aria-hidden="true" />
              </span>
              <span>
                <strong>Hire a team</strong>
                <span>Post roles, companies and reports.</span>
              </span>
            </label>
          </div>
          {errors.role ? <p className="field-error mt-2">{errors.role.message}</p> : null}
        </fieldset>

        <TextField
          label="Full name"
          autoComplete="name"
          placeholder="Maya Chen"
          error={errors.name?.message}
          {...register('name', {
            required: 'Enter your full name.',
            minLength: { value: 2, message: 'Use at least two characters.' },
          })}
        />
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
        <PasswordField
          label="Password"
          autoComplete="new-password"
          placeholder="Choose a password"
          hint={
            password
              ? password.length >= 8
                ? 'Good length. A mix of words and numbers is easier to remember.'
                : 'Use at least 8 characters.'
              : 'At least 8 characters.'
          }
          error={errors.password?.message}
          {...register('password', {
            required: 'Choose a password.',
            minLength: { value: 8, message: 'Use at least 8 characters.' },
          })}
        />
        <PasswordField
          label="Confirm password"
          autoComplete="new-password"
          placeholder="Type it once more"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Confirm your password.',
            validate: (value) => value === getValues('password') || 'The passwords do not match.',
          })}
        />
        <CheckboxField
          label="I agree to the demo terms and privacy note."
          error={errors.terms?.message}
          {...register('terms', {
            required: 'Accept the demo terms to continue.',
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
          Create account
          <ArrowRight aria-hidden="true" />
        </Button>
      </form>

      <p className="auth-foot">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </>
  )
}
