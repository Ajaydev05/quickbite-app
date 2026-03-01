import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, UtensilsCrossed } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><UtensilsCrossed size={40} /><h2>QuickBite</h2></div>
        <h3>Welcome back</h3>
        <p className="auth-subtitle">Sign in to your account</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                onChange={e => setForm({...form, password: e.target.value})} required />
              <button type="button" onClick={() => setShowPwd(!showPwd)}>{showPwd ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </div>
          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="demo-creds">
          <p>Demo: <code>demo@quickbite.com</code> / <code>demo123</code></p>
        </div>
        <p className="auth-footer">Don't have an account? <Link to="/register">Sign Up</Link></p>
      </div>
    </div>
  );
};

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'customer' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card wide">
        <div className="auth-logo"><UtensilsCrossed size={40} /><h2>QuickBite</h2></div>
        <h3>Create Account</h3>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input placeholder="John Doe" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input placeholder="+91 9999999999" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <div className="password-wrapper">
                <input type={showPwd ? 'text' : 'password'} placeholder="Min 6 chars" value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})} required />
                <button type="button" onClick={() => setShowPwd(!showPwd)}>{showPwd ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" placeholder="Repeat password" value={form.confirmPassword}
                onChange={e => setForm({...form, confirmPassword: e.target.value})} required />
            </div>
          </div>
          <div className="form-group">
            <label>I am a</label>
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
              <option value="customer">Customer</option>
              <option value="restaurant_owner">Restaurant Owner</option>
            </select>
          </div>
          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-footer">Already have an account? <Link to="/login">Sign In</Link></p>
      </div>
    </div>
  );
};

export default LoginPage;
