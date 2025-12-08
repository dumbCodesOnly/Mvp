import { useState, useEffect } from 'react'
import api from '../api/config'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { FaGift, FaUsers, FaDollarSign, FaCopy, FaCheck, FaShare } from 'react-icons/fa'
import { format } from 'date-fns'

const Referrals = () => {
  const [stats, setStats] = useState(null)
  const [referrals, setReferrals] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchReferralData()
  }, [user])

  const fetchReferralData = async () => {
    try {
      const [statsRes, referralsRes] = await Promise.all([
        api.get('/api/referrals/stats'),
        api.get('/api/referrals/')
      ])
      setStats(statsRes.data)
      setReferrals(referralsRes.data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch referral data:', error)
      setLoading(false)
    }
  }

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/register?ref=${stats?.referral_code || ''}`
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareReferralLink = () => {
    const referralLink = `${window.location.origin}/register?ref=${stats?.referral_code || ''}`
    const shareText = `Join CloudMiner and start earning Bitcoin! Use my referral code: ${stats?.referral_code}`
    
    if (navigator.share) {
      navigator.share({
        title: 'Join CloudMiner',
        text: shareText,
        url: referralLink
      })
    } else {
      copyReferralLink()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Referral Program</h1>
        <p className="text-gray-400 text-sm md:text-base">Invite friends and earn 3% commission on their rentals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-purple p-3 rounded-lg">
              <FaUsers className="text-2xl text-white" />
            </div>
            <span className="text-gray-400">Total Referrals</span>
          </div>
          <p className="text-4xl font-bold">{stats?.total_referrals || 0}</p>
        </div>
        
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-cyan p-3 rounded-lg">
              <FaDollarSign className="text-2xl text-white" />
            </div>
            <span className="text-gray-400">Total Commission</span>
          </div>
          <p className="text-4xl font-bold text-green-400">${stats?.total_commission_usd?.toFixed(2) || '0.00'}</p>
        </div>
        
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-primary p-3 rounded-lg">
              <FaGift className="text-2xl text-white" />
            </div>
            <span className="text-gray-400">Commission Rate</span>
          </div>
          <p className="text-4xl font-bold text-purple-400">3%</p>
        </div>
      </div>

      <div className="glass-card p-8 rounded-2xl">
        <h2 className="text-2xl font-bold mb-6">Your Referral Link</h2>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-dark-card border border-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-2">Referral Code</p>
            <p className="text-xl font-mono text-purple-400">{stats?.referral_code || 'Loading...'}</p>
          </div>
          
          <div className="flex-1 bg-dark-card border border-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-2">Referral Link</p>
            <p className="text-sm font-mono text-blue-400 break-all">
              {window.location.origin}/register?ref={stats?.referral_code || ''}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-6">
          <button
            onClick={copyReferralLink}
            className={`flex items-center justify-center gap-2 px-6 py-4 md:py-3 rounded-lg font-semibold transition min-h-[52px] flex-1 sm:flex-none ${
              copied 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-gradient-primary hover:opacity-90'
            }`}
          >
            {copied ? <FaCheck /> : <FaCopy />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          
          <button
            onClick={shareReferralLink}
            className="flex items-center justify-center gap-2 px-6 py-4 md:py-3 bg-dark-hover hover:bg-gray-700 rounded-lg font-semibold transition min-h-[52px] flex-1 sm:flex-none"
          >
            <FaShare /> Share
          </button>
        </div>
      </div>

      <div className="glass-card p-6 md:p-8 rounded-2xl">
        <h2 className="text-xl md:text-2xl font-bold mb-6">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center flex flex-row md:flex-col items-center md:items-center gap-4 md:gap-0">
            <div className="bg-gradient-primary w-12 h-12 rounded-full flex items-center justify-center shrink-0 md:mx-auto md:mb-4 text-xl font-bold">
              1
            </div>
            <div className="text-left md:text-center">
              <h3 className="font-bold mb-1 md:mb-2">Share Your Link</h3>
              <p className="text-gray-400 text-sm">
                Share your unique referral link with friends, family, or on social media.
              </p>
            </div>
          </div>
          
          <div className="text-center flex flex-row md:flex-col items-center md:items-center gap-4 md:gap-0">
            <div className="bg-gradient-primary w-12 h-12 rounded-full flex items-center justify-center shrink-0 md:mx-auto md:mb-4 text-xl font-bold">
              2
            </div>
            <div className="text-left md:text-center">
              <h3 className="font-bold mb-1 md:mb-2">Friends Sign Up</h3>
              <p className="text-gray-400 text-sm">
                When they register using your link and rent mining power, you earn rewards.
              </p>
            </div>
          </div>
          
          <div className="text-center flex flex-row md:flex-col items-center md:items-center gap-4 md:gap-0">
            <div className="bg-gradient-primary w-12 h-12 rounded-full flex items-center justify-center shrink-0 md:mx-auto md:mb-4 text-xl font-bold">
              3
            </div>
            <div className="text-left md:text-center">
              <h3 className="font-bold mb-1 md:mb-2">Earn Commission</h3>
              <p className="text-gray-400 text-sm">
                Get 3% commission on all their rental payments. Commissions are paid monthly.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 md:p-8 rounded-2xl">
        <h2 className="text-xl md:text-2xl font-bold mb-6">Your Referrals</h2>
        
        {referrals.length === 0 ? (
          <div className="text-center py-8">
            <FaUsers className="text-4xl md:text-5xl text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-sm md:text-base">You haven't referred anyone yet.</p>
            <p className="text-gray-500 text-xs md:text-sm mt-2">Share your referral link to start earning commissions!</p>
          </div>
        ) : (
          <div className="space-y-4 md:hidden">
            {referrals.map((referral) => (
              <div key={referral.id} className="bg-dark-card p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-gray-300 font-medium">{referral.referred_email || 'Anonymous'}</span>
                  <span className="text-green-400 font-semibold">${referral.commission_earned_usd?.toFixed(2) || '0.00'}</span>
                </div>
                <p className="text-gray-400 text-sm">
                  {referral.created_at 
                    ? format(new Date(referral.created_at), 'MMM dd, yyyy')
                    : 'N/A'
                  }
                </p>
              </div>
            ))}
          </div>
        )}
        
        {referrals.length > 0 && (
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="pb-4 pr-4">Referred User</th>
                  <th className="pb-4 pr-4">Date Joined</th>
                  <th className="pb-4 pr-4">Commission Earned</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((referral) => (
                  <tr key={referral.id} className="border-b border-gray-800">
                    <td className="py-4 pr-4">
                      <span className="text-gray-300">{referral.referred_email || 'Anonymous'}</span>
                    </td>
                    <td className="py-4 pr-4 text-gray-400">
                      {referral.created_at 
                        ? format(new Date(referral.created_at), 'MMM dd, yyyy')
                        : 'N/A'
                      }
                    </td>
                    <td className="py-4 text-green-400 font-semibold">
                      ${referral.commission_earned_usd?.toFixed(2) || '0.00'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Referrals
