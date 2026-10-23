import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { isValidEmail } from '../../lib/format'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { TextAreaField, TextField, SelectField } from '../ui/Fields'
import { LogoShapePreview } from '../CompanyMark'
import { LOGO_SHAPES, LOGO_TONES } from '../../lib/logo'

const industries = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Finance',
  'Support',
  'People',
  'Research',
  'Legal',
  'Analytics',
  'Sales',
  'Training',
  'Services',
]

const CURRENT_YEAR = new Date().getFullYear()

const toneLabels = {
  rose: 'Raspberry',
  ink: 'Ink',
  blush: 'Blush',
  stone: 'Stone',
}

const toneColors = {
  rose: 'var(--logo-1)',
  ink: 'var(--logo-2)',
  blush: 'var(--logo-3)',
  stone: 'var(--logo-4)',
}

function defaultsFor(company) {
  return {
    name: company?.name || '',
    industry: company?.industry || 'Engineering',
    location: company?.location || '',
    website: company?.website || '',
    email: company?.email || '',
    employees: company?.employees || '',
    founded: company?.founded || '',
    description: company?.description || '',
    contactName: company?.contact?.name || '',
    contactRole: company?.contact?.role || '',
    contactEmail: company?.contact?.email || '',
  }
}

export function CompanyFormModal({ open, onClose, company, onSave }) {
  const [logo, setLogo] = useState(
    company?.logo || { shape: 'ascend', tone: 'rose' },
  )
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: defaultsFor(company) })

  useEffect(() => {
    if (!open) return
    reset(defaultsFor(company))
    setLogo(company?.logo || { shape: 'ascend', tone: 'rose' })
  }, [company, open, reset])

  const submit = (values) => {
    onSave({
      ...values,
      employees: Number(values.employees) || 0,
      founded: values.founded ? Number(values.founded) : '',
      logo,
      contact: {
        name: values.contactName || 'Hiring team',
        role: values.contactRole || 'Talent',
        email: values.contactEmail || values.email,
        avatar: company?.contact?.avatar || null,
      },
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={company ? `Edit ${company.name}` : 'Add a company'}
      description="The directory record candidates see when they open a role."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="company-form" variant="primary">
            {company ? 'Save company' : 'Add company'}
          </Button>
        </>
      }
    >
      <form id="company-form" onSubmit={handleSubmit(submit)} noValidate className="grid gap-5">
        <div className="form-grid">
          <TextField
            className="span-2"
            label="Company name"
            placeholder="Northbeam"
            error={errors.name?.message}
            {...register('name', {
              required: 'Give the company a name.',
              minLength: { value: 2, message: 'Use at least two characters.' },
            })}
          />
          <SelectField
            label="Industry"
            options={industries.map((item) => ({ value: item, label: item }))}
            error={errors.industry?.message}
            {...register('industry', { required: 'Choose an industry.' })}
          />
          <TextField
            label="Location"
            placeholder="Phoenix, AZ"
            error={errors.location?.message}
            {...register('location', { required: 'Add a location.' })}
          />
          <TextField
            label="Website"
            placeholder="northbeam.co"
            hint="No need to add https://."
            error={errors.website?.message}
            {...register('website')}
          />
          <TextField
            label="Company email"
            type="email"
            placeholder="careers@northbeam.co"
            error={errors.email?.message}
            {...register('email', {
              validate: (value) =>
                !value || isValidEmail(value) || 'Enter a valid email address.',
            })}
          />
          <TextField
            label="Number of employees"
            type="number"
            min="1"
            placeholder="240"
            error={errors.employees?.message}
            {...register('employees', {
              required: 'Add the team size.',
              min: { value: 1, message: 'Use at least one employee.' },
            })}
          />
          <TextField
            label="Founded"
            type="number"
            min="1900"
            max={CURRENT_YEAR}
            placeholder="2018"
            error={errors.founded?.message}
            {...register('founded')}
          />
          <TextAreaField
            className="span-2"
            label="Company description"
            rows={4}
            placeholder="What does the company make, who is it for, and what is it like to work there?"
            error={errors.description?.message}
            {...register('description', {
              required: 'Write a short company description.',
              minLength: {
                value: 30,
                message: 'A little more context helps. At least 30 characters.',
              },
            })}
          />
        </div>

        <div>
          <div className="field-label mb-2">Company mark</div>
          <div className="logo-picker-grid">
            {LOGO_SHAPES.map((shape) => (
              <button
                type="button"
                className="logo-choice"
                aria-label={`Use ${shape} mark`}
                aria-pressed={logo.shape === shape}
                key={shape}
                onClick={() => setLogo((current) => ({ ...current, shape }))}
              >
                <LogoShapePreview shape={shape} tone={logo.tone} active={logo.shape === shape} />
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {LOGO_TONES.map((tone) => (
              <button
                type="button"
                className="tone-choice"
                aria-label={`Use ${toneLabels[tone]} mark colour`}
                aria-pressed={logo.tone === tone}
                key={tone}
                onClick={() => setLogo((current) => ({ ...current, tone }))}
              >
                <span className="tone-dot" style={{ background: toneColors[tone] }} />
                {toneLabels[tone]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">Hiring contact</h3>
          <p className="mt-1 text-xs leading-5 text-faint">
            The person a candidate would write to. This does not create a login.
          </p>
          <div className="form-grid mt-3">
            <TextField
              label="Contact name"
              placeholder="Emily Johnson"
              error={errors.contactName?.message}
              {...register('contactName')}
            />
            <TextField
              label="Contact role"
              placeholder="Engineering manager"
              error={errors.contactRole?.message}
              {...register('contactRole')}
            />
            <TextField
              className="span-2"
              label="Contact email"
              type="email"
              placeholder="emily@northbeam.co"
              error={errors.contactEmail?.message}
              {...register('contactEmail', {
                validate: (value) =>
                  !value || isValidEmail(value) || 'Enter a valid email address.',
              })}
            />
          </div>
        </div>
      </form>
    </Modal>
  )
}
