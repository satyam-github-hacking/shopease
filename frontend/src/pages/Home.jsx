import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = [
  { name: 'Electronics', icon: '💻', bg: '#F0F2F2' },
  { name: 'Clothing', icon: '👕', bg: '#FDF2E9' },
  { name: 'Books', icon: '📚', bg: '#EAF4FB' },
  { name: 'Home & Garden', icon: '🏡', bg: '#EAFAF1' },
  { name: 'Sports', icon: '⚽', bg: '#FDEDEC' },
]

export default function Home() {
  const [featured, setFeatured] = useState([])
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/products/').then(r => setFeatured(r.data.slice(0, 8))).catch(() => {})
  }, [])

  return (
    <div style={{ background: '#EAEDED', minHeight: 'calc(100vh - 96px)' }}>
      {/* Hero Banner */}
      <div style={{ position: 'relative', width: '100%', background: 'linear-gradient(135deg, #232F3E 0%, #37475A 100%)', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1500px', margin: '0 auto', display: 'flex', alignItems: 'center', padding: '60px 32px', gap: '60px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'inline-block', background: '#FF9900', color: '#131921', fontSize: '0.78rem', fontWeight: '700', padding: '4px 12px', borderRadius: '3px', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              New Arrivals
            </div>
            <h1 style={{ color: '#fff', fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: '300', lineHeight: 1.25, marginBottom: '16px', fontFamily: 'Georgia, serif' }}>
              Everything you need,<br /><strong style={{ fontWeight: '700' }}>delivered to you.</strong>
            </h1>
            <p style={{ color: '#B0BEC5', fontSize: '1rem', lineHeight: 1.6, marginBottom: '32px', maxWidth: '460px' }}>
              Millions of products across every category. Fast delivery, easy returns, and prices you'll love.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/products" style={{ background: '#FFD814', color: '#0F1111', borderRadius: '8px', padding: '13px 32px', fontWeight: '700', textDecoration: 'none', fontSize: '0.95rem', border: '1px solid #FCD200', boxShadow: '0 2px 5px rgba(213,149,0,0.5)' }}>
                Shop Now
              </Link>
              {!user && (
                <Link to="/register" style={{ background: 'transparent', color: '#fff', borderRadius: '8px', padding: '13px 32px', fontWeight: '600', textDecoration: 'none', fontSize: '0.95rem', border: '1px solid rgba(255,255,255,0.4)' }}>
                  Create Account
                </Link>
              )}
            </div>
          </div>
          <div style={{ flexShrink: 0, fontSize: '8rem', opacity: 0.15, display: 'flex', gap: '-10px' }}>
            🛍️
          </div>
        </div>
        {/* Gradient fade */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', background: 'linear-gradient(to bottom, transparent, #EAEDED)' }} />
      </div>

      {/* Category Cards */}
      <div style={{ maxWidth: '1500px', margin: '0 auto', padding: '24px 16px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {CATEGORIES.map(cat => (
            <Link key={cat.name} to={`/products`} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 5px rgba(15,17,17,0.08)', cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(15,17,17,0.2)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 5px rgba(15,17,17,0.08)'}>
                <div style={{ fontSize: '2.4rem', marginBottom: '8px' }}>{cat.icon}</div>
                <div style={{ fontWeight: '700', color: '#0F1111', fontSize: '0.95rem', marginBottom: '6px' }}>{cat.name}</div>
                <div style={{ color: '#007185', fontSize: '0.82rem', fontWeight: '500' }}>Shop now →</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Featured Products */}
        <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 5px rgba(15,17,17,0.08)', marginBottom: '24px' }}>
          <h2 style={{ color: '#0F1111', fontSize: '1.3rem', fontWeight: '700', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #E7E7E7' }}>
            Featured Products
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
            {featured.map(p => (
              <Link key={p.id} to={`/products/${p.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.firstChild && (e.currentTarget.firstChild.style.opacity = '0.85')}
                  onMouseLeave={e => e.currentTarget.firstChild && (e.currentTarget.firstChild.style.opacity = '1')}>
                  <div style={{ height: '160px', background: '#F7F8F8', borderRadius: '6px', overflow: 'hidden', marginBottom: '8px', transition: 'opacity 0.15s' }}>
                    {p.image_url
                      ? <img src={p.image_url} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>🛍️</div>}
                  </div>
                  <div style={{ color: '#0F1111', fontSize: '0.85rem', fontWeight: '500', lineHeight: 1.3, marginBottom: '4px' }}>{p.title}</div>
                  <div style={{ color: '#B12704', fontWeight: '700', fontSize: '1rem' }}>${p.price}</div>
                  {p.avg_rating > 0 && <div style={{ color: '#FF9900', fontSize: '0.78rem' }}>{'★'.repeat(Math.round(p.avg_rating))} ({p.review_count})</div>}
                </div>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link to="/products" style={{ color: '#007185', fontSize: '0.9rem', fontWeight: '600', textDecoration: 'none' }}>See all products →</Link>
          </div>
        </div>

        {/* Bottom strip */}
        <div style={{ background: '#fff', borderRadius: '8px', padding: '28px 24px', boxShadow: '0 2px 5px rgba(15,17,17,0.08)', marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '24px', textAlign: 'center' }}>
          {[
            { icon: '🚚', title: 'Free Delivery', desc: 'On orders over $35' },
            { icon: '↩️', title: 'Easy Returns', desc: '30-day return policy' },
            { icon: '🔒', title: 'Secure Payment', desc: '100% secure checkout' },
            { icon: '🎧', title: '24/7 Support', desc: 'Round the clock help' },
          ].map(f => (
            <div key={f.title}>
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{f.icon}</div>
              <div style={{ fontWeight: '700', color: '#0F1111', fontSize: '0.88rem' }}>{f.title}</div>
              <div style={{ color: '#565959', fontSize: '0.78rem', marginTop: '3px' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#232F3E', color: '#fff', textAlign: 'center', padding: '20px', fontSize: '0.82rem' }}>
        <div style={{ marginBottom: '8px', color: '#aaa' }}>
          <Link to="/products" style={{ color: '#aaa', textDecoration: 'none', margin: '0 12px' }}>Products</Link>
          <Link to="/register" style={{ color: '#aaa', textDecoration: 'none', margin: '0 12px' }}>Sign Up</Link>
          <Link to="/login" style={{ color: '#aaa', textDecoration: 'none', margin: '0 12px' }}>Sign In</Link>
        </div>
        <div style={{ color: '#666' }}>© 2026 ShopEase — Made by <span style={{ color: '#FF9900', fontWeight: '700' }}>Satyam</span></div>
      </div>
    </div>
  )
}
