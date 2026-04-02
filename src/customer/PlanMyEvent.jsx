import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { eventRequestsAPI } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

const EVENT_TYPES = [
  { id: 'wedding',     label: 'Wedding',     icon: '💒' },
  { id: 'birthday',    label: 'Birthday',    icon: '🎂' },
  { id: 'corporate',   label: 'Corporate',   icon: '🏢' },
  { id: 'anniversary', label: 'Anniversary', icon: '💕' },
  { id: 'conference',  label: 'Conference',  icon: '🎤' },
  { id: 'party',       label: 'Party',       icon: '🎉' },
  { id: 'other',       label: 'Other',       icon: '✨' },
]

const SERVICES = [
  { id: 'venue',        label: 'Venue',        icon: '🏛️' },
  { id: 'catering',     label: 'Catering',     icon: '🍽️' },
  { id: 'decoration',   label: 'Decoration',   icon: '🌸' },
  { id: 'photography',  label: 'Photography',  icon: '📸' },
  { id: 'videography',  label: 'Videography',  icon: '🎥' },
  { id: 'lighting',     label: 'Lighting',     icon: '💡' },
  { id: 'sound',        label: 'Sound System', icon: '🔊' },
  { id: 'stage',        label: 'Stage Setup',  icon: '🎭' },
  { id: 'dj',           label: 'DJ',           icon: '🎧' },
  { id: 'band',         label: 'Live Band',    icon: '🎸' },
  { id: 'anchor',       label: 'Anchor/MC',    icon: '🎙️' },
  { id: 'cake',         label: 'Cake',         icon: '🎂' },
  { id: 'flowers',      label: 'Flowers',      icon: '💐' },
  { id: 'transport',    label: 'Transport',    icon: '🚌' },
  { id: 'security',     label: 'Security',     icon: '🛡️' },
]

const STEPS = ['Event Type', 'Event Details', 'Services', 'Review & Submit']

