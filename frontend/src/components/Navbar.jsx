import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import api from '../api'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { cart } = useCart()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [dropdown, setDropdown] = useState(false)
  const dropRef = useRef(null)
  const totalItems = cart.items.reduce((s, i) => s + i.quantity, 0)

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropdown(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`)
  }

  const handleLogout = () => { logout(); navigate('/'); setDropdown(false) }

  return (
    <header>
      {/* Main Bar */}
      <div style={{ background: '#131921', display: 'flex', alignItems: 'center', padding: '8px 12px', gap: '10px', height: '60px' }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', flexShrink: 0, border: '1px solid transparent', borderRadius: '3px', padding: '6px 8px', display: 'flex', alignItems: 'center' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#fff'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
          <span style={{ color: '#fff', fontWeight: '900', fontSize: '1.5rem', fontFamily: 'Georgia, serif', letterSpacing: '-1px' }}>
            shop<span style={{ color: '#FF9900' }}>ease</span>
          </span>
        </Link>

        {/* Deliver to */}
        {user && (
          <div style={{ color: '#ccc', fontSize: '0.72rem', flexShrink: 0, cursor: 'pointer', border: '1px solid transparent', borderRadius: '3px', padding: '6px 8px' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#fff'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
            <div>Deliver to</div>
            <div style={{ color: '#fff', fontWeight: '700', fontSize: '0.82rem' }}>📍 Your Location</div>
          </div>
        )}

        {/* Search */}
        <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', height: '40px', maxWidth: '860px' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products, categories, brands..."
            style={{ flex: 1, padding: '0 14px', border: 'none', borderRadius: '4px 0 0 4px', fontSize: '0.92rem', outline: 'none', color: '#0F1111' }}
          />
          <button type="submit" style={{ background: '#FF9900', border: 'none', borderRadius: '0 4px 4px 0', padding: '0 14px', cursor: 'pointer', fontSize: '1.1rem', color: '#131921' }}>
            🔍
          </button>
        </form>

        {/* Right Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          {/* Account */}
          <div ref={dropRef} style={{ position: 'relative' }}>
            <div onClick={() => setDropdown(!dropdown)} style={{ color: '#fff', cursor: 'pointer', border: '1px solid transparent', borderRadius: '3px', padding: '6px 10px', fontSize: '0.82rem' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#fff'}
              onMouseLeave={e => !dropdown && (e.currentTarget.style.borderColor = 'transparent')}>
              <div style={{ color: '#ccc', fontSize: '0.72rem' }}>Hello, {user ? user.username : 'Sign in'}</div>
              <div style={{ fontWeight: '700' }}>Account & Lists ▾</div>
            </div>
            {dropdown && (
              <div style={{ position: 'absolute', right: 0, top: '100%', background: '#fff', borderRadius: '4px', boxShadow: '0 4px 24px rgba(0,0,0,0.25)', minWidth: '240px', zIndex: 500, padding: '16px', border: '1px solid #D5D9D9' }}>
                {!user ? (
                  <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                    <Link to="/login" onClick={() => setDropdown(false)} style={{ display: 'block', background: '#FFD814', border: '1px solid #FCD200', borderRadius: '8px', padding: '9px', fontWeight: '700', textDecoration: 'none', color: '#0F1111', fontSize: '0.9rem', marginBottom: '8px' }}>Sign In</Link>
                    <p style={{ fontSize: '0.82rem', color: '#0F1111' }}>New customer? <Link to="/register" onClick={() => setDropdown(false)} style={{ color: '#007185' }}>Start here</Link></p>
                  </div>
                ) : (
                  <div>
                    <Link to="/orders" onClick={() => setDropdown(false)} style={ddItem}>📦 Your Orders</Link>
                    {(user.role === 'seller' || user.role === 'admin') && <Link to="/seller" onClick={() => setDropdown(false)} style={ddItem}>⚡ Seller Dashboard</Link>}
                    <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '8px 0' }} />
                    <div onClick={handleLogout} style={{ ...ddItem, color: '#C7511F', cursor: 'pointer' }}>Sign Out</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Returns */}
          <Link to="/orders" style={{ color: '#fff', textDecoration: 'none', border: '1px solid transparent', borderRadius: '3px', padding: '6px 10px', fontSize: '0.82rem' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#fff'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
            <div style={{ color: '#ccc', fontSize: '0.72rem' }}>Returns</div>
            <div style={{ fontWeight: '700' }}>& Orders</div>
          </Link>

          {/* Cart */}
          <Link to="/cart" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid transparent', borderRadius: '3px', padding: '6px 10px' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#fff'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
            <div style={{ position: 'relative' }}>
              <span style={{ fontSize: '1.8rem' }}>🛒</span>
              {totalItems > 0 && (
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#FF9900', color: '#0F1111', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: '800' }}>{totalItems}</span>
              )}
            </div>
            <span style={{ color: '#fff', fontWeight: '700', fontSize: '0.88rem' }}>Cart</span>
          </Link>
        </div>
      </div>

      {/* Sub Bar */}
      <div style={{ background: '#232F3E', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '4px', height: '36px', overflowX: 'auto' }}>
        {[
          { label: '☰ All', to: '/products' },
          { label: 'Electronics', to: '/products?category=1' },
          { label: 'Clothing', to: '/products?category=2' },
          { label: 'Books', to: '/products?category=3' },
          { label: 'Home & Garden', to: '/products?category=4' },
          { label: 'Sports', to: '/products?category=5' },
          { label: "Today's Deals", to: '/products' },
          { label: 'Best Sellers', to: '/products' },
        ].map(({ label, to }) => (
          <Link key={label} to={to} style={{ color: '#fff', textDecoration: 'none', padding: '0 10px', fontSize: '0.82rem', fontWeight: '500', whiteSpace: 'nowrap', height: '36px', display: 'flex', alignItems: 'center', borderRadius: '3px', border: '1px solid transparent', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent' }}>
            {label}
          </Link>
        ))}
        {user && (user.role === 'seller' || user.role === 'admin') && (
          <Link to="/seller" style={{ color: '#FF9900', textDecoration: 'none', padding: '0 10px', fontSize: '0.82rem', fontWeight: '700', whiteSpace: 'nowrap', height: '36px', display: 'flex', alignItems: 'center', borderRadius: '3px', border: '1px solid transparent', flexShrink: 0, marginLeft: 'auto' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF9900' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent' }}>
            ⚡ Seller Dashboard
          </Link>
        )}
      </div>
    </header>
  )
}

const ddItem = { display: 'block', padding: '7px 10px', color: '#0F1111', textDecoration: 'none', fontSize: '0.88rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }
