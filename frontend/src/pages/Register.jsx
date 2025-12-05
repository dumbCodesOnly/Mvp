import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { FaBitcoin } from 'react-icons/fa'
import LoadingSpinner from '../components/LoadingSpinner'

const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await register(email, password, referralCode)
      toast.success('Welcome to CloudMiner!', 'Account Created')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to register', 'Registration Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4">
      <div className="max-w-md w-full animate-fade-in-up">
        <div className="text-center mb-8">
          <FaBitcoin className="text-6xl text-yellow-500 mx-auto mb-4 animate-bounce-slow" />
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
              CloudMiner
            </span>
          </h1>
          <p className="text-gray-400">Create your mining account</p>
        </div>

        <div className="glass-card p-8 rounded-2xl hover-glow">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-card border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-all duration-200"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-card border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-all duration-200"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-dark-card border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-all duration-200"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Referral Code (Optional)</label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                className="w-full bg-dark-card border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-all duration-200"
                placeholder="XXXXXXXX"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-primary hover:opacity-90 py-3 rounded-lg font-semibold btn-transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Creating account...</span>
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
