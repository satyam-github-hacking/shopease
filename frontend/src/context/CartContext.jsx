import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../api'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cart, setCart] = useState({ items: [], total: '0.00' })

  const fetchCart = async () => {
    if (!user) { setCart({ items: [], total: '0.00' }); return }
    try {
      const res = await api.get('/cart/')
      setCart(res.data)
    } catch { setCart({ items: [], total: '0.00' }) }
  }

  useEffect(() => { fetchCart() }, [user])

  const addToCart = async (product_id, quantity = 1) => {
    const res = await api.post('/cart/add/', { product_id, quantity })
    setCart(res.data)
    return res.data
  }

  const updateItem = async (item_id, quantity) => {
    const res = await api.put(`/cart/items/${item_id}/`, { quantity })
    setCart(res.data)
  }

  const removeItem = async (item_id) => {
    const res = await api.delete(`/cart/items/${item_id}/`)
    setCart(res.data)
  }

  const clearCartState = () => setCart({ items: [], total: '0.00' })

  return (
    <CartContext.Provider value={{ cart, fetchCart, addToCart, updateItem, removeItem, clearCartState }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
