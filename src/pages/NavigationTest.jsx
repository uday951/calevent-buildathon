import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export default function NavigationTest() {
  const navigate = useNavigate()

  const testNavigation = () => {
    console.log('Testing navigation to /plan-my-event')
    navigate('/plan-my-event')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Navigation Test</h1>
        <Button onClick={testNavigation} className="bg-purple-600 hover:bg-purple-700">
          Test Navigate to Plan My Event
        </Button>
        <div className="mt-4">
          <a href="/plan-my-event" className="text-purple-600 underline">
            Direct Link to Plan My Event
          </a>
        </div>
      </div>
    </div>
  )
}
