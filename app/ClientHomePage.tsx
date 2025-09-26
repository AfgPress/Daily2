"use client"

import { useEffect, useState } from 'react';
import { AnimatedIndicatorNavbar } from "@/components/navbars/animated-indicator-navbar";
import HeroNewsSection from "@/components/crypto/hero-news-section";
import MarketTicker from "@/components/crypto/market-ticker";
import { NewsletterFooter } from "@/components/footers/newsletter-footer";
import { ModernNewsGrid } from "@/components/home/modern-news-grid";
import { MarketInsightsSection } from "@/components/home/market-insights-section";
import { NewsletterCTASection } from "@/components/home/newsletter-cta-section";
import { TrendingTopicsSection } from "@/components/home/trending-topics-section";
import { QuickStatsSection } from "@/components/home/quick-stats-section";
import { useCryptoPrices } from "@/hooks/use-crypto-prices";
import { getNewsPosts, SanityNewsPost, getImageUrl } from "@/lib/sanity";

export default function ClientHomePage() {
  const { data: priceTickers } = useCryptoPrices();
  const [newsPosts, setNewsPosts] = useState<SanityNewsPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch news posts from Sanity
  useEffect(() => {
    const fetchNewsPosts = async () => {
      try {
        const posts = await getNewsPosts(10); // Get latest 10 posts
        setNewsPosts(posts);
      } catch (error) {
        console.error('Error fetching news posts:', error);
        // Fallback to empty array if Sanity fails
        setNewsPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNewsPosts();
  }, []);
  // Get articles from Sanity data
  const featuredArticles = newsPosts.filter(post => post.featured);
  const regularArticles = newsPosts.filter(post => !post.featured);
  
  // Use featured articles first, then regular articles as fallback
  const featuredArticle = featuredArticles[0] || newsPosts[0];
  const secondaryArticles = featuredArticles.slice(1, 3).length > 0 
    ? featuredArticles.slice(1, 3) 
    : newsPosts.slice(1, 4);

  // Transform articles to match hero section format
  const transformedFeaturedArticle = featuredArticle ? {
    id: featuredArticle._id,
    title: featuredArticle.title,
    excerpt: featuredArticle.description,
    author: featuredArticle.author?.name || 'DailyCrypto Team',
    publishedAt: featuredArticle.datePublished,
    category: featuredArticle.category?.name || 'News',
    imageUrl: featuredArticle.coverImage ? getImageUrl(featuredArticle.coverImage, 800, 600) : 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=800',
    slug: featuredArticle.slug?.current || ''
  } : null;

  const transformedSecondaryArticles = secondaryArticles.map(article => ({
    id: article._id,
    title: article.title,
    excerpt: article.description,
    author: article.author?.name || 'DailyCrypto Team',
    publishedAt: article.datePublished,
    category: article.category?.name || 'News',
    imageUrl: article.coverImage ? getImageUrl(article.coverImage, 600, 400) : 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=600',
    slug: article.slug?.current || ''
  }));

  // Transform crypto data to match hero section format
  const heroTickers = priceTickers.slice(0, 6).map((ticker) => ({
    symbol: ticker.symbol,
    name: ticker.name,
    price: ticker.price,
    change: ticker.change24h,
    changePercent: ticker.changePercent24h,
  }));

  return (
    <div className="min-h-screen bg-[var(--color-background-site)]">
      {/* Navigation */}
      <AnimatedIndicatorNavbar />
      
      {/* Full-width Price Ticker */}
      <MarketTicker />
      
      {/* Hero News Section with Enhanced Spacing */}
      <section className="w-full bg-gradient-to-b from-[var(--color-background-site)] to-[var(--color-surface)] py-4">
        {!isLoading && transformedFeaturedArticle && (
          <HeroNewsSection 
            featuredArticle={transformedFeaturedArticle}
            secondaryArticles={transformedSecondaryArticles}
            priceTickers={heroTickers}
          />
        )}
        {isLoading && (
          <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[var(--color-text-secondary)]">Loading latest news...</p>
            </div>
          </div>
        )}
      </section>
      
      {/* Quick Market Stats */}
      <section className="w-full bg-[var(--color-surface)] py-8">
        <QuickStatsSection />
      </section>
      
      {/* Trending Topics */}
      <section className="w-full bg-[var(--color-background-site)] py-12">
        <TrendingTopicsSection />
      </section>
      
      {/* Modern News Grid */}
      <section className="w-full bg-[var(--color-surface)] py-16">
        <ModernNewsGrid />
      </section>
      
      {/* Market Analysis & Insights */}
      <section className="w-full bg-[var(--color-background-site)] py-16">
        <MarketInsightsSection />
      </section>
      
      {/* Newsletter CTA */}
      <section className="w-full bg-gradient-to-r from-[var(--color-primary-brand)]/5 to-purple-500/5 py-16">
        <NewsletterCTASection />
      </section>
      
      {/* Footer - Full Width */}
      <div className="w-full">
        <NewsletterFooter />
      </div>
    </div>
  );
}