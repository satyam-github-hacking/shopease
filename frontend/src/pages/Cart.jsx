import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import api from '../api'

export default function Cart() {
  const { cart, updateItem, removeItem, clearCartState } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [address, setAddress] = useState('')
  const [placing, setPlacing] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  if (!user) return (
    <div style={{ background: '#EAEDED', minHeight: 'calc(100vh - 96px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <div style={{ background: '#fff', borderRadius: '8px', padding: '40px', textAlign: 'center', border: '1px solid #E7E7E7', maxWidth: '360px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🛒</div>
        <h2 style={{ color: '#0F1111', fontWeight: '400', marginBottom: '12px' }}>Your cart is empty</h2>
        <p style={{ color: '#565959', fontSize: '0.88rem', marginBottom: '20px' }}>Please sign in to view your cart</p>
        <Link to="/login" style={{ background: '#FFD814', border: '1px solid #FCD200', borderRadius: '8px', padding: '10px 24px', fontWeight: '700', textDecoration: 'none', color: '#0F1111', fontSize: '0.9rem' }}>Sign In</Link>
      </div>
    </div>
  )

  const placeOrder = async () => {
    setPlacing(true)
    try {
      await api.post('/orders/place/', { shipping_address: address })
      clearCartState(); setShowModal(false)
      showToast('Order placed successfully!')
      setTimeout(() => navigate('/orders'), 2000)
    } catch { showToast('Failed to place order.') }
    finally { setPlacing(false) }
  }

  return (
    <div style={{ background: '#EAEDED', minHeight: 'calc(100vh - 96px)', padding: '20px 16px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'start' }}>

        {/* Cart Items */}
        <div style={{ background: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 5px rgba(15,17,17,0.08)', border: '1px solid #E7E7E7' }}>
          <h1 style={{ fontSize: '1.7rem', fontWeight: '400', color: '#0F1111', marginBottom: '4px', fontFamily: 'Georgia, serif' }}>Shopping Cart</h1>

          {cart.items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🛒</div>
              <h3 style={{ color: '#0F1111', fontWeight: '400', marginBottom: '12px' }}>Your cart is empty</h3>
              <p style={{ color: '#565959', fontSize: '0.9rem', marginBottom: '20px' }}>
                Your shopping cart lives here. <Link to="/products" style={{ color: '#007185', textDecoration: 'none' }}>Start shopping</Link>
              </p>
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'right', color: '#565959', fontSize: '0.85rem', borderBottom: '1px solid #E7E7E7', paddingBottom: '8px', marginBottom: '8px' }}>
                Price
              </div>
              {cart.items.map((item, idx) => (
                <div key={item.id} style={{ display: 'flex', gap: '16px', padding: '16px 0', borderBottom: idx < cart.items.length - 1 ? '1px solid #E7E7E7' : 'none' }}>
                  {/* Image */}
                  <Link to={`/products/${item.product.id}`}>
                    <div style={{ width: '100px', height: '100px', background: '#F7F8F8', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                      {item.product.image_url
                        ? <img src={item.product.image_url} alt={item.product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>🛍️</div>}
                    </div>
                  </Link>
                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <Link to={`/products/${item.product.id}`} style={{ color: '#007185', textDecoration: 'none', fontWeight: '500', fontSize: '1rem', display: 'block', marginBottom: '4px' }}>
                      {item.product.title}
                    </Link>
                    <div style={{ color: '#007600', fontSize: '0.82rem', marginBottom: '10px' }}>In Stock</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #D5D9D9', borderRadius: '6px', overflow: 'hidden' }}>
                        <button onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
                          style={{ padding: '4px 12px', border: 'none', background: '#F7F8F8', cursor: 'pointer', fontSize: '1rem', color: '#0F1111', borderRight: '1px solid #D5D9D9' }}>−</button>
                        <span style={{ padding: '4px 14px', fontSize: '0.9rem', fontWeight: '700', color: '#0F1111' }}>{item.quantity}</span>
                        <button onClick={() => updateItem(item.id, item.quantity + 1)}
                          style={{ padding: '4px 12px', border: 'none', background: '#F7F8F8', cursor: 'pointer', fontSize: '1rem', color: '#0F1111', borderLeft: '1px solid #D5D9D9' }}>+</button>
                      </div>
                      <button onClick={() => removeItem(item.id)}
                        style={{ background: 'none', border: 'none', color: '#C7511F', cursor: 'pointer', fontSize: '0.85rem', padding: 0, textDecoration: 'underline' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                  {/* Price */}
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    <span style={{ fontSize: '0.78rem', verticalAlign: 'super', color: '#0F1111' }}>$</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0F1111' }}>{parseFloat(item.subtotal).toFixed(2).replace(/^\$/, '')}</span>
                  </div>
                </div>
              ))}
              <div style={{ textAlign: 'right', marginTop: '12px', fontSize: '1rem', color: '#0F1111' }}>
                Subtotal ({cart.items.reduce((s, i) => s + i.quantity, 0)} items): <strong>${parseFloat(cart.total).toFixed(2)}</strong>
              </div>
            </>
          )}
        </div>

        {/* Order Summary */}
        {cart.items.length > 0 && (
          <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 5px rgba(15,17,17,0.08)', border: '1px solid #E7E7E7', position: 'sticky', top: '16px' }}>
            <div style={{ marginBottom: '16px', fontSize: '0.9rem', color: '#007600' }}>
              ✓ Your order qualifies for FREE Delivery.
            </div>
            <div style={{ marginBottom: '16px', fontSize: '1rem', color: '#0F1111' }}>
              Subtotal ({cart.items.reduce((s, i) => s + i.quantity, 0)} items):{' '}
              <strong style={{ fontSize: '1.1rem' }}>${parseFloat(cart.total).toFixed(2)}</strong>
            </div>
            <button onClick={() => setShowModal(true)}
              style={{ width: '100%', background: '#FFD814', border: '1px solid #FCD200', borderRadius: '20px', padding: '10px', fontSize: '0.92rem', fontWeight: '700', cursor: 'pointer', color: '#0F1111', boxShadow: '0 2px 5px rgba(213,149,0,0.4)', marginBottom: '8px' }}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '24px' }}>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '32px', maxWidth: '440px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.25)', border: '1px solid #D5D9D9' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '400', color: '#0F1111', marginBottom: '4px', fontFamily: 'Georgia, serif' }}>Choose a delivery address</h2>
            <p style={{ color: '#565959', fontSize: '0.85rem', marginBottom: '16px' }}>Enter your shipping address to continue</p>
            <div style={{ background: '#F7F8F8', border: '1px solid #E7E7E7', borderRadius: '6px', padding: '12px 16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#0F1111' }}>
              <span>Order total</span><strong>${parseFloat(cart.total).toFixed(2)}</strong>
            </div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#0F1111', marginBottom: '6px' }}>Shipping Address</label>
            <textarea
              style={{ width: '100%', padding: '8px 10px', border: '1px solid #888', borderRadius: '4px', fontSize: '0.88rem', resize: 'vertical', minHeight: '80px', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '16px', outline: 'none' }}
              placeholder="123 Main St, City, State, ZIP, Country"
              value={address}
              onChange={e => setAddress(e.target.value)}
              onFocus={e => e.target.style.borderColor = '#FF9900'}
              onBlur={e => e.target.style.borderColor = '#888'}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={placeOrder} disabled={placing || !address.trim()}
                style={{ flex: 1, background: '#FFD814', border: '1px solid #FCD200', borderRadius: '8px', padding: '10px', fontWeight: '700', cursor: 'pointer', color: '#0F1111', fontSize: '0.9rem', opacity: !address.trim() ? 0.6 : 1 }}>
                {placing ? 'Placing...' : 'Place Order'}
              </button>
              <button onClick={() => setShowModal(false)}
                style={{ flex: 1, background: '#fff', border: '1px solid #D5D9D9', borderRadius: '8px', padding: '10px', fontWeight: '600', cursor: 'pointer', color: '#0F1111', fontSize: '0.9rem' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: '#232F3E', color: '#FF9900', padding: '14px 24px', borderRadius: '6px', fontWeight: '700', fontSize: '0.9rem', zIndex: 999, boxShadow: '0 4px 16px rgba(0,0,0,0.35)', border: '1px solid #FF9900' }}>
          {toast}
        </div>
      )}
    </div>
  )
}
