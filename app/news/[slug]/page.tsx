import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Clock, User, ArrowLeft, Share2, MessageCircle, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AnimatedIndicatorNavbar } from '@/components/navbars/animated-indicator-navbar'
import { NewsletterFooter } from '@/components/footers/newsletter-footer'
import MarketTicker from '@/components/crypto/market-ticker'
import { getNewsPostBySlug, getNewsPosts, getImageUrl, SanityNewsPost } from '@/lib/sanity'
import ArticleBody from '@/components/article/ArticleBody'
import { PortableText } from '@portabletext/react'

interface ArticlePageProps {
  params: Promise<{
    slug: string
  }>
}

// Portable Text components for rich content rendering
const portableTextComponents = {
  types: {
    image: ({ value }: any) => (
      <div className="my-8">
        <Image
          src={getImageUrl(value, 800, 600)}
          alt={value.alt || 'Article image'}
          width={800}
          height={600}
          className="rounded-xl shadow-lg"
        />
        {value.caption && (
          <p className="text-sm text-muted-foreground text-center mt-2 italic">
            {value.caption}
          </p>
        )}
      </div>
    ),
  },
  marks: {
    link: ({ children, value }: any) => (
      <a
        href={value.href}
        target={value.blank ? '_blank' : undefined}
        rel={value.blank ? 'noopener noreferrer' : undefined}
        className="text-primary hover:underline"
      >
        {children}
      </a>
    ),
  },
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-PH', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export async function generateStaticParams() {
  try {
    // Fetch all published news posts to generate static params
    const posts = await getNewsPosts(100) // Get more posts for static generation
    
    return posts
      .filter(post => post.slug?.current) // Only posts with valid slugs
      .map((post) => ({
        slug: post.slug.current
      }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return [] // Return empty array if Sanity is unavailable
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const awaitedParams = await params
  const article = await getNewsPostBySlug(awaitedParams.slug)

  if (!article) {
    return {
      title: 'Article Not Found | DailyCrypto',
      description: 'The requested article could not be found.'
    }
  }

  return {
    title: `${article.title} | DailyCrypto`,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      images: [article.coverImage ? getImageUrl(article.coverImage, 1200, 630) : ''],
      type: 'article',
      publishedTime: article.datePublished,
      authors: [article.author.name],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      images: [article.coverImage ? getImageUrl(article.coverImage, 1200, 630) : ''],
    }
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const awaitedParams = await params
  const article = await getNewsPostBySlug(awaitedParams.slug)
  
  if (!article) {
    notFound()
  }
  
  // Fetch related articles from the same category
  const relatedArticles = await getNewsPosts(3).then(posts => 
    posts
      .filter(post => post._id !== article._id && post.category?.name === article.category?.name)
      .slice(0, 3)
  )

  const shareUrl = `https://dailycrypto.ph/news/${article.slug}`
  const shareTitle = encodeURIComponent(article.title)

  return (
    <div className="min-h-screen bg-background">
      <AnimatedIndicatorNavbar />
      <MarketTicker />
      
      <main className="container mx-auto px-4 pt-8 pb-8 max-w-4xl">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/news" className="hover:text-foreground transition-colors">
            News
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{article.title}</span>
        </nav>

        {/* Back Button */}
        <Button variant="ghost" className="mb-6" asChild>
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <article className="space-y-8">
          {/* Article Header */}
          <header className="space-y-6">
            <div className="space-y-4">
              <Badge variant="secondary" className="text-xs font-medium">
                {article.category?.name || 'News'}
              </Badge>
              
              <h1 className="text-4xl md:text-5xl font-bold leading-tight text-foreground">
                {article.title}
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                {article.description}
              </p>
            </div>

            {/* Article Metadata */}
            <div className="mt-4 mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>By {article.author.name}</span>
              </div>
              
              <span>{formatDate(article.datePublished)}</span>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{article.readingTime || 5} min read</span>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div className="flex items-center gap-4 pt-4 border-t">
              <span className="text-sm font-medium">Share:</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" asChild>
                  <a 
                    href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-0 shadow-none"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    X
                  </a>
                </Button>
                
                <Button size="sm" variant="outline" asChild>
                  <a 
                    href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-0 shadow-none"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Facebook
                  </a>
                </Button>
                
                <Button size="sm" variant="outline" asChild>
                  <a 
                    href={`https://t.me/share/url?url=${shareUrl}&text=${shareTitle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-0 shadow-none"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Telegram
                  </a>
                </Button>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          <div className="relative aspect-video rounded-xl overflow-hidden bg-muted shadow-sm">
            <Image
              src={article.coverImage ? getImageUrl(article.coverImage, 1200, 675) : 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=1200'}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              priority
            />
          </div>

          {/* Article Content */}
          <ArticleBody>
            {article.content && (
              <PortableText 
                value={article.content} 
                components={portableTextComponents}
              />
            )}
          </ArticleBody>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-6 border-t">
            <span className="text-sm font-medium">Tags:</span>
            {(article.tags || []).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </article>

        <Separator className="my-12" />

        {/* Author Bio */}
        <section className="space-y-6">
          <h3 className="text-2xl font-bold">About the Author</h3>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0 shadow-sm">
                  <Image
                    src={article.author?.avatar ? getImageUrl(article.author.avatar, 64, 64) : 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=64'}
                    alt={article.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg">{article.author.name}</h4>
                  <p className="text-muted-foreground">{article.author?.bio || 'Contributing writer at DailyCrypto'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-12" />

        {/* Newsletter CTA */}
        <section className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8 text-center space-y-4">
              <BookOpen className="w-12 h-12 mx-auto text-primary" />
              <h3 className="text-2xl font-bold">Stay Informed</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Get the latest news and insights delivered straight to your inbox.
              </p>
              <Button size="lg" className="mt-4">
                Subscribe to Newsletter
              </Button>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-12" />

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="space-y-6">
            <h3 className="text-2xl font-bold">Related Articles</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedArticles.map((relatedArticle) => (
                <Card key={relatedArticle._id} className="group hover:shadow-md transition-shadow">
                  <div className="relative aspect-video rounded-t-xl overflow-hidden">
                    <Image
                      src={relatedArticle.coverImage ? getImageUrl(relatedArticle.coverImage, 400, 225) : 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400'}
                      alt={relatedArticle.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <Badge variant="secondary">{relatedArticle.category?.name || 'News'}</Badge>
                      <span>{formatDate(relatedArticle.datePublished)}</span>
                    </div>
                    <Link href={`/news/${relatedArticle.slug.current}`}>
                      <h4 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                        {relatedArticle.title}
                      </h4>
                    </Link>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {relatedArticle.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        <Separator className="my-12" />

        {/* Comments Section Placeholder */}
        <section className="space-y-6">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            Comments
          </h3>
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/50" />
              <h4 className="font-semibold text-lg">Join the Discussion</h4>
              <p className="text-muted-foreground">
                Comments are coming soon. Share your thoughts on our social media channels.
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" size="sm">
                  Twitter
                </Button>
                <Button variant="outline" size="sm">
                  Facebook
                </Button>
                <Button variant="outline" size="sm">
                  Telegram
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <NewsletterFooter />
    </div>
  )
}