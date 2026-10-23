import { ArrowLeft, Check, Save } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { usePortal } from '../context/PortalContext'
import { getJobById, getCompanyById } from '../data/selectors'
import {
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  JOB_CATEGORIES,
  WORK_MODES,
} from '../lib/constants'
import { formatDateInput, formatSalary } from '../lib/format'
import { CompanyMark } from '../components/CompanyMark'
import { Button, ButtonLink } from '../components/ui/Button'
import {
  SelectField,
  TagField,
  TextAreaField,
  TextField,
} from '../components/ui/Fields'
import { EmptyState, Notice, PageHeader, Panel } from '../components/ui/Layout'
import { PageFooter } from '../components/ui/PageFooter'

function inDays(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return formatDateInput(date)
}

function splitLines(value = '') {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function buildDefaults(job) {
  if (job) {
    return {
      title: job.title,
      companyId: job.companyId,
      category: job.category,
      type: job.type,
      experience: job.experience,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      location: job.location,
      workMode: job.workMode,
      deadline: formatDateInput(job.deadline),
      status: job.status,
      skills: job.skills || [],
      description: job.description || '',
      responsibilities: (job.responsibilities || []).join('\n'),
      requirements: (job.requirements || []).join('\n'),
      benefits: (job.benefits || []).join('\n'),
    }
  }
  return {
    title: '',
    companyId: '',
    category: 'Design',
    type: 'Full-time',
    experience: 'Mid',
    salaryMin: '',
    salaryMax: '',
    location: '',
    workMode: 'Hybrid',
    deadline: inDays(30),
    status: 'Open',
    skills: [],
    description: '',
    responsibilities: '',
    requirements: '',
    benefits: '',
  }
}

export function JobForm() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const presetCompany = searchParams.get('company')
  const { data, addJob, updateJob, directorySource, directoryUpdatedAt } = usePortal()
  const navigate = useNavigate()
  const job = data && id ? getJobById(data.jobs, id) : null
  const isEdit = Boolean(id)
  const defaults = useMemo(() => {
    const next = buildDefaults(job)
    if (!job && presetCompany) next.companyId = presetCompany
    return next
  }, [job, presetCompany])
  const [submitting, setSubmitting] = useState(false)
  const [rootError, setRootError] = useState('')

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: defaults,
    mode: 'onBlur',
  })

  useEffect(() => {
    reset(defaults)
  }, [defaults, reset])

  const values = watch()
  const companies = data?.companies || []
  const selectedCompany = companies.find((company) => company.id === values.companyId)
  const companyById = job ? getCompanyById(data?.companies || [], job.companyId) : null

  if (!data) return null

  if (isEdit && !job) {
    return (
      <EmptyState
        icon={Save}
        title="That role could not be found"
        text="It may have been deleted. Choose another role from the jobs list."
        action={
          <ButtonLink to="/jobs" variant="primary">
            Back to jobs
          </ButtonLink>
        }
      />
    )
  }

  if (!companies.length) {
    return (
      <EmptyState
        icon={Save}
        title="Add a company first"
        text="Every role lives inside a company. Add one to the directory, then come back to post the role."
        action={
          <ButtonLink to="/companies" variant="primary">
            Add a company
          </ButtonLink>
        }
      />
    )
  }

  const onSubmit = async (formValues) => {
    setSubmitting(true)
    setRootError('')
    try {
      const payload = {
        ...formValues,
        salaryMin: Number(formValues.salaryMin),
        salaryMax: Number(formValues.salaryMax),
        deadline: new Date(`${formValues.deadline}T18:00:00`).toISOString(),
        responsibilities: splitLines(formValues.responsibilities),
        requirements: splitLines(formValues.requirements),
        benefits: splitLines(formValues.benefits),
      }
      await new Promise((resolve) => window.setTimeout(resolve, 380))
      if (isEdit) {
        updateJob(job.id, payload)
        toast.success(`${payload.title} was updated.`)
        navigate(`/jobs/${job.id}`)
      } else {
        const created = addJob(payload)
        toast.success(`${created.title} is live.`)
        navigate(`/jobs/${created.id}`)
      }
    } catch (error) {
      setRootError(error.message || 'The role could not be saved.')
    } finally {
      setSubmitting(false)
    }
  }

  const previewCompany = selectedCompany || companyById
  const previewSkills = values.skills || []

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: 'Jobs', to: '/jobs' },
          ...(isEdit ? [{ label: job.title, to: `/jobs/${job.id}` }] : []),
          { label: isEdit ? 'Edit role' : 'New role' },
        ]}
        title={isEdit ? 'Edit role' : 'Post a job'}
        subtitle={
          isEdit
            ? 'Update the details candidates see and the line the team works from.'
            : 'A clear role takes about two minutes. Write it the way you would explain it to a friend.'
        }
        actions={
          <>
            <ButtonLink to={isEdit ? `/jobs/${job.id}` : '/jobs'} variant="secondary">
              <ArrowLeft aria-hidden="true" />
              Cancel
            </ButtonLink>
            <Button type="submit" form="job-form" variant="primary" loading={submitting}>
              <Save aria-hidden="true" />
              {isEdit ? 'Save changes' : 'Publish role'}
            </Button>
          </>
        }
      />

      <div className="job-detail-grid">
        <form id="job-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="stack-24">
            {rootError ? <Notice tone="error">{rootError}</Notice> : null}

            <Panel title="Role details" subtitle="The line candidates read first.">
              <div className="form-grid">
                <TextField
                  className="span-2"
                  label="Role title"
                  placeholder="Senior Product Designer"
                  error={errors.title?.message}
                  {...register('title', {
                    required: 'Give the role a title.',
                    minLength: { value: 3, message: 'Use at least 3 characters.' },
                  })}
                />
                <SelectField
                  label="Company"
                  options={companies.map((company) => ({
                    value: company.id,
                    label: company.name,
                  }))}
                  placeholder="Choose a company"
                  error={errors.companyId?.message}
                  {...register('companyId', { required: 'Choose the hiring company.' })}
                />
                <SelectField
                  label="Job category"
                  options={JOB_CATEGORIES.map((item) => ({ value: item, label: item }))}
                  error={errors.category?.message}
                  {...register('category', { required: 'Choose a category.' })}
                />
                <SelectField
                  label="Employment type"
                  options={EMPLOYMENT_TYPES.map((item) => ({ value: item, label: item }))}
                  error={errors.type?.message}
                  {...register('type', { required: 'Choose a type.' })}
                />
                <SelectField
                  label="Experience level"
                  options={EXPERIENCE_LEVELS.map((item) => ({ value: item, label: item }))}
                  error={errors.experience?.message}
                  {...register('experience', { required: 'Choose a level.' })}
                />
                <TextField
                  label="Location"
                  placeholder="Phoenix, AZ or Remote"
                  error={errors.location?.message}
                  {...register('location', {
                    required: 'Add a location or “Remote”.',
                  })}
                />
                <SelectField
                  label="Work mode"
                  options={WORK_MODES.map((item) => ({ value: item, label: item }))}
                  error={errors.workMode?.message}
                  {...register('workMode', { required: 'Choose a work mode.' })}
                />
              </div>
            </Panel>

            <Panel title="Compensation & timing" subtitle="How the role is set up in the line.">
              <div className="form-grid">
                <TextField
                  label="Salary minimum"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="135000"
                  hint="Annual, in USD."
                  error={errors.salaryMin?.message}
                  {...register('salaryMin', {
                    required: 'Add a minimum salary.',
                    min: { value: 0, message: 'Salary cannot be negative.' },
                  })}
                />
                <TextField
                  label="Salary maximum"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="165000"
                  hint="Annual, in USD."
                  error={errors.salaryMax?.message}
                  {...register('salaryMax', {
                    required: 'Add a maximum salary.',
                    validate: (value) =>
                      Number(value) >= Number(values.salaryMin) ||
                      'The maximum must be at least the minimum.',
                  })}
                />
                <TextField
                  label="Application deadline"
                  type="date"
                  error={errors.deadline?.message}
                  {...register('deadline', {
                    required: 'Set an application deadline.',
                    validate: (value) => {
                      if (values.status === 'Closed') return true
                      const chosen = new Date(`${value}T18:00:00`)
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      return chosen >= today || 'An open role needs a deadline in the future.'
                    },
                  })}
                />
                <SelectField
                  label="Job status"
                  options={[
                    { value: 'Open', label: 'Open, accepting applications' },
                    { value: 'Closed', label: 'Closed, not accepting applications' },
                  ]}
                  error={errors.status?.message}
                  {...register('status', { required: 'Choose a status.' })}
                />
              </div>
            </Panel>

            <Panel title="The role in words" subtitle="Make the work, the team and the bar concrete.">
              <div className="grid gap-4">
                <TextAreaField
                  label="About the role"
                  rows={5}
                  placeholder="What will this person own, and why does it matter now?"
                  error={errors.description?.message}
                  {...register('description', {
                    required: 'Write a short description of the role.',
                    minLength: {
                      value: 40,
                      message: 'A little more context helps. At least 40 characters.',
                    },
                  })}
                />
                <div className="form-grid">
                  <TextAreaField
                    label="Responsibilities"
                    hint="One per line."
                    rows={5}
                    placeholder={'Own the end-to-end design of the tool.\nPartner with engineering and product.'}
                    {...register('responsibilities')}
                  />
                  <TextAreaField
                    label="Requirements"
                    hint="One per line."
                    rows={5}
                    placeholder={'5+ years designing complex software.\nA portfolio that shows the thinking.'}
                    {...register('requirements')}
                  />
                </div>
                <TextAreaField
                  label="Benefits"
                  optional
                  hint="One per line."
                  rows={3}
                  placeholder={'Medical cover from day one.\nFour-day summer weeks.'}
                  {...register('benefits')}
                />
                <Controller
                  name="skills"
                  control={control}
                  rules={{
                    validate: (value) =>
                      (value && value.length >= 2) || 'Add at least two skills.',
                  }}
                  render={({ field, fieldState }) => (
                    <TagField
                      label="Required skills"
                      value={field.value || []}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      hint="Type a skill and press Enter. These power the candidate match."
                    />
                  )}
                />
              </div>
            </Panel>

            <div className="flex flex-wrap justify-end gap-2">
              <ButtonLink to={isEdit ? `/jobs/${job.id}` : '/jobs'} variant="ghost">
                Cancel
              </ButtonLink>
              <Button type="submit" variant="primary" loading={submitting}>
                <Check aria-hidden="true" />
                {isEdit ? 'Save changes' : 'Publish role'}
              </Button>
            </div>
          </div>
        </form>

        <aside className="profile-summary">
          <Panel title="Live preview" subtitle="How the role opens for a candidate.">
            <div className="flex items-start gap-3">
              <CompanyMark company={previewCompany} size="lg" />
              <div className="min-w-0">
                <div className="text-[18px] font-semibold leading-tight tracking-[-0.02em] text-ink">
                  {values.title || 'Untitled role'}
                </div>
                <div className="mt-1 text-xs text-faint">
                  {previewCompany?.name || 'Choose a company'} · {values.location || 'Location'}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="job-tag">{values.type}</span>
                  <span className="job-tag">{values.experience}</span>
                  <span className="job-tag">{values.workMode}</span>
                </div>
              </div>
            </div>
            <div className="mt-5 grid gap-2 text-xs text-muted">
              <div className="flex justify-between gap-3">
                <span className="text-faint">Salary</span>
                <span className="font-medium text-ink">
                  {values.salaryMin && values.salaryMax
                    ? formatSalary(Number(values.salaryMin), Number(values.salaryMax))
                    : 'Not set'}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-faint">Deadline</span>
                <span className="font-medium text-ink">
                  {values.deadline
                    ? new Date(`${values.deadline}T12:00:00`).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Not set'}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-faint">Status</span>
                <span className="font-medium text-ink">{values.status}</span>
              </div>
            </div>
            <p className="mt-5 line-clamp-4 text-xs leading-5 text-muted">
              {values.description || 'Your role description will appear here as you write it.'}
            </p>
            {previewSkills.length ? (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {previewSkills.slice(0, 6).map((skill) => (
                  <span className="skill-chip" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="mt-5 border-t border-rule pt-4">
              <p className="text-[11px] leading-5 text-faint">
                The preview updates as you type. Candidates see the match against their profile
                skills.
              </p>
            </div>
          </Panel>
          <div className="mt-3 flex items-center gap-2 px-1 text-[11px] text-faint">
            <Link className="link-quiet" to="/profile">
              Review your recruiter profile
            </Link>
          </div>
        </aside>
      </div>

      <PageFooter directorySource={directorySource} directoryUpdatedAt={directoryUpdatedAt} />
    </>
  )
}