const stepVariants = {
  enter:  (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
}

export default function PlanMyEvent() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [step, setStep]             = useState(0)
  const [dir,  setDir]              = useState(1)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    eventType: '',
    eventTitle: '',
    eventDate: '',
    eventTime: '',
    guestCount: '',
    location: { address: '', city: '', state: '', pincode: '' },
    budget: { min: '', max: '' },
    servicesRequired: [],
    description: '',
    specialRequirements: '',
    contactPreference: 'phone',
  })

  const set    = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const setLoc = (key, val) => setForm(f => ({ ...f, location: { ...f.location, [key]: val } }))
  const setBudget = (key, val) => setForm(f => ({ ...f, budget: { ...f.budget, [key]: val } }))
  const toggleService = (id) => setForm(f => ({
    ...f,
    servicesRequired: f.servicesRequired.includes(id)
      ? f.servicesRequired.filter(s => s !== id)
      : [...f.servicesRequired, id]
  }))

  const next = () => { setDir(1);  setStep(s => s + 1) }
  const prev = () => { setDir(-1); setStep(s => s - 1) }

  const canNext = () => {
    if (step === 0) return !!form.eventType
    if (step === 1) return form.eventDate && form.guestCount && form.location.city && form.location.address && form.budget.max
    if (step === 2) return form.servicesRequired.length > 0
    return true
  }

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to submit an event request')
      navigate('/login/customer')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        guestCount: parseInt(form.guestCount),
        budget: { min: parseInt(form.budget.min) || 0, max: parseInt(form.budget.max) }
      }
      const res = await eventRequestsAPI.create(payload)
      toast.success(res.message || "Request submitted! We'll contact you within 24 hours.")
      navigate('/my-requests')
    } catch (err) {
      toast.error(err.message || 'Failed to submit request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Plan My Event</h1>
          <p className="text-slate-600">Tell us about your dream event — we'll handle the rest</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                i < step ? 'bg-green-500 text-white' : i === step ? 'bg-[#7c3aed] text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <div className="hidden sm:block ml-2 text-xs font-medium text-gray-600">{s}</div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded transition-all ${i < step ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <AnimatePresence custom={dir} mode="wait">
            <motion.div
              key={step}
              custom={dir}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="p-8"
            >
              {/* Step 0 — Event Type */}
              {step === 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">What type of event are you planning?</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {EVENT_TYPES.map(et => (
                      <button key={et.id} onClick={() => set('eventType', et.id)}
                        className={`p-5 rounded-2xl border-2 text-center transition-all hover:shadow-md ${
                          form.eventType === et.id ? 'border-[#7c3aed] bg-purple-50 shadow-md' : 'border-gray-200 hover:border-purple-300'
                        }`}>
                        <div className="text-4xl mb-2">{et.icon}</div>
                        <div className="font-semibold text-slate-800">{et.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 1 — Event Details */}
              {step === 1 && (
                <div className="space-y-5">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Event Details</h2>
                  <div>
                    <label className={lbl}>Event Title (optional)</label>
                    <input className={inp} placeholder="e.g. Priya & Rahul's Wedding" value={form.eventTitle} onChange={e => set('eventTitle', e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={lbl}>Event Date *</label>
                      <input type="date" className={inp} value={form.eventDate} onChange={e => set('eventDate', e.target.value)} min={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div>
                      <label className={lbl}>Event Time</label>
                      <input type="time" className={inp} value={form.eventTime} onChange={e => set('eventTime', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>Expected Guests *</label>
                    <input type="number" className={inp} placeholder="e.g. 200" value={form.guestCount} onChange={e => set('guestCount', e.target.value)} min="1" />
                  </div>
                  <div>
                    <label className={lbl}>Event Address *</label>
                    <input className={inp} placeholder="Full address" value={form.location.address} onChange={e => setLoc('address', e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={lbl}>City *</label>
                      <input className={inp} placeholder="City" value={form.location.city} onChange={e => setLoc('city', e.target.value)} />
                    </div>
                    <div>
                      <label className={lbl}>State</label>
                      <input className={inp} placeholder="State" value={form.location.state} onChange={e => setLoc('state', e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={lbl}>Min Budget (₹)</label>
                      <input type="number" className={inp} placeholder="50,000" value={form.budget.min} onChange={e => setBudget('min', e.target.value)} />
                    </div>
                    <div>
                      <label className={lbl}>Max Budget (₹) *</label>
                      <input type="number" className={inp} placeholder="5,00,000" value={form.budget.max} onChange={e => setBudget('max', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>Contact Preference</label>
                    <div className="flex gap-3">
                      {['phone', 'email', 'whatsapp'].map(c => (
                        <button key={c} onClick={() => set('contactPreference', c)}
                          className={`flex-1 py-2 rounded-xl border-2 text-sm font-semibold capitalize transition-all ${
                            form.contactPreference === c ? 'border-[#7c3aed] bg-purple-50 text-[#7c3aed]' : 'border-gray-200 text-gray-600'
                          }`}>
                          {c === 'phone' ? '📞' : c === 'email' ? '📧' : '💬'} {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2 — Services */}
              {step === 2 && (
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">What services do you need?</h2>
                  <p className="text-slate-500 text-sm mb-6">Select all that apply — we'll arrange everything</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {SERVICES.map(s => (
                      <button key={s.id} onClick={() => toggleService(s.id)}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          form.servicesRequired.includes(s.id) ? 'border-[#7c3aed] bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                        }`}>
                        <div className="text-2xl mb-1">{s.icon}</div>
                        <div className="text-xs font-semibold text-slate-700 leading-tight">{s.label}</div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className={lbl}>Describe your vision (optional)</label>
                      <textarea className={`${inp} h-24 resize-none`} placeholder="Tell us more about what you have in mind..." value={form.description} onChange={e => set('description', e.target.value)} />
                    </div>
                    <div>
                      <label className={lbl}>Special Requirements (optional)</label>
                      <textarea className={`${inp} h-20 resize-none`} placeholder="Any specific requirements or preferences..." value={form.specialRequirements} onChange={e => set('specialRequirements', e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3 — Review */}
              {step === 3 && (
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Review Your Request</h2>
                  <div className="space-y-1">
                    <ReviewRow label="Event Type"  value={EVENT_TYPES.find(e => e.id === form.eventType)?.label} />
                    {form.eventTitle && <ReviewRow label="Title"       value={form.eventTitle} />}
                    <ReviewRow label="Date"         value={form.eventDate} />
                    {form.eventTime && <ReviewRow label="Time"         value={form.eventTime} />}
                    <ReviewRow label="Guests"       value={`${form.guestCount} people`} />
                    <ReviewRow label="Location"     value={`${form.location.address}, ${form.location.city}`} />
                    <ReviewRow label="Budget"       value={`₹${parseInt(form.budget.min || 0).toLocaleString('en-IN')} – ₹${parseInt(form.budget.max).toLocaleString('en-IN')}`} />
                    <ReviewRow label="Services"     value={form.servicesRequired.map(s => SERVICES.find(sv => sv.id === s)?.label).join(', ')} />
                    <ReviewRow label="Contact via"  value={form.contactPreference} />
                    {form.description && <ReviewRow label="Description" value={form.description} />}
                  </div>
                  <div className="mt-6 p-4 bg-purple-50 rounded-2xl border border-purple-200">
                    <p className="text-sm text-purple-800 font-medium">
                      🎯 After submission, our team will review your request and contact you within <strong>24 hours</strong> to discuss details and provide a customized quote.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="px-8 pb-8 flex justify-between items-center">
            <button onClick={prev} disabled={step === 0}
              className="px-6 py-3 rounded-xl border-2 border-gray-200 font-semibold text-gray-600 disabled:opacity-30 hover:border-gray-300 transition-all">
              ← Back
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={next} disabled={!canNext()}
                className="px-8 py-3 rounded-xl bg-[#7c3aed] text-white font-bold disabled:opacity-40 hover:bg-purple-700 transition-all shadow-lg">
                Continue →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting}
                className="px-8 py-3 rounded-xl bg-[#7c3aed] text-white font-bold disabled:opacity-60 hover:bg-purple-700 transition-all shadow-lg">
                {submitting ? 'Submitting...' : '🚀 Submit Request'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const lbl = 'block text-sm font-semibold text-slate-700 mb-1'
const inp = 'w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#7c3aed] transition-colors text-sm'

const ReviewRow = ({ label, value }) => (
  <div className="flex justify-between items-start py-3 border-b border-gray-100 last:border-0">
    <span className="text-sm font-semibold text-slate-500 w-32 shrink-0">{label}</span>
    <span className="text-sm text-slate-800 font-medium text-right flex-1">{value || '—'}</span>
  </div>
)
