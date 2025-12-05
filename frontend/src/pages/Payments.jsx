import { useState, useEffect } from 'react';
import api from '../api/config';
import { FaBitcoin, FaEthereum, FaCheck, FaClock, FaTimes, FaExternalLinkAlt } from 'react-icons/fa';
import { format } from 'date-fns';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/api/payments/user');
      setPayments(response.data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <FaCheck className="text-green-400" />;
      case 'pending':
        return <FaClock className="text-yellow-400" />;
      case 'failed':
        return <FaTimes className="text-red-400" />;
      default:
        return <FaClock className="text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      confirmed: 'bg-green-500/20 text-green-400 border-green-500/50',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      failed: 'bg-red-500/20 text-red-400 border-red-500/50'
    };
    return classes[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/50';
  };

  const getCryptoIcon = (type) => {
    switch (type) {
      case 'BTC':
        return <FaBitcoin className="text-orange-500" />;
      case 'ETH':
        return <FaEthereum className="text-purple-400" />;
      default:
        return <FaBitcoin className="text-orange-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const confirmedPayments = payments.filter(p => p.status === 'confirmed');
  const pendingPayments = payments.filter(p => p.status === 'pending');
  const totalSpent = confirmedPayments.reduce((sum, p) => sum + p.amount_usd, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Payment History</h1>
        <p className="text-gray-400">Track all your transactions and payment status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <p className="text-sm text-gray-400 mb-2">Total Spent</p>
          <p className="text-3xl font-bold text-green-400">${totalSpent.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <p className="text-sm text-gray-400 mb-2">Confirmed Payments</p>
          <p className="text-3xl font-bold text-purple-400">{confirmedPayments.length}</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <p className="text-sm text-gray-400 mb-2">Pending Payments</p>
          <p className="text-3xl font-bold text-yellow-400">{pendingPayments.length}</p>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">ID</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Crypto</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Transaction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                    <p className="text-lg mb-2">No payments yet</p>
                    <p className="text-sm">Your payment history will appear here after you rent a miner.</p>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm">#{payment.id}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {format(new Date(payment.created_at), 'MMM d, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-green-400">
                        ${payment.amount_usd.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getCryptoIcon(payment.crypto_type)}
                        <span>{payment.crypto_type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs border ${getStatusBadge(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {payment.tx_hash ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-gray-400 truncate max-w-[120px]">
                            {payment.tx_hash.substring(0, 16)}...
                          </span>
                          <FaExternalLinkAlt className="text-gray-500 text-xs" />
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;
