'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import type { WishlistWithItems, WishlistItemWithProduct } from '@/types/wishlist'

// Types
interface WishlistState {
  wishlist: WishlistWithItems | null
  isLoading: boolean
  error: string | null
}

type WishlistAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_WISHLIST'; payload: WishlistWithItems }
  | { type: 'ADD_ITEM'; payload: WishlistItemWithProduct }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_WISHLIST' }

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'SET_WISHLIST':
      return { ...state, wishlist: action.payload, isLoading: false, error: null }
    case 'ADD_ITEM':
      if (!state.wishlist) return state
      return {
        ...state,
        wishlist: {
          ...state.wishlist,
          items: [...state.wishlist.items, action.payload],
          itemCount: state.wishlist.itemCount + 1,
        },
      }
    case 'REMOVE_ITEM':
      if (!state.wishlist) return state
      return {
        ...state,
        wishlist: {
          ...state.wishlist,
          items: state.wishlist.items.filter((item) => item.id !== action.payload),
          itemCount: Math.max(0, state.wishlist.itemCount - 1),
        },
      }
    case 'CLEAR_WISHLIST':
      if (!state.wishlist) return state
      return {
        ...state,
        wishlist: {
          ...state.wishlist,
          items: [],
          itemCount: 0,
        },
      }
    default:
      return state
  }
}

interface WishlistContextValue extends WishlistState {
  addToWishlist: (productId: string, variantId?: string) => Promise<void>
  removeFromWishlist: (itemId: string) => Promise<void>
  isInWishlist: (productId: string, variantId?: string) => boolean
  toggleWishlist: (productId: string, variantId?: string) => Promise<void>
  clearWishlist: () => Promise<void>
  refreshWishlist: () => Promise<void>
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined)

const GUEST_WISHLIST_KEY = 'guest_wishlist'

interface GuestWishlistItem {
  productId: string
  variantId?: string
  addedAt: string
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, {
    wishlist: null,
    isLoading: true,
    error: null,
  })
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  // Handle client-side mounting
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fetch wishlist on mount
  useEffect(() => {
    if (isClient) {
      fetchWishlist()
    }
  }, [isClient])

  const fetchWishlist = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      // Check for guest wishlist in localStorage
      const guestWishlist = isClient ? localStorage.getItem(GUEST_WISHLIST_KEY) : null

      const response = await fetch(`/api/wishlist${guestWishlist ? `?guestWishlist=${encodeURIComponent(guestWishlist)}` : ''}`)

      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated - use empty wishlist
          dispatch({
            type: 'SET_WISHLIST',
            payload: {
              id: 'guest',
              userId: 'guest',
              items: [],
              itemCount: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          })
          return
        }
        throw new Error('Failed to fetch wishlist')
      }

      const wishlist: WishlistWithItems = await response.json()
      dispatch({ type: 'SET_WISHLIST', payload: wishlist })
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to load wishlist',
      })
      // Initialize empty wishlist on error
      dispatch({
        type: 'SET_WISHLIST',
        payload: {
          id: 'guest',
          userId: 'guest',
          items: [],
          itemCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
    }
  }, [isClient])

  const addToWishlist = useCallback(async (productId: string, variantId?: string) => {
    try {
      const guestWishlist = isClient ? localStorage.getItem(GUEST_WISHLIST_KEY) : null

      const response = await fetch('/api/wishlist/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, variantId, guestWishlist }),
      })

      if (!response.ok) {
        throw new Error('Failed to add to wishlist')
      }

      const { wishlist: updatedWishlist, item } = await response.json()

      if (updatedWishlist.guestWishlistId && isClient) {
        localStorage.setItem(GUEST_WISHLIST_KEY, updatedWishlist.guestWishlistId)
      }

      dispatch({ type: 'SET_WISHLIST', payload: updatedWishlist })

      revalidatePath('/wishlist')
      revalidatePath('/')
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to add to wishlist',
      })
      throw error
    }
  }, [isClient])

  const removeFromWishlist = useCallback(async (itemId: string) => {
    // Optimistic update
    dispatch({ type: 'REMOVE_ITEM', payload: itemId })

    try {
      const guestWishlist = isClient ? localStorage.getItem(GUEST_WISHLIST_KEY) : null

      const response = await fetch(`/api/wishlist/items/${itemId}?guestWishlist=${guestWishlist || ''}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to remove from wishlist')
      }

      revalidatePath('/wishlist')
      revalidatePath('/')
    } catch (error) {
      // Rollback
      await fetchWishlist()
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to remove from wishlist',
      })
    }
  }, [fetchWishlist, isClient])

  const isInWishlist = useCallback(
    (productId: string, variantId?: string): boolean => {
      if (!state.wishlist) return false
      return state.wishlist.items.some(
        (item) =>
          item.productId === productId &&
          (variantId ? item.variantId === variantId : !item.variantId)
      )
    },
    [state.wishlist]
  )

  const toggleWishlist = useCallback(
    async (productId: string, variantId?: string) => {
      const item = state.wishlist?.items.find(
        (i) =>
          i.productId === productId &&
          (variantId ? i.variantId === variantId : !i.variantId)
      )

      if (item) {
        await removeFromWishlist(item.id)
      } else {
        await addToWishlist(productId, variantId)
      }
    },
    [state.wishlist, addToWishlist, removeFromWishlist]
  )

  const clearWishlist = useCallback(async () => {
    dispatch({ type: 'CLEAR_WISHLIST' })

    try {
      const guestWishlist = isClient ? localStorage.getItem(GUEST_WISHLIST_KEY) : null

      const response = await fetch(`/api/wishlist?guestWishlist=${guestWishlist || ''}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to clear wishlist')
      }

      if (isClient) {
        localStorage.removeItem(GUEST_WISHLIST_KEY)
      }

      revalidatePath('/wishlist')
      revalidatePath('/')
    } catch (error) {
      await fetchWishlist()
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to clear wishlist',
      })
    }
  }, [fetchWishlist, isClient])

  const refreshWishlist = useCallback(async () => {
    await fetchWishlist()
  }, [fetchWishlist])

  return (
    <WishlistContext.Provider
      value={{
        ...state,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
        clearWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}

export { WishlistContext }
