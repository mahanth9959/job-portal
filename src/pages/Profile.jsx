import {
  Camera,
  Check,
  Circle,
  RotateCcw,
  Save,
  Trash2,
  UserRound,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { usePortal } from '../context/PortalContext'
import { formatDate, formatFileSize, isValidEmail, profileStrength } from '../lib/format'
import { resizeImageFile } from '../lib/image'
import { Button, ButtonLink } from '../components/ui/Button'
import { FileField, TagField, TextAreaField, TextField } from '../components/ui/Fields'
import { Notice, PageHeader, Panel } from '../components/ui/Layout'
import { ConfirmDialog } from '../components/ui/Modal'
import { PageFooter } from '../components/ui/PageFooter'
import { UserAvatar } from '../components/UserAvatar'

function profileDefaults(user) {
  return {
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    address: user.address || '',
    title: user.title || '',
    company: user.company || '',
    experience: user.experience || '',
    education: user.education || '',
    skills: user.skills || [],
    bio: user.bio || '',
  }
}

export function Profile() {
  const { user, updateProfile } = useAuth()
  const { resetDemoData, directorySource, directoryUpdatedAt } = usePortal()
  const [photo, setPhoto] = useState(user.photo)
  const [resume, setResume] = useState(user.resume)
  const [photoBusy, setPhotoBusy] = useState(false)
  const [saving, setSaving] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [rootError, setRootError] = useState('')

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: profileDefaults(user) })

  const values = watch()
  const strength = useMemo(
    () => profileStrength({ ...values, photo, resume }),
    [values, photo, resume],
  )

  if (!user) return null

  const onSubmit = async (formValues) => {
    setSaving(true)
    setRootError('')
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 360))
      updateProfile({ ...formValues, photo, resume })
      toast.success('Profile saved.')
    } catch (error) {
      setRootError(error.message)
    } finally {
      setSaving(false)
    }
  }

  const onPhoto = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Choose an image file for the profile photo.')
      return
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error('Keep the profile photo under 3 MB.')
      return
    }
    setPhotoBusy(true)
    try {
      const dataUrl = await resizeImageFile(file, 320)
      setPhoto(dataUrl)
      toast.info('Photo ready. Save the profile to keep it.')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setPhotoBusy(false)
    }
  }

  const onResume = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const allowed = ['.pdf', '.doc', '.docx']
    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`
    if (!allowed.includes(extension)) {
      toast.error('Use a PDF, DOC or DOCX file for the resume.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Keep the resume under 5 MB.')
      return
    }
    setResume({ name: file.name, size: file.size, updatedAt: new Date().toISOString() })
    toast.info('Resume attached. Save the profile to keep it.')
  }

  const checklist = [
    {
      label: 'Name, email and phone',
      done: Boolean(values.name && values.email && values.phone),
    },
    {
      label: 'A current title and company',
      done: Boolean(values.title && values.company),
    },
    { label: 'At least three skills', done: (values.skills || []).length >= 3 },
    { label: 'Experience and education', done: Boolean(values.experience && values.education) },
    { label: 'A short bio', done: (values.bio || '').length >= 30 },
    { label: 'A resume on file', done: Boolean(resume?.name) },
    { label: 'A profile photo', done: Boolean(photo) },
  ]

  return (
    <>
      <PageHeader
        title="Profile"
        subtitle={
          user.role === 'candidate'
            ? 'The profile a recruiter reads before the first conversation. Keep it specific and true.'
            : 'The profile attached to the roles you post and the people you invite.'
        }
        actions={
          <>
            <ButtonLink to="/dashboard" variant="secondary">
              Back to overview
            </ButtonLink>
            <Button type="submit" form="profile-form" variant="primary" loading={saving}>
              <Save aria-hidden="true" />
              Save profile
            </Button>
          </>
        }
      />

      {rootError ? <Notice className="mb-4" tone="error">{rootError}</Notice> : null}

      <div className="profile-grid">
        <aside className="profile-summary">
          <div className="profile-summary-inner">
            <div className="profile-identity">
              <UserAvatar name={values.name || user.name} src={photo} size="xl" alt="Profile photo" />
              <div className="min-w-0">
                <div className="profile-name">{values.name || 'Your name'}</div>
                <div className="profile-role">
                  {values.title || 'Your title'} · {user.role === 'recruiter' ? 'Recruiter' : 'Candidate'}
                </div>
                <div className="mt-2">
                  <label className="btn btn-secondary btn-sm cursor-pointer">
                    <Camera aria-hidden="true" />
                    {photoBusy ? 'Preparing…' : 'Change photo'}
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={onPhoto}
                      disabled={photoBusy}
                      aria-label="Upload a profile photo"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="profile-progress">
              <div className="profile-progress-head">
                <span>Profile strength</span>
                <strong>{strength}%</strong>
              </div>
              <div className="profile-progress-track">
                <span style={{ width: `${strength}%` }} />
              </div>
              <p className="mt-2 text-[11px] leading-5 text-faint">
                {strength === 100
                  ? 'Everything is in place. Recruiters see the whole picture.'
                  : 'A complete profile gives the match a fairer chance.'}
              </p>
            </div>

            <div className="profile-list">
              {checklist.map((item) => (
                <div className={`profile-list-row ${item.done ? 'done' : ''}`} key={item.label}>
                  {item.done ? (
                    <Check className="text-positive" aria-hidden="true" />
                  ) : (
                    <Circle aria-hidden="true" />
                  )}
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 border-t border-rule pt-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold text-ink">Resume</div>
                  <div className="mt-1 text-[11px] text-faint">
                    {resume?.name ? `${resume.name} · ${formatFileSize(resume.size)}` : 'No resume attached'}
                  </div>
                </div>
                {resume?.name ? (
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => setResume(null)}
                    aria-label="Remove resume"
                  >
                    <Trash2 aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            </div>

            {photo ? (
              <button
                type="button"
                className="btn btn-ghost btn-sm mt-4 w-full justify-start text-negative"
                onClick={() => setPhoto(null)}
              >
                <Trash2 aria-hidden="true" />
                Remove profile photo
              </button>
            ) : null}
          </div>

          <div className="mt-3 px-1 text-[11px] leading-5 text-faint">
            This demo stores your profile in this browser. Nothing is sent to a server.
          </div>
        </aside>

        <form id="profile-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="stack-24">
            <Panel title="Personal details" subtitle="The basics every hiring conversation starts with.">
              <div className="form-grid">
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
                  placeholder="maya@hireline.dev"
                  error={errors.email?.message}
                  {...register('email', {
                    required: 'Enter your email address.',
                    validate: (value) => isValidEmail(value) || 'Enter a valid email address.',
                  })}
                />
                <TextField
                  label="Mobile number"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+1 917 555 0188"
                  error={errors.phone?.message}
                  {...register('phone')}
                />
                <TextField
                  className="span-2"
                  label="Address"
                  autoComplete="street-address"
                  placeholder="41 Greenpoint Avenue, Brooklyn, NY"
                  error={errors.address?.message}
                  {...register('address')}
                />
              </div>
            </Panel>

            <Panel
              title="Professional profile"
              subtitle={
                user.role === 'candidate'
                  ? 'What you do, where you have done it and what you want next.'
                  : 'The context attached to the roles you post.'
              }
            >
              <div className="form-grid">
                <TextField
                  label={user.role === 'recruiter' ? 'Your title' : 'Current title'}
                  placeholder={user.role === 'recruiter' ? 'Talent lead' : 'Senior product designer'}
                  error={errors.title?.message}
                  {...register('title', { required: 'Add your current title.' })}
                />
                <TextField
                  label={user.role === 'recruiter' ? 'Company / team' : 'Current company'}
                  placeholder={user.role === 'recruiter' ? 'Hireline' : 'Independent'}
                  error={errors.company?.message}
                  {...register('company')}
                />
                <TextField
                  label="Experience"
                  placeholder="7 years"
                  error={errors.experience?.message}
                  {...register('experience')}
                />
                <TextField
                  label="Education"
                  placeholder="BFA, Rhode Island School of Design"
                  error={errors.education?.message}
                  {...register('education')}
                />
                <Controller
                  name="skills"
                  control={control}
                  rules={{
                    validate: (value) =>
                      (value && value.length >= 1) || 'Add at least one skill.',
                  }}
                  render={({ field, fieldState }) => (
                    <TagField
                      className="span-2"
                      label={user.role === 'recruiter' ? 'Hiring skills' : 'Skills'}
                      value={field.value || []}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      hint="Type a skill and press Enter. The job match uses these terms."
                    />
                  )}
                />
                <TextAreaField
                  className="span-2"
                  label="Short bio"
                  rows={4}
                  placeholder="What kind of work do you do, and what kind of team brings out your best?"
                  error={errors.bio?.message}
                  {...register('bio', {
                    minLength: { value: 30, message: 'A short bio is at least 30 characters.' },
                  })}
                />
              </div>
            </Panel>

            <Panel title="Resume" subtitle="A PDF, DOC or DOCX file. The UI stores the file name and size for the demo.">
              <FileField
                label="Resume file"
                accept=".pdf,.doc,.docx"
                file={resume}
                onChange={onResume}
                onRemove={() => setResume(null)}
                hint="Up to 5 MB. Attach the version you would send to a hiring team."
              />
              {resume?.updatedAt ? (
                <p className="mt-3 text-[11px] text-faint">
                  Last attached {formatDate(resume.updatedAt)}. The file itself is not uploaded in
                  this demo.
                </p>
              ) : null}
            </Panel>

            <div className="flex flex-wrap justify-end gap-2">
              <Button type="submit" variant="primary" loading={saving}>
                <Save aria-hidden="true" />
                Save profile
              </Button>
            </div>

            <Panel
              title="Demo tools"
              subtitle="The workspace data lives in this browser. Resetting it refetches the DummyJSON directory and returns the roles and applications to their sample state."
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <UserRound className="size-4 text-faint" aria-hidden="true" />
                  Profile data is kept separate from workspace data.
                </div>
                <Button variant="danger" onClick={() => setResetOpen(true)}>
                  <RotateCcw aria-hidden="true" />
                  Reset workspace data
                </Button>
              </div>
            </Panel>
          </div>
        </form>
      </div>

      <PageFooter directorySource={directorySource} directoryUpdatedAt={directoryUpdatedAt} />

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={async () => {
          setResetOpen(false)
          await resetDemoData()
          toast.success('Workspace data was reset to the sample state.')
        }}
        title="Reset the workspace?"
        description="This clears companies, roles, applications and saved jobs in this browser, then refetches the directory. Your account and profile stay."
        confirmLabel="Reset workspace"
      />
    </>
  )
}
