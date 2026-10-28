import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useHule } from '../../context/HuleContext';

export default function AdminLoginPage() {
  const { currentAdmin, loginAdmin } = useHule();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@hulemahjong.id');
  const [password, setPassword] = useState('password123');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Admin Login — Hule Mahjong CMS';
  }, []);

  if (currentAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const ok = loginAdmin(email, password);
    if (ok) {
      navigate('/admin');
    } else {
      setError('Invalid admin email or password. Try the demo credentials below.');
    }
  };

  return (
    <div className="bg-[#c3b091] min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-[28px] max-w-[430px] w-full p-7 sm:p-9 shadow-2xl border border-white/60">
        <div className="text-center mb-7">
          <Link to="/" className="inline-flex items-baseline text-[24px] tracking-[-0.03em] text-[#141413]">
            <span className="font-normal">Hule</span>
            <span className="font-bold">Mahjong</span>
          </Link>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8c734b] mt-2">
            Management CMS Portal
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="cms-label">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="cms-input"
            />
          </div>

          <div>
            <label className="cms-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="cms-input"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-stone-600 pt-1">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="rounded border-stone-300"
              />
              <span>Keep me signed in</span>
            </label>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@hulemahjong.id');
                setPassword('password123');
                setError('');
              }}
              className="text-[#8c734b] font-semibold hover:underline"
            >
              Fill Demo Login
            </button>
          </div>

          <button
            type="submit"
            className="w-full h-[46px] rounded-full bg-[#111111] hover:bg-[#c3b091] text-white hover:text-[#141310] font-semibold text-[13.5px] transition mt-2"
          >
            Sign In to CMS →
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-stone-100 text-center">
          <Link to="/" className="text-xs font-medium text-stone-500 hover:text-stone-900">
            ← Back to Booking Website
          </Link>
        </div>
      </div>
    </div>
  );
}
