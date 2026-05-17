import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [tab, setTab] = useState('user')
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const fillSeller = () => setForm({ username: 'satyam', password: '12345' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(form.username, form.password)
      if (tab === 'seller' && data.user.role !== 'seller' && data.user.role !== 'admin') {
        setError('This account does not have seller access.')
        setLoading(false)
        return
      }
      navigate(tab === 'seller' ? '/seller' : '/')
    } catch {
      setError('Your username or password is incorrect.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#EAEDED', minHeight: 'calc(100vh - 96px)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '24px', paddingBottom: '40px', position: 'relative' }}>

      {/* Logo */}
      <Link to="/" style={{ textDecoration: 'none', marginBottom: '20px' }}>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: '900', color: '#131921', letterSpacing: '-1px' }}>
          shop<span style={{ color: '#FF9900' }}>ease</span>
        </span>
      </Link>

      {/* Tab Toggle */}
      <div style={{ display: 'flex', background: '#fff', border: '1px solid #D5D9D9', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px', boxShadow: '0 2px 5px rgba(15,17,17,0.08)' }}>
        {[['user', '🛍️ Customer Login'], ['seller', '⚡ Seller Login']].map(([key, label]) => (
          <button key={key} onClick={() => { setTab(key); setError(''); setForm({ username: '', password: '' }) }}
            style={{ padding: '10px 28px', border: 'none', borderRight: key === 'user' ? '1px solid #D5D9D9' : 'none', fontWeight: tab === key ? '700' : '500', fontSize: '0.88rem', cursor: 'pointer', background: tab === key ? '#FFD814' : '#fff', color: '#0F1111', transition: 'background 0.15s' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Card */}
      <div style={{ background: '#fff', border: '1px solid #D5D9D9', borderRadius: '8px', padding: '36px 28px', width: '100%', maxWidth: '348px', boxShadow: '0 2px 5px rgba(15,17,17,0.08)' }}>
        <h1 style={{ fontSize: '1.55rem', fontWeight: '400', color: '#0F1111', marginBottom: '20px', fontFamily: 'Georgia, serif' }}>
          {tab === 'seller' ? 'Seller Sign-In' : 'Sign-In'}
        </h1>

        {tab === 'seller' && (
          <div style={{ background: '#FFF3E0', border: '1px solid #FF9900', borderRadius: '6px', padding: '12px 14px', marginBottom: '16px', fontSize: '0.82rem' }}>
            <div style={{ fontWeight: '700', color: '#7B3F00', marginBottom: '4px' }}>Demo Seller Credentials</div>
            <div style={{ color: '#555' }}>Username: <strong>satyam</strong></div>
            <div style={{ color: '#555' }}>Password: <strong>12345</strong></div>
            <button onClick={fillSeller} style={{ marginTop: '8px', background: '#FF9900', color: '#fff', border: 'none', borderRadius: '4px', padding: '5px 12px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}>Auto-fill</button>
          </div>
        )}

        {error && (
          <div style={{ border: '1px solid #C40000', borderRadius: '6px', padding: '10px 14px', marginBottom: '16px', background: '#FFF0F0', color: '#C40000', fontSize: '0.85rem' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#0F1111', marginBottom: '5px' }}>Username</label>
          <input
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            placeholder="Enter username"
            required
            style={{ width: '100%', padding: '8px 10px', border: '1px solid #888', borderRadius: '4px', fontSize: '0.95rem', marginBottom: '14px', boxSizing: 'border-box', outline: 'none' }}
            onFocus={e => e.target.style.borderColor = '#FF9900'}
            onBlur={e => e.target.style.borderColor = '#888'}
          />
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#0F1111', marginBottom: '5px' }}>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            placeholder="Enter password"
            required
            style={{ width: '100%', padding: '8px 10px', border: '1px solid #888', borderRadius: '4px', fontSize: '0.95rem', marginBottom: '18px', boxSizing: 'border-box', outline: 'none' }}
            onFocus={e => e.target.style.borderColor = '#FF9900'}
            onBlur={e => e.target.style.borderColor = '#888'}
          />
          <button
            disabled={loading}
            style={{ width: '100%', background: '#FFD814', border: '1px solid #FCD200', borderRadius: '8px', padding: '10px', fontSize: '0.92rem', fontWeight: '700', cursor: 'pointer', color: '#0F1111', boxShadow: '0 2px 5px rgba(213,149,0,0.4)' }}
          >
            {loading ? 'Signing in...' : tab === 'seller' ? '⚡ Continue to Dashboard' : 'Continue'}
          </button>
        </form>

        <div style={{ borderTop: '1px solid #E7E7E7', marginTop: '20px', paddingTop: '16px', fontSize: '0.82rem', color: '#565959' }}>
          By continuing, you agree to ShopEase's Conditions of Use.
        </div>

        <div style={{ marginTop: '16px', fontSize: '0.85rem', textAlign: 'center', color: '#0F1111' }}>
          New customer? <Link to="/register" style={{ color: '#007185', fontWeight: '600', textDecoration: 'none' }}>Create your account</Link>
        </div>
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: '348px', margin: '20px 0 10px' }}>
        <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #D5D9D9' }} />
        <span style={{ padding: '0 10px', fontSize: '0.78rem', color: '#767676' }}>New to ShopEase?</span>
        <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #D5D9D9' }} />
      </div>

      <Link to="/register" style={{ display: 'block', background: '#fff', border: '1px solid #D5D9D9', borderRadius: '8px', padding: '10px', width: '100%', maxWidth: '348px', textAlign: 'center', textDecoration: 'none', color: '#0F1111', fontWeight: '600', fontSize: '0.88rem', boxShadow: '0 2px 5px rgba(15,17,17,0.08)' }}>
        Create your ShopEase account
      </Link>

      {/* Watermark */}
      <div style={{ marginTop: '32px', fontSize: '0.75rem', color: '#999', textAlign: 'center' }}>
        <div>© 2026 ShopEase, Inc. All rights reserved.</div>
        <div style={{ marginTop: '4px', fontStyle: 'italic', color: '#aaa' }}>Made with ♥ by <span style={{ color: '#FF9900', fontWeight: '700', fontStyle: 'normal' }}>Satyam</span></div>
      </div>
    </div>
  )
}
