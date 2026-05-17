import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'products', label: 'Products' },
  { key: 'orders', label: 'Orders' },
  { key: 'categories', label: 'Categories' },
  { key: 'brands', label: 'Brands' },
]
const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
const STATUS_COLOR = { pending: '#888', confirmed: '#007185', shipped: '#C7511F', delivered: '#007600', cancelled: '#C40000' }
const EMPTY = { title: '', description: '', price: '', stock: '', category: '', brand: '', image_url: '' }

export default function SellerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [newCat, setNewCat] = useState('')
  const [newBrand, setNewBrand] = useState('')

  const msg = (t) => { setToast(t); setTimeout(() => setToast(''), 3500) }

  useEffect(() => {
    if (!user || (user.role !== 'seller' && user.role !== 'admin')) navigate('/login')
  }, [user])

  useEffect(() => {
    if (tab === 'overview') load('/seller/stats/', setStats)
    if (tab === 'products') { load('/seller/products/', setProducts); load('/seller/categories/', setCategories); load('/seller/brands/', setBrands) }
    if (tab === 'orders') load('/seller/orders/', setOrders)
    if (tab === 'categories') load('/seller/categories/', setCategories)
    if (tab === 'brands') load('/seller/brands/', setBrands)
  }, [tab])

  const load = async (url, setter) => {
    setLoading(true)
    try { const r = await api.get(url); setter(r.data) } catch {}
    finally { setLoading(false) }
  }

  const openAdd = () => { setEditItem(null); setForm(EMPTY); setShowForm(true) }
  const openEdit = (p) => { setEditItem(p); setForm({ title: p.title, description: p.description, price: p.price, stock: p.stock, category: p.category || '', brand: p.brand || '', image_url: p.image_url || '' }); setShowForm(true) }
  const saveProduct = async () => {
    setSaving(true)
    try {
      if (editItem) { await api.put(`/seller/products/${editItem.id}/`, form); msg('Product updated') }
      else { await api.post('/seller/products/', form); msg('Product added') }
      setShowForm(false); load('/seller/products/', setProducts)
    } catch (e) { msg('Error: ' + (Object.values(e.response?.data || {}).flat().join(' ') || 'Failed')) }
    finally { setSaving(false) }
  }
  const delProduct = async (id) => {
    if (!confirm('Delete this product?')) return
    try { await api.delete(`/seller/products/${id}/`); msg('Deleted'); load('/seller/products/', setProducts) } catch { msg('Failed') }
  }
  const updateStatus = async (id, status) => {
    try { await api.put(`/seller/orders/${id}/`, { status }); setOrders(o => o.map(x => x.id === id ? { ...x, status } : x)); msg('Status updated') } catch { msg('Failed') }
  }
  const addCat = async () => {
    if (!newCat.trim()) return
    try { await api.post('/seller/categories/', { name: newCat, slug: newCat.toLowerCase().replace(/[^a-z0-9]+/g, '-') }); setNewCat(''); load('/seller/categories/', setCategories); msg('Category added') } catch { msg('Failed') }
  }
  const addBrand = async () => {
    if (!newBrand.trim()) return
    try { await api.post('/seller/brands/', { name: newBrand }); setNewBrand(''); load('/seller/brands/', setBrands); msg('Brand added') } catch { msg('Failed') }
  }

  const th = { padding: '10px 14px', background: '#F7F8F8', textAlign: 'left', fontSize: '0.78rem', fontWeight: '700', color: '#565959', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #E7E7E7' }
  const td = { padding: '12px 14px', fontSize: '0.88rem', color: '#0F1111', borderBottom: '1px solid #F0F0F0', verticalAlign: 'middle' }

  return (
    <div style={{ background: '#EAEDED', minHeight: 'calc(100vh - 96px)', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: '220px', background: '#232F3E', flexShrink: 0, padding: '0 0 24px' }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #37475A' }}>
          <div style={{ color: '#FF9900', fontWeight: '700', fontSize: '0.85rem' }}>Seller Central</div>
          <div style={{ color: '#aaa', fontSize: '0.75rem', marginTop: '2px' }}>👤 {user?.username}</div>
        </div>
        <nav style={{ padding: '8px 0' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ display: 'block', width: '100%', padding: '11px 20px', background: tab === t.key ? '#37475A' : 'transparent', border: 'none', borderLeft: tab === t.key ? '3px solid #FF9900' : '3px solid transparent', color: tab === t.key ? '#FF9900' : 'rgba(255,255,255,0.7)', textAlign: 'left', cursor: 'pointer', fontSize: '0.88rem', fontWeight: tab === t.key ? '700' : '400', transition: 'all 0.15s' }}>
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: '28px 28px', overflow: 'auto' }}>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#0F1111', marginBottom: '20px' }}>Dashboard Overview</h1>
            {stats ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
                  {[
                    { label: 'Products', value: stats.products, icon: '📦' },
                    { label: 'Orders', value: stats.orders, icon: '🛒' },
                    { label: 'Revenue', value: `$${parseFloat(stats.revenue).toFixed(2)}`, icon: '💰' },
                    { label: 'Customers', value: stats.customers, icon: '👥' },
                  ].map(s => (
                    <div key={s.label} style={{ background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 5px rgba(15,17,17,0.08)', border: '1px solid #E7E7E7' }}>
                      <div style={{ fontSize: '1.6rem', marginBottom: '8px' }}>{s.icon}</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#0F1111', marginBottom: '4px' }}>{s.value}</div>
                      <div style={{ color: '#565959', fontSize: '0.8rem' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(15,17,17,0.08)', border: '1px solid #E7E7E7', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #E7E7E7', fontWeight: '700', color: '#0F1111', fontSize: '0.95rem' }}>Recent Orders</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr>{['Order', 'Customer', 'Total', 'Status', 'Date'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {stats.recent_orders.map(o => (
                        <tr key={o.id}>
                          <td style={td}><span style={{ color: '#007185' }}>#{o.id}</span></td>
                          <td style={td}>{o.username}</td>
                          <td style={{ ...td, fontWeight: '700' }}>${parseFloat(o.total).toFixed(2)}</td>
                          <td style={td}><span style={{ color: STATUS_COLOR[o.status], fontWeight: '600', fontSize: '0.82rem' }}>● {o.status}</span></td>
                          <td style={{ ...td, color: '#565959' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : <div style={{ color: '#565959' }}>Loading...</div>}
          </>
        )}

        {/* PRODUCTS */}
        {tab === 'products' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#0F1111' }}>Products <span style={{ color: '#565959', fontSize: '0.9rem', fontWeight: '400' }}>({products.length})</span></h1>
              <button onClick={openAdd} style={{ background: '#FFD814', border: '1px solid #FCD200', borderRadius: '8px', padding: '9px 20px', fontWeight: '700', cursor: 'pointer', color: '#0F1111', fontSize: '0.88rem', boxShadow: '0 2px 5px rgba(213,149,0,0.4)' }}>+ Add Product</button>
            </div>
            <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(15,17,17,0.08)', border: '1px solid #E7E7E7', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>{['', 'Product', 'Price', 'Stock', 'Category', 'Rating', 'Actions'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td style={{ ...td, width: '52px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '4px', overflow: 'hidden', background: '#F7F8F8' }}>
                          {p.image_url ? <img src={p.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🛍️</div>}
                        </div>
                      </td>
                      <td style={td}>
                        <div style={{ fontWeight: '600', color: '#0F1111', fontSize: '0.88rem' }}>{p.title}</div>
                        <div style={{ color: '#565959', fontSize: '0.75rem', marginTop: '2px' }}>{p.brand_name}</div>
                      </td>
                      <td style={{ ...td, fontWeight: '700', color: '#0F1111' }}>${parseFloat(p.price).toFixed(2)}</td>
                      <td style={td}>
                        <span style={{ background: p.stock > 0 ? '#E8F5E9' : '#FFEBEE', color: p.stock > 0 ? '#007600' : '#C40000', padding: '2px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>{p.stock}</span>
                      </td>
                      <td style={{ ...td, color: '#565959' }}>{p.category_name || '—'}</td>
                      <td style={td}>{p.avg_rating > 0 ? <span style={{ color: '#FF9900' }}>{'★'.repeat(Math.round(p.avg_rating))} <span style={{ color: '#565959', fontSize: '0.78rem' }}>({p.review_count})</span></span> : <span style={{ color: '#ccc' }}>—</span>}</td>
                      <td style={td}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => openEdit(p)} style={{ background: '#fff', border: '1px solid #D5D9D9', borderRadius: '4px', padding: '5px 12px', cursor: 'pointer', fontSize: '0.8rem', color: '#0F1111', fontWeight: '600' }}>Edit</button>
                          <button onClick={() => delProduct(p.id)} style={{ background: '#fff', border: '1px solid #C40000', borderRadius: '4px', padding: '5px 12px', cursor: 'pointer', fontSize: '0.8rem', color: '#C40000', fontWeight: '600' }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ORDERS */}
        {tab === 'orders' && (
          <>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#0F1111', marginBottom: '20px' }}>All Orders <span style={{ color: '#565959', fontSize: '0.9rem', fontWeight: '400' }}>({orders.length})</span></h1>
            <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(15,17,17,0.08)', border: '1px solid #E7E7E7', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>{['Order', 'Customer', 'Items', 'Total', 'Status', 'Date'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td style={td}><span style={{ color: '#007185', fontWeight: '700' }}>#{o.id}</span></td>
                      <td style={td}>{o.username}</td>
                      <td style={{ ...td, color: '#565959' }}>{o.items.length}</td>
                      <td style={{ ...td, fontWeight: '700' }}>${parseFloat(o.total).toFixed(2)}</td>
                      <td style={td}>
                        <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
                          style={{ border: '1px solid #D5D9D9', borderRadius: '4px', padding: '5px 8px', fontSize: '0.82rem', cursor: 'pointer', color: STATUS_COLOR[o.status], fontWeight: '600', background: '#fff', outline: 'none' }}>
                          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                      </td>
                      <td style={{ ...td, color: '#565959', fontSize: '0.82rem' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* CATEGORIES */}
        {tab === 'categories' && (
          <>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#0F1111', marginBottom: '20px' }}>Categories</h1>
            <div style={{ background: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 5px rgba(15,17,17,0.08)', border: '1px solid #E7E7E7' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                <input value={newCat} onChange={e => setNewCat(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCat()}
                  placeholder="New category name"
                  style={{ flex: 1, padding: '8px 12px', border: '1px solid #D5D9D9', borderRadius: '4px', fontSize: '0.9rem', outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = '#FF9900'} onBlur={e => e.target.style.borderColor = '#D5D9D9'}
                />
                <button onClick={addCat} style={{ background: '#FFD814', border: '1px solid #FCD200', borderRadius: '8px', padding: '8px 20px', fontWeight: '700', cursor: 'pointer', color: '#0F1111', fontSize: '0.88rem' }}>Add</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><th style={th}>#</th><th style={th}>Name</th><th style={th}>Slug</th></tr></thead>
                <tbody>
                  {categories.map((c, i) => (
                    <tr key={c.id}>
                      <td style={{ ...td, color: '#565959', width: '48px' }}>{i + 1}</td>
                      <td style={{ ...td, fontWeight: '600' }}>{c.name}</td>
                      <td style={{ ...td, color: '#565959', fontFamily: 'monospace', fontSize: '0.82rem' }}>{c.slug}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* BRANDS */}
        {tab === 'brands' && (
          <>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#0F1111', marginBottom: '20px' }}>Brands</h1>
            <div style={{ background: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 5px rgba(15,17,17,0.08)', border: '1px solid #E7E7E7' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                <input value={newBrand} onChange={e => setNewBrand(e.target.value)} onKeyDown={e => e.key === 'Enter' && addBrand()}
                  placeholder="New brand name"
                  style={{ flex: 1, padding: '8px 12px', border: '1px solid #D5D9D9', borderRadius: '4px', fontSize: '0.9rem', outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = '#FF9900'} onBlur={e => e.target.style.borderColor = '#D5D9D9'}
                />
                <button onClick={addBrand} style={{ background: '#FFD814', border: '1px solid #FCD200', borderRadius: '8px', padding: '8px 20px', fontWeight: '700', cursor: 'pointer', color: '#0F1111', fontSize: '0.88rem' }}>Add</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
                {brands.map(b => (
                  <div key={b.id} style={{ background: '#F7F8F8', border: '1px solid #E7E7E7', borderRadius: '6px', padding: '12px 16px', fontSize: '0.88rem', fontWeight: '600', color: '#0F1111' }}>
                    {b.name}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400, padding: '24px' }}>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '32px', maxWidth: '540px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.25)', border: '1px solid #D5D9D9', maxHeight: '90vh', overflow: 'auto' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0F1111', marginBottom: '24px' }}>{editItem ? 'Edit Product' : 'Add New Product'}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {[{ label: 'Product Title *', key: 'title', type: 'text', span: 2 }, { label: 'Price ($) *', key: 'price', type: 'number' }, { label: 'Stock *', key: 'stock', type: 'number' }].map(({ label, key, type, span }) => (
                <div key={key} style={{ gridColumn: span === 2 ? '1/-1' : undefined }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#0F1111', marginBottom: '5px' }}>{label}</label>
                  <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #D5D9D9', borderRadius: '4px', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = '#FF9900'} onBlur={e => e.target.style.borderColor = '#D5D9D9'} />
                </div>
              ))}
              {[{ label: 'Category', key: 'category', opts: categories }, { label: 'Brand', key: 'brand', opts: brands }].map(({ label, key, opts }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#0F1111', marginBottom: '5px' }}>{label}</label>
                  <select value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #D5D9D9', borderRadius: '4px', fontSize: '0.9rem', background: '#fff', outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = '#FF9900'} onBlur={e => e.target.style.borderColor = '#D5D9D9'}>
                    <option value="">— Select —</option>
                    {opts.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </div>
              ))}
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#0F1111', marginBottom: '5px' }}>Image URL</label>
                <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..."
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #D5D9D9', borderRadius: '4px', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = '#FF9900'} onBlur={e => e.target.style.borderColor = '#D5D9D9'} />
              </div>
              {form.image_url && (
                <div style={{ gridColumn: '1/-1', height: '100px', borderRadius: '4px', overflow: 'hidden', background: '#F7F8F8', border: '1px solid #E7E7E7' }}>
                  <img src={form.image_url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                </div>
              )}
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#0F1111', marginBottom: '5px' }}>Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Product description..."
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #D5D9D9', borderRadius: '4px', fontSize: '0.88rem', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = '#FF9900'} onBlur={e => e.target.style.borderColor = '#D5D9D9'} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={saveProduct} disabled={saving || !form.title || !form.price}
                style={{ flex: 1, background: '#FFD814', border: '1px solid #FCD200', borderRadius: '8px', padding: '10px', fontWeight: '700', cursor: 'pointer', color: '#0F1111', opacity: (!form.title || !form.price) ? 0.5 : 1 }}>
                {saving ? 'Saving...' : editItem ? 'Update Product' : 'Add Product'}
              </button>
              <button onClick={() => setShowForm(false)}
                style={{ flex: 1, background: '#fff', border: '1px solid #D5D9D9', borderRadius: '8px', padding: '10px', fontWeight: '600', cursor: 'pointer', color: '#0F1111' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: '#232F3E', color: '#FF9900', padding: '12px 22px', borderRadius: '6px', fontWeight: '700', fontSize: '0.88rem', zIndex: 999, boxShadow: '0 4px 16px rgba(0,0,0,0.3)', border: '1px solid rgba(255,153,0,0.4)' }}>
          {toast}
        </div>
      )}
    </div>
  )
}
