'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Category, GenerationQueue } from '@/types'

export default function AdminDashboard() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [generationStatus, setGenerationStatus] = useState<GenerationQueue | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchCategories()
  }, [])

  const checkAuth = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        router.push('/admin/login')
      }
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories')
      setCategories(response.data.categories)
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    router.push('/admin/login')
  }

  const handleGeneratePost = async () => {
    if (!selectedCategory) {
      setError('Please select a category')
      return
    }

    setError('')
    setLoading(true)
    setGenerationStatus(null)

    try {
      const response = await api.post('/posts/generate', {
        category_id: selectedCategory,
      })

      const { queueId, topic } = response.data

      // Poll for generation status
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await api.get(`/posts/queue/${queueId}`)
          const queue = statusResponse.data.queue

          setGenerationStatus(queue)

          if (queue.status === 'completed') {
            clearInterval(pollInterval)
            setLoading(false)
            setTimeout(() => {
              if (queue.post_slug) {
                window.open(`/blog/${queue.post_slug}`, '_blank')
              }
            }, 2000)
          } else if (queue.status === 'failed') {
            clearInterval(pollInterval)
            setLoading(false)
            setError(queue.error_message || 'Generation failed')
          }
        } catch (err) {
          console.error('Error polling status:', err)
        }
      }, 3000)

      // Stop polling after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval)
        setLoading(false)
      }, 300000)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to start generation')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Generate AI-powered blog posts with one click</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Magic Button Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">✨ Magic Content Generator</h2>
          
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {generationStatus && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="font-semibold text-blue-900">
                Status: <span className="capitalize">{generationStatus.status}</span>
              </p>
              {generationStatus.post_title && (
                <p className="text-blue-800 mt-2">
                  Generated: {generationStatus.post_title}
                </p>
              )}
              {generationStatus.status === 'completed' && (
                <p className="text-green-700 mt-2">
                  ✓ Post generated successfully! Opening in new tab...
                </p>
              )}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Select Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                disabled={loading}
              >
                <option value="">Choose a category...</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.post_count} posts)
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGeneratePost}
              disabled={loading || !selectedCategory}
              className="w-full py-4 px-6 bg-gradient-to-r from-primary-600 to-primary-800 text-white text-lg font-semibold rounded-lg hover:from-primary-700 hover:to-primary-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating Magic Content...
                </span>
              ) : (
                '🪄 Generate Blog Post with AI'
              )}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {categories.slice(0, 3).map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
              <p className="text-3xl font-bold text-primary-600">{category.post_count}</p>
              <p className="text-gray-600 text-sm mt-1">Published posts</p>
            </div>
          ))}
        </div>

        {/* Categories List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Available Categories</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {categories.map((category) => (
              <div key={category.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-600">{category.post_count}</p>
                    <p className="text-xs text-gray-500">posts</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
