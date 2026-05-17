import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      const data = err.response?.data
      const msg = data ? Object.values(data).flat().join(' ') : 'Registration failed.'
      setError(msg)
    } finally { setLoading(false) }
  }

  return (
    <div style={{ background: '#EAEDED', minHeight: 'calc(100vh - 96px)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '24px', paddingBottom: '40px' }}>

      <Link to="/" style={{ textDecoration: 'none', marginBottom: '20px' }}>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: '900', color: '#131921', letterSpacing: '-1px' }}>
          shop<span style={{ color: '#FF9900' }}>ease</span>
        </span>
      </Link>

      <div style={{ background: '#fff', border: '1px solid #D5D9D9', borderRadius: '8px', padding: '36px 28px', width: '100%', maxWidth: '400px', boxShadow: '0 2px 5px rgba(15,17,17,0.08)' }}>
        <h1 style={{ fontSize: '1.55rem', fontWeight: '400', color: '#0F1111', marginBottom: '6px', fontFamily: 'Georgia, serif' }}>Create account</h1>
        <p style={{ color: '#565959', fontSize: '0.85rem', marginBottom: '20px' }}>Already have an account? <Link to="/login" style={{ color: '#007185', fontWeight: '600', textDecoration: 'none' }}>Sign in</Link></p>

        {error && (
          <div style={{ border: '1px solid #C40000', borderRadius: '6px', padding: '10px 14px', marginBottom: '16px', background: '#FFF0F0', color: '#C40000', fontSize: '0.85rem' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {[
            { label: 'Your name (username)', key: 'username', type: 'text', placeholder: 'First and last name' },
            { label: 'Email', key: 'email', type: 'email', placeholder: '' },
            { label: 'Password', key: 'password', type: 'password', placeholder: 'At least 6 characters' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key} style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#0F1111', marginBottom: '5px' }}>{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                required
                minLength={key === 'password' ? 6 : undefined}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #888', borderRadius: '4px', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = '#FF9900'}
                onBlur={e => e.target.style.borderColor = '#888'}
              />
              {key === 'password' && <div style={{ color: '#565959', fontSize: '0.78rem', marginTop: '4px' }}>Passwords must be at least 6 characters.</div>}
            </div>
          ))}

          <button
            disabled={loading}
            style={{ width: '100%', background: '#FFD814', border: '1px solid #FCD200', borderRadius: '8px', padding: '10px', fontSize: '0.92rem', fontWeight: '700', cursor: 'pointer', color: '#0F1111', marginTop: '8px', boxShadow: '0 2px 5px rgba(213,149,0,0.4)' }}
          >
            {loading ? 'Creating account...' : 'Create your ShopEase account'}
          </button>
        </form>

        <div style={{ borderTop: '1px solid #E7E7E7', marginTop: '20px', paddingTop: '14px', fontSize: '0.8rem', color: '#565959', lineHeight: 1.5 }}>
          By creating an account, you agree to ShopEase's Conditions of Use and Privacy Notice.
        </div>
      </div>

      <div style={{ marginTop: '24px', fontSize: '0.75rem', color: '#999', textAlign: 'center' }}>
        <div>© 2026 ShopEase, Inc.</div>
        <div style={{ marginTop: '4px', fontStyle: 'italic', color: '#aaa' }}>Made with ♥ by <span style={{ color: '#FF9900', fontWeight: '700', fontStyle: 'normal' }}>Satyam</span></div>
      </div>
    </div>
  )
}
