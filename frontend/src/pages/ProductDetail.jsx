import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

function Stars({ value, size = '1rem' }) {
  const full = Math.round(value)
  return <span style={{ color: '#FF9900', fontSize: size }}>{'★'.repeat(full)}{'☆'.repeat(5 - full)}</span>
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [qty, setQty] = useState(1)
  const [toast, setToast] = useState('')
  const [review, setReview] = useState({ rating: 5, comment: '' })
  const [submitting, setSubmitting] = useState(false)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    api.get(`/products/${id}/`).then(r => setProduct(r.data)).catch(() => navigate('/products'))
    api.get(`/products/${id}/reviews/`).then(r => setReviews(r.data)).catch(() => {})
    window.scrollTo(0, 0)
  }, [id])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const handleAdd = async () => {
    if (!user) { navigate('/login'); return }
    setAdding(true)
    try { await addToCart(product.id, qty); showToast('Added to Cart') }
    catch { showToast('Could not add to cart') }
    finally { setAdding(false) }
  }

  const handleReview = async (e) => {
    e.preventDefault(); setSubmitting(true)
    try {
      const res = await api.post(`/products/${id}/reviews/`, review)
      setReviews([...reviews, res.data]); setReview({ rating: 5, comment: '' }); showToast('Review posted!')
    } catch { showToast('Could not submit review.') }
    finally { setSubmitting(false) }
  }

  if (!product) return (
    <div style={{ background: '#EAEDED', minHeight: 'calc(100vh-96px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px' }}>
      <div style={{ color: '#565959' }}>Loading product...</div>
    </div>
  )

  const avgRating = product.avg_rating || 0

  return (
    <div style={{ background: '#EAEDED', minHeight: 'calc(100vh - 96px)' }}>
      {/* Breadcrumb */}
      <div style={{ background: '#fff', padding: '8px 24px', borderBottom: '1px solid #E7E7E7', fontSize: '0.82rem', color: '#007185' }}>
        <Link to="/" style={{ color: '#007185', textDecoration: 'none' }}>Home</Link>
        <span style={{ color: '#565959', margin: '0 6px' }}>›</span>
        <Link to="/products" style={{ color: '#007185', textDecoration: 'none' }}>Products</Link>
        <span style={{ color: '#565959', margin: '0 6px' }}>›</span>
        <span style={{ color: '#565959' }}>{product.category_name}</span>
        <span style={{ color: '#565959', margin: '0 6px' }}>›</span>
        <span style={{ color: '#0F1111' }}>{product.title}</span>
      </div>

      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '20px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr 300px', gap: '24px', alignItems: 'start' }}>

        {/* Image Column */}
        <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 5px rgba(15,17,17,0.08)', border: '1px solid #E7E7E7' }}>
          <div style={{ height: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#F7F8F8', borderRadius: '4px' }}>
            {product.image_url
              ? <img src={product.image_url} alt={product.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              : <span style={{ fontSize: '5rem' }}>🛍️</span>}
          </div>
        </div>

        {/* Info Column */}
        <div>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 5px rgba(15,17,17,0.08)', border: '1px solid #E7E7E7' }}>
            <span style={{ fontSize: '0.75rem', color: '#007185', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
              {product.category_name}
            </span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '400', color: '#0F1111', margin: '8px 0', lineHeight: 1.3 }}>
              {product.title}
            </h1>
            {product.brand_name && (
              <div style={{ fontSize: '0.88rem', color: '#565959', marginBottom: '8px' }}>
                Brand: <Link to="/products" style={{ color: '#007185', textDecoration: 'none', fontWeight: '600' }}>{product.brand_name}</Link>
              </div>
            )}
            {reviews.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Stars value={avgRating} />
                <span style={{ color: '#007185', fontSize: '0.88rem', cursor: 'pointer' }}>{avgRating.toFixed(1)} · {reviews.length} rating{reviews.length !== 1 ? 's' : ''}</span>
              </div>
            )}

            <hr style={{ border: 'none', borderTop: '1px solid #E7E7E7', margin: '16px 0' }} />

            {/* Price */}
            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '0.9rem', color: '#565959' }}>Price: </span>
              <span style={{ fontSize: '0.82rem', color: '#0F1111', verticalAlign: 'super', fontSize: '0.9rem' }}>$</span>
              <span style={{ fontSize: '2.2rem', fontWeight: '300', color: '#0F1111' }}>{Math.floor(product.price)}</span>
              <span style={{ fontSize: '0.9rem', color: '#0F1111', verticalAlign: 'super' }}>{('.' + (product.price % 1).toFixed(2).split('.')[1])}</span>
            </div>

            {/* Description */}
            {product.description && (
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0F1111', marginBottom: '8px' }}>About this item</h3>
                <p style={{ color: '#565959', fontSize: '0.88rem', lineHeight: 1.7 }}>{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Buy Box */}
        <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 5px rgba(15,17,17,0.08)', border: '1px solid #E7E7E7', position: 'sticky', top: '16px' }}>
          <div style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', color: '#0F1111', verticalAlign: 'super' }}>$</span>
            <span style={{ fontSize: '1.8rem', fontWeight: '400', color: '#0F1111' }}>{Math.floor(product.price)}</span>
            <span style={{ fontSize: '0.82rem', color: '#0F1111', verticalAlign: 'super' }}>{('.' + (product.price % 1).toFixed(2).split('.')[1])}</span>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#007185', marginBottom: '4px' }}>
            FREE delivery <strong style={{ color: '#0F1111' }}>Tomorrow</strong>
          </div>

          <div style={{ fontSize: '1rem', fontWeight: '700', color: product.stock > 0 ? '#007600' : '#C40000', margin: '12px 0' }}>
            {product.stock > 0 ? 'In Stock' : 'Currently unavailable'}
          </div>

          {product.stock > 0 && (
            <>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0F1111', display: 'block', marginBottom: '6px' }}>Quantity:</label>
                <select value={qty} onChange={e => setQty(parseInt(e.target.value))}
                  style={{ padding: '6px 12px', border: '1px solid #D5D9D9', borderRadius: '6px', fontSize: '0.88rem', background: '#fff', cursor: 'pointer', outline: 'none', color: '#0F1111' }}>
                  {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => i + 1).map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <button onClick={handleAdd} disabled={adding}
                style={{ width: '100%', background: '#FFD814', border: '1px solid #FCD200', borderRadius: '20px', padding: '10px', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer', color: '#0F1111', marginBottom: '10px', boxShadow: '0 2px 5px rgba(213,149,0,0.4)' }}>
                {adding ? 'Adding...' : 'Add to Cart'}
              </button>
              <button onClick={handleAdd} disabled={adding}
                style={{ width: '100%', background: '#FFA41C', border: '1px solid #FF8F00', borderRadius: '20px', padding: '10px', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer', color: '#0F1111', marginBottom: '16px', boxShadow: '0 2px 5px rgba(213,149,0,0.3)' }}>
                Buy Now
              </button>
            </>
          )}

          <div style={{ fontSize: '0.78rem', color: '#565959', lineHeight: 1.5 }}>
            <div style={{ marginBottom: '4px' }}>✓ Returns accepted</div>
            <div>✓ Secure transaction</div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #E7E7E7', margin: '14px 0' }} />

          <div style={{ fontSize: '0.82rem', color: '#0F1111' }}>
            <div style={{ marginBottom: '6px' }}><span style={{ fontWeight: '700' }}>Ships from</span> <span style={{ color: '#007185' }}>ShopEase</span></div>
            <div><span style={{ fontWeight: '700' }}>Sold by</span> <span style={{ color: '#007185' }}>ShopEase Direct</span></div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 16px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Write Review */}
          {user && (
            <div style={{ background: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 5px rgba(15,17,17,0.08)', border: '1px solid #E7E7E7' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0F1111', marginBottom: '16px' }}>Write a customer review</h2>
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0F1111', marginBottom: '8px' }}>Overall rating</div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1, 2, 3, 4, 5].map(r => (
                    <button key={r} onClick={() => setReview(rv => ({ ...rv, rating: r }))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.6rem', color: review.rating >= r ? '#FF9900' : '#D5D9D9', padding: '0', lineHeight: 1 }}>
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <form onSubmit={handleReview}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#0F1111', marginBottom: '6px' }}>Add a headline</label>
                <textarea
                  rows={3}
                  value={review.comment}
                  onChange={e => setReview(rv => ({ ...rv, comment: e.target.value }))}
                  placeholder="What's most important to know?"
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #888', borderRadius: '4px', fontSize: '0.88rem', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '14px', outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = '#FF9900'}
                  onBlur={e => e.target.style.borderColor = '#888'}
                />
                <button type="submit" disabled={submitting}
                  style={{ background: '#FFD814', border: '1px solid #FCD200', borderRadius: '8px', padding: '8px 20px', fontWeight: '700', cursor: 'pointer', fontSize: '0.88rem', color: '#0F1111' }}>
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </form>
            </div>
          )}

          {/* Reviews List */}
          <div style={{ background: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 5px rgba(15,17,17,0.08)', border: '1px solid #E7E7E7' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0F1111', marginBottom: '16px' }}>
              Customer reviews {reviews.length > 0 && `(${reviews.length})`}
            </h2>
            {reviews.length === 0 ? (
              <div style={{ color: '#565959', fontSize: '0.88rem' }}>
                No reviews yet.{!user && <span> <Link to="/login" style={{ color: '#007185' }}>Sign in</Link> to write one.</span>}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {reviews.map((r, i) => (
                  <div key={i} style={{ borderBottom: i < reviews.length - 1 ? '1px solid #F0F0F0' : 'none', paddingBottom: i < reviews.length - 1 ? '16px' : '0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <div style={{ width: '32px', height: '32px', background: '#232F3E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF9900', fontWeight: '700', fontSize: '0.85rem' }}>
                        {r.username[0].toUpperCase()}
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0F1111' }}>{r.username}</span>
                    </div>
                    <Stars value={r.rating} size="0.9rem" />
                    {r.comment && <p style={{ color: '#0F1111', fontSize: '0.88rem', lineHeight: 1.5, marginTop: '6px' }}>{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
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
