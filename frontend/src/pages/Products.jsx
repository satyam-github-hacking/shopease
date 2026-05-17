import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

function Stars({ value, count }) {
  const full = Math.round(value)
  return (
    <span style={{ color: '#FF9900', fontSize: '0.82rem' }}>
      {'★'.repeat(full)}{'☆'.repeat(5 - full)} <span style={{ color: '#007185', fontSize: '0.78rem' }}>({count})</span>
    </span>
  )
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [adding, setAdding] = useState(null)
  const [sortBy, setSortBy] = useState('default')
  const [searchParams, setSearchParams] = useSearchParams()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''

  useEffect(() => {
    api.get('/categories/').then(r => setCategories(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (search) params.search = search
    if (category) params.category = category
    api.get('/products/', { params }).then(r => { setProducts(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [search, category])

  const handleSearch = (e) => {
    e.preventDefault()
    const val = e.target.querySelector('input').value
    setSearchParams(val ? { search: val } : {})
  }

  const sorted = [...products].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price
    if (sortBy === 'price_desc') return b.price - a.price
    if (sortBy === 'rating') return b.avg_rating - a.avg_rating
    return 0
  })

  const handleAdd = async (product) => {
    if (!user) { window.location.href = '/login'; return }
    setAdding(product.id)
    try {
      await addToCart(product.id)
      setToast(`Added to cart`)
      setTimeout(() => setToast(''), 2500)
    } catch { setToast('Failed'); setTimeout(() => setToast(''), 2000) }
    finally { setAdding(null) }
  }

  return (
    <div style={{ background: '#EAEDED', minHeight: 'calc(100vh - 96px)' }}>
      {/* Search Bar + Filter Row */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E7E7E7', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', flex: 1, maxWidth: '600px', height: '38px' }}>
          <input
            defaultValue={search}
            placeholder="Search products..."
            style={{ flex: 1, padding: '0 14px', border: '2px solid #FF9900', borderRadius: '4px 0 0 4px', fontSize: '0.92rem', outline: 'none', color: '#0F1111' }}
          />
          <button style={{ background: '#FF9900', border: 'none', borderRadius: '0 4px 4px 0', padding: '0 16px', cursor: 'pointer', fontWeight: '700', color: '#131921', fontSize: '0.95rem' }}>
            Search
          </button>
        </form>

        <select value={category} onChange={e => setSearchParams(e.target.value ? { category: e.target.value } : {})}
          style={{ padding: '8px 12px', border: '1px solid #D5D9D9', borderRadius: '6px', fontSize: '0.88rem', color: '#0F1111', outline: 'none', cursor: 'pointer', background: '#fff' }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #D5D9D9', borderRadius: '6px', fontSize: '0.88rem', color: '#0F1111', outline: 'none', cursor: 'pointer', background: '#fff' }}>
          <option value="default">Sort: Featured</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Avg. Customer Rating</option>
        </select>
      </div>

      <div style={{ maxWidth: '1500px', margin: '0 auto', padding: '20px 16px' }}>
        {/* Results count */}
        {!loading && (
          <div style={{ marginBottom: '12px', fontSize: '0.9rem', color: '#565959' }}>
            {search && <span>Results for "<strong style={{ color: '#C40000' }}>{search}</strong>" — </span>}
            <span style={{ color: '#0F1111', fontWeight: '400' }}>{sorted.length} results</span>
          </div>
        )}

        {loading && (
          <div style={{ background: '#fff', borderRadius: '8px', padding: '60px', textAlign: 'center', color: '#565959', boxShadow: '0 2px 5px rgba(15,17,17,0.08)' }}>
            Loading products...
          </div>
        )}

        {!loading && sorted.length === 0 && (
          <div style={{ background: '#fff', borderRadius: '8px', padding: '60px', textAlign: 'center', boxShadow: '0 2px 5px rgba(15,17,17,0.08)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔍</div>
            <h3 style={{ color: '#0F1111', marginBottom: '8px' }}>No results for "{search}"</h3>
            <p style={{ color: '#565959', fontSize: '0.9rem' }}>Try different keywords or <button onClick={() => setSearchParams({})} style={{ background: 'none', border: 'none', color: '#007185', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }}>clear filters</button></p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
          {sorted.map(p => (
            <div key={p.id} style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(15,17,17,0.08)', border: '1px solid transparent', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.15s, border-color 0.15s', overflow: 'hidden' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(15,17,17,0.15)'; e.currentTarget.style.borderColor = '#FF9900' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 5px rgba(15,17,17,0.08)'; e.currentTarget.style.borderColor = 'transparent' }}>

              <Link to={`/products/${p.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ height: '200px', background: '#F7F8F8', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {p.image_url
                    ? <img src={p.image_url} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: '3rem' }}>🛍️</span>}
                </div>
              </Link>

              <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '0.72rem', color: '#565959', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{p.category_name}</div>
                <Link to={`/products/${p.id}`} style={{ color: '#007185', textDecoration: 'none', fontSize: '0.9rem', lineHeight: 1.35, marginBottom: '6px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontWeight: '500' }}>
                  {p.title}
                </Link>
                {p.review_count > 0 && <div style={{ marginBottom: '6px' }}><Stars value={p.avg_rating} count={p.review_count} /></div>}
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#565959', verticalAlign: 'top', lineHeight: '2' }}>$</span>
                    <span style={{ fontSize: '1.6rem', fontWeight: '400', color: '#0F1111' }}>{Math.floor(p.price)}</span>
                    <span style={{ fontSize: '0.78rem', color: '#0F1111', verticalAlign: 'top', lineHeight: '2' }}>{('.' + (p.price % 1).toFixed(2).split('.')[1])}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: p.stock > 0 ? '#007600' : '#C40000', marginBottom: '10px', fontWeight: '500' }}>
                    {p.stock > 0 ? 'In Stock' : 'Currently unavailable'}
                  </div>
                  <button
                    onClick={() => handleAdd(p)}
                    disabled={p.stock === 0 || adding === p.id}
                    style={{ width: '100%', background: p.stock > 0 ? '#FFD814' : '#E7E7E7', border: p.stock > 0 ? '1px solid #FCD200' : '1px solid #D5D9D9', borderRadius: '20px', padding: '8px', fontSize: '0.85rem', fontWeight: '700', cursor: p.stock > 0 ? 'pointer' : 'not-allowed', color: p.stock > 0 ? '#0F1111' : '#888', boxShadow: p.stock > 0 ? '0 2px 5px rgba(213,149,0,0.4)' : 'none' }}
                  >
                    {adding === p.id ? 'Adding...' : p.stock > 0 ? 'Add to Cart' : 'Unavailable'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: '#232F3E', color: '#FF9900', padding: '14px 24px', borderRadius: '6px', fontWeight: '700', fontSize: '0.9rem', zIndex: 999, boxShadow: '0 4px 16px rgba(0,0,0,0.35)', border: '1px solid #FF9900' }}>
          🛒 {toast}
        </div>
      )}
    </div>
  )
}
