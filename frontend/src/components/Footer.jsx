import { FaBitcoin, FaTwitter, FaTelegram, FaDiscord, FaGithub } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-dark-card border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <FaBitcoin className="text-3xl text-yellow-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                CloudMiner
              </span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              The world's most advanced cloud mining platform. Rent hash power and start earning Bitcoin today with transparent fees and daily payouts.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FaTwitter className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FaTelegram className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FaDiscord className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FaGithub className="text-xl" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition">Dashboard</Link>
              </li>
              <li>
                <Link to="/miners" className="text-gray-400 hover:text-white transition">Mining Plans</Link>
              </li>
              <li>
                <Link to="/rentals" className="text-gray-400 hover:text-white transition">My Rentals</Link>
              </li>
              <li>
                <Link to="/referrals" className="text-gray-400 hover:text-white transition">Referrals</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">How It Works</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">FAQ</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">Privacy Policy</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} CloudMiner. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm mt-2 md:mt-0">
            Powered by blockchain technology
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
