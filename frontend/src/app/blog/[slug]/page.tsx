import { Metadata } from 'next'
import Link from 'next/link'
import { Post } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

async function getPost(slug: string): Promise<Post | null> {
  try {
    const res = await fetch(`${API_URL}/api/posts/${slug}`, {
      next: { revalidate: 60 }, // ISR
    })

    if (!res.ok) {
      return null
    }

    const data = await res.json()
    return data.post
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

async function getRelatedPosts(slug: string): Promise<Post[]> {
  try {
    const res = await fetch(`${API_URL}/api/posts/${slug}/related`, {
      next: { revalidate: 300 },
    })

    if (!res.ok) {
      return []
    }

    const data = await res.json()
    return data.relatedPosts || []
  } catch (error) {
    console.error('Error fetching related posts:', error)
    return []
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    keywords: post.meta_keywords,
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt,
      type: 'article',
      publishedTime: post.published_at,
      authors: [post.author_name || 'AI Blog Platform'],
      images: post.featured_image_url ? [post.featured_image_url] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt,
      images: post.featured_image_url ? [post.featured_image_url] : [],
    },
  }
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const [post, relatedPosts] = await Promise.all([
    getPost(params.slug),
    getRelatedPosts(params.slug),
  ])

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
        <p className="text-gray-600 mb-8">
          The post you're looking for doesn't exist or has been removed.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Image */}
      {post.featured_image_url && (
        <div className="w-full h-96 bg-gray-200">
          <img
            src={post.featured_image_url}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Badge */}
        {post.category_name && (
          <Link
            href={`/?category=${post.category_slug}`}
            className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full mb-6 hover:bg-primary-200 transition-colors"
          >
            {post.category_name}
          </Link>
        )}

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
          {post.title}
        </h1>

        {/* Meta Information */}
        <div className="flex items-center gap-4 text-gray-600 mb-8 pb-8 border-b">
          {post.author_name && (
            <span className="font-medium">By {post.author_name}</span>
          )}
          <span>•</span>
          <time dateTime={post.published_at}>
            {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          <span>•</span>
          <span>{post.reading_time_minutes} min read</span>
          <span>•</span>
          <span>{post.views} views</span>
        </div>

        {/* Content */}
        <div 
          className="prose prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-12">
            {post.tags.map((tag) => (
              <span
                key={tag.id}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-8">Related Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="group"
                >
                  <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                    {relatedPost.featured_image_url && (
                      <div className="aspect-video bg-gray-200">
                        <img
                          src={relatedPost.featured_image_url}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-lg font-bold mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
