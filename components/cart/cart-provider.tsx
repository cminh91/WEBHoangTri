"use client"

import { createContext, useContext, useEffect, useState } from "react"

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | null>(null)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  
  // Load cart from localStorage on initial render
  useEffect(() => {
    const storedCart = localStorage.getItem("cart")
    if (storedCart) {
      try {
        setItems(JSON.parse(storedCart))
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error)
        localStorage.removeItem("cart")
      }
    }
  }, [])
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items))
  }, [items])
  
  const addItem = (newItem: Omit<CartItem, "quantity">) => {
    setItems((prevItems) => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex((item) => item.id === newItem.id)
      
      if (existingItemIndex > -1) {
        // Item exists, increment quantity
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex].quantity += 1
        return updatedItems
      } else {
        // Item doesn't exist, add new item with quantity 1
        return [...prevItems, { ...newItem, quantity: 1 }]
      }
    })
  }
  
  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }
  
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(id)
      return
    }
    
    setItems((prevItems) => 
      prevItems.map((item) => 
        item.id === id ? { ...item, quantity } : item
      )
    )
  }
  
  const clearCart = () => {
    setItems([])
  }
  
  const totalItems = items.reduce((total, item) => total + item.quantity, 0)
  
  const totalPrice = items.reduce(
    (total, item) => total + item.price * item.quantity, 
    0
  )
  
  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  }
  
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
} 