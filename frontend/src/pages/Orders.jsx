import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'

const STATUS = {
  pending:   { label: 'Order placed', color: '#565959', dot: '#888' },
  confirmed: { label: 'Confirmed', color: '#007185', dot: '#007185' },
  shipped:   { label: 'Shipped', color: '#C7511F', dot: '#C7511F' },
  delivered: { label: 'Delivered', color: '#007600', dot: '#007600' },
  cancelled: { label: 'Cancelled', color: '#C40000', dot: '#C40000' },
}

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    api.get('/orders/').then(r => { setOrders(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [user])

  if (!user) return (
    <div style={{ background: '#EAEDED', minHeight: 'calc(100vh - 96px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <div style={{ background: '#fff', borderRadius: '8px', padding: '40px', textAlign: 'center', border: '1px solid #E7E7E7', maxWidth: '360px' }}>
        <h2 style={{ color: '#0F1111', fontWeight: '400', marginBottom: '12px' }}>Sign in to see your orders</h2>
        <Link to="/login" style={{ background: '#FFD814', border: '1px solid #FCD200', borderRadius: '8px', padding: '10px 24px', fontWeight: '700', textDecoration: 'none', color: '#0F1111' }}>Sign In</Link>
      </div>
    </div>
  )

  if (loading) return <div style={{ background: '#EAEDED', minHeight: 'calc(100vh - 96px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#565959' }}>Loading orders...</div>

  return (
    <div style={{ background: '#EAEDED', minHeight: 'calc(100vh - 96px)', padding: '20px 16px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ background: '#fff', borderRadius: '8px', padding: '20px 24px', boxShadow: '0 2px 5px rgba(15,17,17,0.08)', border: '1px solid #E7E7E7', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '400', color: '#0F1111', fontFamily: 'Georgia, serif', marginBottom: '4px' }}>Your Orders</h1>
            <p style={{ color: '#565959', fontSize: '0.85rem' }}>{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
          </div>
          <Link to="/products" style={{ color: '#007185', fontSize: '0.88rem', textDecoration: 'none' }}>← Continue Shopping</Link>
        </div>

        {orders.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '8px', padding: '60px', textAlign: 'center', border: '1px solid #E7E7E7', boxShadow: '0 2px 5px rgba(15,17,17,0.08)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📦</div>
            <h3 style={{ color: '#0F1111', fontWeight: '400', marginBottom: '8px' }}>No orders placed yet</h3>
            <p style={{ color: '#565959', marginBottom: '20px', fontSize: '0.9rem' }}>When you place orders, they'll appear here.</p>
            <Link to="/products" style={{ background: '#FFD814', border: '1px solid #FCD200', borderRadius: '8px', padding: '10px 28px', fontWeight: '700', textDecoration: 'none', color: '#0F1111', fontSize: '0.9rem' }}>Shop Now</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map(order => {
              const st = STATUS[order.status] || STATUS.pending
              return (
                <div key={order.id} style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(15,17,17,0.08)', border: '1px solid #E7E7E7', overflow: 'hidden' }}>
                  {/* Order Header */}
                  <div style={{ background: '#F7F8F8', borderBottom: '1px solid #E7E7E7', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#565959', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '2px' }}>Order Placed</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0F1111' }}>
                          {new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#565959', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '2px' }}>Total</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0F1111' }}>${parseFloat(order.total).toFixed(2)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#565959', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '2px' }}>Status</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: st.dot, flexShrink: 0 }} />
                          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: st.color }}>{st.label}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#565959' }}>
                      ORDER # <span style={{ color: '#007185' }}>{order.id}</span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div style={{ padding: '16px 20px' }}>
                    {order.items.map((item, idx) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: idx < order.items.length - 1 ? '1px solid #F0F0F0' : 'none' }}>
                        <div style={{ fontSize: '0.88rem', color: '#0F1111' }}>
                          <span style={{ color: '#565959', marginRight: '8px' }}>×{item.quantity}</span>
                          {item.product_title}
                        </div>
                        <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0F1111' }}>
                          ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                    {order.shipping_address && (
                      <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#565959' }}>
                        📍 <span style={{ color: '#0F1111' }}>{order.shipping_address}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
