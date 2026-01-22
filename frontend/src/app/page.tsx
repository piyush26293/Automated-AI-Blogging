import Link from 'next/link'
import { Post, Category } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

async function getPosts(): Promise<Post[]> {
  try {
    const res = await fetch(`${API_URL}/api/posts?status=published&limit=12`, {
      next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
    })

    if (!res.ok) {
      throw new Error('Failed to fetch posts')
    }

    const data = await res.json()
    return data.posts || []
  } catch (error) {
    console.error('Error fetching posts:', error)
    return []
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/api/categories`, {
      next: { revalidate: 300 }, // ISR: revalidate every 5 minutes
    })

    if (!res.ok) {
      throw new Error('Failed to fetch categories')
    }

    const data = await res.json()
    return data.categories || []
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export default async function Home() {
  const [posts, categories] = await Promise.all([getPosts(), getCategories()])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to AI Blog Platform
          </h1>
          <p className="text-xl md:text-2xl text-primary-100">
            Discover unique AI-generated content across various topics
          </p>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold mb-6">Categories</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/?category=${category.slug}`}
                className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full hover:bg-primary-200 transition-colors"
              >
                {category.name} ({category.post_count})
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Blog Posts Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold mb-8">Latest Posts</h2>
        
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No posts available yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block"
              >
                <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  {post.featured_image_url && (
                    <div className="aspect-video bg-gray-200 overflow-hidden">
                      <img
                        src={post.featured_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    {post.category_name && (
                      <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full mb-3">
                        {post.category_name}
                      </span>
                    )}
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{post.reading_time_minutes} min read</span>
                      <span>{new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
