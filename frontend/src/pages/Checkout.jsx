import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaBitcoin, FaEthereum, FaCheck, FaSpinner, FaCopy, FaArrowLeft } from 'react-icons/fa';
import api from '../api/config';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');

  const { miner, hashrate, duration } = location.state || {};

  useEffect(() => {
    if (!miner) {
      navigate('/miners');
    }
  }, [miner, navigate]);

  const cryptoOptions = [
    { id: 'BTC', name: 'Bitcoin', icon: FaBitcoin, color: 'text-orange-500' },
    { id: 'ETH', name: 'Ethereum', icon: FaEthereum, color: 'text-purple-400' },
  ];

  const calculatePrice = () => {
    if (!miner) return 0;
    const hashRatio = hashrate / miner.hashrate_th;
    return miner.price_usd * hashRatio * (duration / 30);
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/payments/checkout', {
        miner_id: miner.id,
        hashrate_allocated: hashrate,
        duration_days: duration,
        crypto_type: selectedCrypto
      });

      setOrder(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!order) return;
    setProcessing(true);
    setError('');

    try {
      await api.put(`/api/payments/${order.payment.id}/simulate-confirm`);

      navigate('/rentals', { state: { success: true, message: 'Payment confirmed! Your mining contract is now active.' } });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process payment');
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!miner) return null;

  const totalPrice = calculatePrice();

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/miners')}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <FaArrowLeft /> Back to Miners
      </button>

      <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
        Checkout
      </h1>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Miner</span>
                <span className="font-medium">{miner.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Model</span>
                <span>{miner.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Hashrate</span>
                <span className="text-purple-400">{hashrate} TH/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Duration</span>
                <span>{duration} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Efficiency</span>
                <span>{miner.efficiency} W/TH</span>
              </div>
              
              <div className="border-t border-gray-700 pt-4 mt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-green-400">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {!order && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Select Payment Method</h2>
              
              <div className="grid grid-cols-2 gap-4">
                {cryptoOptions.map((crypto) => (
                  <button
                    key={crypto.id}
                    onClick={() => setSelectedCrypto(crypto.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedCrypto === crypto.id
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <crypto.icon className={`text-3xl ${crypto.color} mx-auto mb-2`} />
                    <p className="text-sm font-medium">{crypto.name}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {!order ? (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Confirm Order</h2>
              <p className="text-gray-400 mb-6">
                Review your order details and click the button below to proceed with payment.
              </p>
              
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white py-4 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Creating Order...
                  </>
                ) : (
                  <>
                    Proceed to Payment
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-2 text-green-400 mb-4">
                <FaCheck />
                <span className="font-semibold">Order Created</span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Order ID</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-gray-900 px-3 py-2 rounded flex-1 text-sm">
                      #{order.rental.id}
                    </code>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">Payment ID</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-gray-900 px-3 py-2 rounded flex-1 text-sm">
                      #{order.payment.id}
                    </code>
                    <button
                      onClick={() => copyToClipboard(order.payment.id.toString())}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      {copied ? <FaCheck className="text-green-400" /> : <FaCopy />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">Amount</label>
                  <p className="text-2xl font-bold text-green-400 mt-1">
                    ${order.total_price_usd.toFixed(2)}
                  </p>
                </div>

                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mt-4">
                  <p className="text-yellow-400 text-sm">
                    This is a simulation environment. Click the button below to simulate a successful payment.
                  </p>
                </div>

                <button
                  onClick={handleSimulatePayment}
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                >
                  {processing ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      Simulate Payment Confirmation
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
            <h3 className="font-medium mb-2">What happens next?</h3>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>1. Your order is created and awaiting payment</li>
              <li>2. Once payment is confirmed, your mining contract activates</li>
              <li>3. You start earning Bitcoin immediately</li>
              <li>4. Monitor your earnings in the Dashboard</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
