import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaChartLine, FaServer, FaList, FaGift, FaUser } from 'react-icons/fa'

const BottomTabs = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const tabs = [
    {
      path: '/',
      icon: FaChartLine,
      label: 'Dashboard',
      requiresAuth: false
    },
    {
      path: '/miners',
      icon: FaServer,
      label: 'Miners',
      requiresAuth: false
    },
    {
      path: '/rentals',
      icon: FaList,
      label: 'Rentals',
      requiresAuth: true
    },
    {
      path: '/referrals',
      icon: FaGift,
      label: 'Referrals',
      requiresAuth: true
    },
    {
      path: '/account',
      icon: FaUser,
      label: 'Account',
      requiresAuth: false
    }
  ]

  const handleTabClick = (tab, e) => {
    if (tab.requiresAuth && !user) {
      e.preventDefault()
      navigate('/login')
    }
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-card border-t border-gray-800 z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              onClick={(e) => handleTabClick(tab, e)}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 h-full py-2 transition-colors ${
                  isActive
                    ? 'text-purple-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`
              }
              end={tab.path === '/'}
            >
              <Icon className="text-xl mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomTabs
