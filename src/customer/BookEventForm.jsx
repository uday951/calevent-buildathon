import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

// BookEventForm is replaced by the managed event request flow.
// This component redirects users to PlanMyEvent so no existing links break.
const BookEventForm = () => {
  const { eventId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/plan-my-event', { replace: true })
    }, 3000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center"
      >
        <div className="text-6xl mb-5">🎯</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          We've upgraded our booking system!
        </h1>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Direct booking is replaced by our <strong>managed event planning</strong> flow.
          Submit your requirements and our team will arrange everything for you.
        </p>

        <div className="space-y-3 mb-6 text-left">
          {[
            'Tell us your event requirements',
            'CALEVENT team reviews & contacts you',
            'We assign the best providers',
            'You get a custom quote & confirm',
          ].map((step, i) => (
            <div key={i} className="flex items-center space-x-3 text-sm text-gray-700">
              <div className="w-6 h-6 rounded-full bg-purple-100 text-[#7c3aed] flex items-center justify-center font-bold text-xs shrink-0">
                {i + 1}
              </div>
              <span>{step}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 mb-4">Redirecting automatically in 3 seconds...</p>

        <Link to="/plan-my-event">
          <Button className="w-full bg-[#7c3aed] hover:bg-purple-700 font-bold py-3">
            🚀 Plan My Event Now
          </Button>
        </Link>
        <Link to="/AllEvent" className="block mt-3 text-sm text-gray-500 hover:text-gray-700">
          ← Back to Events
        </Link>
      </motion.div>
    </div>
  )
}

export default BookEventForm
