import React, { useEffect, useMemo, useState } from 'react'
import Hero from './Hero'
import NewArrivals from './NewArrivals'
import Categories from './Categories'
import BestSellers from './BestSellers'
import Footer from './Footer'
import { getAllCategories, getProducts } from '@/services/api'

const toDateValue = (value) => {
  const time = new Date(value || 0).getTime()
  return Number.isNaN(time) ? 0 : time
}

const Dashboard = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [productRes, categoryRes] = await Promise.all([
          getProducts(),
          getAllCategories(),
        ])

        setProducts(Array.isArray(productRes) ? productRes : [])

        const categoryData = Array.isArray(categoryRes?.data)
          ? categoryRes.data
          : Array.isArray(categoryRes)
          ? categoryRes
          : []

        setCategories(categoryData)
      } catch {
        setProducts([])
        setCategories([])
      }
    }

    loadHomeData()
  }, [])

  const newArrivals = useMemo(() => {
    return [...products]
      .sort((a, b) => {
        const featuredDiff = Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured))
        if (featuredDiff !== 0) return featuredDiff
        return toDateValue(b.createdAt) - toDateValue(a.createdAt)
      })
      .slice(0, 4)
  }, [products])

  const bestSellers = useMemo(() => {
    return [...products]
      .sort((a, b) => {
        const reviewDiff = Number(b.numReviews || 0) - Number(a.numReviews || 0)
        if (reviewDiff !== 0) return reviewDiff
        return Number(b.averageRating || 0) - Number(a.averageRating || 0)
      })
      .slice(0, 4)
  }, [products])

  return (
    <div className="w-full min-h-screen flex flex-col font-sans">
      <Hero />
      <NewArrivals products={newArrivals} />
      <Categories categories={categories} />
      <BestSellers products={bestSellers} />
      <Footer />
    </div>
  )
}

export default Dashboard
