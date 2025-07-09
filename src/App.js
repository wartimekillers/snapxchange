import React, { useState, useEffect } from 'react';
import './index.css';

export default function App() {
  const [amount, setAmount] = useState('');
  const [rawAmount, setRawAmount] = useState('');
  const [direction, setDirection] = useState('VND to IDR');
  const [exchangeRate, setExchangeRate] = useState(null);
  const [converted, setConverted] = useState(null);
  const [rateData, setRateData] = useState(null);

  // Remove the static PROFIT_MARGIN
  // const PROFIT_MARGIN = 0.0235;

  // Helper to get profit margin based on amount
  const getProfitMargin = () => {
    const amt = parseFloat(rawAmount || '0');
    if (amt > 20200000) return 0.015;
    return 0.0235;
  };

  const fromCurrency = direction === 'VND to IDR' ? 'VND' : 'IDR';
  const toCurrency = direction === 'VND to IDR' ? 'IDR' : 'VND';

  useEffect(() => {
    async function getRates() {
      try {
        const [vndRes, idrRes] = await Promise.all([
          fetch('https://open.er-api.com/v6/latest/VND'),
          fetch('https://open.er-api.com/v6/latest/IDR'),
        ]);
        const vndData = await vndRes.json();
        const idrData = await idrRes.json();
        const vndToIdrBase = vndData.rates.IDR;
        const idrToVndBase = idrData.rates.VND;
        const PROFIT_MARGIN = getProfitMargin();
        setRateData({
          vndToIdr: {
            buy: vndToIdrBase * (1 - PROFIT_MARGIN),
            sell: vndToIdrBase * (1 + PROFIT_MARGIN),
          },
          idrToVnd: {
            buy: idrToVndBase * (1 - PROFIT_MARGIN),
            sell: idrToVndBase * (1 + PROFIT_MARGIN),
          },
        });
        const currentRate =
          direction === 'VND to IDR'
            ? vndToIdrBase * (1 - PROFIT_MARGIN)
            : idrToVndBase * (1 - PROFIT_MARGIN);
        setExchangeRate(currentRate);
      } catch (err) {
        console.error('Error fetching rates:', err);
      }
    }
    getRates();
  }, [direction, rawAmount]);

  useEffect(() => {
    if (rawAmount && exchangeRate) {
      const result = parseFloat(rawAmount) * exchangeRate;
      const formatted = new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 0,
      }).format(result);
      setConverted(formatted);
    } else {
      setConverted(null);
    }
  }, [rawAmount, exchangeRate]);

  const handleInputChange = (e) => {
    const input = e.target.value.replace(/,/g, '');
    if (!/^\d*$/.test(input)) return;
    setRawAmount(input);
    const formatted = new Intl.NumberFormat('en-US').format(input);
    setAmount(formatted);
  };

  const handleSwitch = () => {
    setDirection((prev) => (prev === 'VND to IDR' ? 'IDR to VND' : 'VND to IDR'));
    setAmount('');
    setRawAmount('');
    setConverted(null);
  };

  const handleWhatsAppOrder = () => {
    const phone = '628111532118';
    const message = encodeURIComponent(
      `Hi, I want to exchange ${amount} ${fromCurrency} to ${toCurrency}. Estimated: ${converted} ${toCurrency}`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <div className="text-gray-800 font-sans bg-cover bg-center" style={{ backgroundImage: `url('/background.jpg')` }}>
      {/* Header */}
      <header className="bg-[#003087]/90 backdrop-blur-md py-4 px-8 fixed top-0 left-0 right-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-white text-2xl font-bold">SnapXchange</h1>
          <nav className="flex space-x-6 text-sm text-white font-medium">
            <a href="#home" className="hover:underline">Home</a>
            <a href="#how" className="hover:underline">How to Order</a>
            <a href="#about" className="hover:underline">About Us</a>
          </nav>
        </div>
      </header>

      {/* Home Section */}
      <section id="home" className="min-h-screen pt-32 px-6 lg:px-0 flex flex-col items-center justify-start text-center bg-[#003087]/60 backdrop-blur-sm">
  <div className="max-w-3xl text-white mb-10">
    <h2 className="text-5xl font-bold mb-4">Exchange VND ↔ IDR Instantly</h2>
    <p className="text-lg">Simple, Fast, and Transparent. Get started today with SnapXchange.</p>
  </div>

  <div className="w-full max-w-md bg-white bg-opacity-95 shadow-2xl rounded-3xl p-8">
    <h2 className="text-2xl font-bold text-[#003087] text-center mb-6">Currency Exchange</h2>

    {rateData && (
      <div className="text-sm bg-[#f9fafb] border border-gray-200 p-4 rounded-xl mb-5">
        <div className="mb-2">
          <p className="text-gray-600 font-semibold">VND to IDR</p>
          <p className="flex justify-between">
            <span className="text-blue-600">Buy: {(rateData.vndToIdr.buy).toFixed(2)}</span>
            <span className="text-green-600">Sell: {(rateData.vndToIdr.sell).toFixed(2)}</span>
          </p>
        </div>
        <div>
          <p className="text-gray-600 font-semibold">IDR to VND</p>
          <p className="flex justify-between">
            <span className="text-blue-600">Buy: {(rateData.idrToVnd.buy).toFixed(2)}</span>
            <span className="text-green-600">Sell: {(rateData.idrToVnd.sell).toFixed(2)}</span>
          </p>
        </div>
      </div>
    )}

    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <p className="text-gray-700 font-medium">Direction</p>
        <button onClick={handleSwitch} className="text-sm text-blue-600 hover:underline">Switch</button>
      </div>
      <div className="bg-gray-100 rounded-md px-3 py-2 text-center">{direction}</div>
    </div>

    <div className="mb-4">
      <label className="block mb-1 text-sm font-medium text-gray-700">
        Enter amount in {fromCurrency}
      </label>
      <input
        type="text"
        placeholder="0"
        value={amount}
        onChange={handleInputChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg"
      />
    </div>

    {converted && (
      <div className="mb-4 text-center">
        <p className="text-gray-700">
          ≈ <span className="text-green-600 font-semibold text-xl">{converted}</span> {toCurrency}
        </p>
      </div>
    )}

    <button
      onClick={handleWhatsAppOrder}
      className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white py-3 rounded-xl font-semibold text-lg shadow-md transition"
    >
      Order via WhatsApp
    </button>
  </div>
</section>


      {/* Exchange Box */}
      

      {/* How to Order */}
      <section id="how" className="bg-white py-20 px-6 text-center mt-10">
        <h2 className="text-4xl font-bold mb-6 text-[#003087]">How to Order</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-700">
          <div>
            <div className="text-5xl mb-2">💰</div>
            <h3 className="font-bold text-lg mb-2">1. Input Your Amount</h3>
            <p>Start by entering the amount of VND or IDR you want to exchange.</p>
          </div>
          <div>
            <div className="text-5xl mb-2">🔁</div>
            <h3 className="font-bold text-lg mb-2">2. Review Estimate</h3>
            <p>Check the live rate and see how much you'll receive instantly.</p>
          </div>
          <div>
            <div className="text-5xl mb-2">📱</div>
            <h3 className="font-bold text-lg mb-2">3. Order on WhatsApp</h3>
            <p>Click the button to place your exchange order securely via WhatsApp.</p>
          </div>
        </div>
      </section>

      {/* About Us */}
      <section id="about" className="bg-[#f5f7fa] py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto text-gray-700">
          <h2 className="text-4xl font-bold text-[#003087] mb-6">About Us</h2>
          <p className="text-lg">
            SnapXchange is your trusted VND ↔ IDR currency exchange platform, built with transparency, speed, and security in mind. We're committed to giving you the best experience possible when exchanging currency between Vietnam and Indonesia.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#003087] text-white py-6 px-8 text-center text-sm">
        <p>Address: Jl. SnapXchange No. 123, Jakarta, Indonesia</p>
        <p>&copy; 2025 SnapXchange. All rights reserved.</p>
      </footer>
    </div>
  );
}
