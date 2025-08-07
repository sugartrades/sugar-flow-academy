import React, { useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Link } from 'react-router-dom';

interface Post {
  title: string;
  slug: string;
  excerpt: string;
  path: string;
}

const posts: Post[] = [
  {
    title: 'A Counterpoint on Validator Standards: Prioritizing Decentralization and Performance Over Dogma',
    slug: 'validator-standards-counterpoint',
    excerpt:
      'Why pragmatic validator standards matter for resilient decentralized networks—and how performance and diversity strengthen security.',
    path: '/blog/validator-standards-counterpoint',
  },
];

function ensureMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function ensureCanonical(url: string) {
  let link = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

export default function Blog() {
  useEffect(() => {
    document.title = 'Blog | SugarTrades';
    ensureMeta(
      'description',
      'SugarTrades blog: insights on crypto trading, decentralization, and network performance.'
    );
    ensureCanonical(`${window.location.origin}/blog`);

    const ld = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'SugarTrades Blog',
      url: `${window.location.origin}/blog`,
      description:
        'SugarTrades blog: insights on crypto trading, decentralization, and network performance.',
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(ld);
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <header className="container py-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">SugarTrades Blog</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Practical perspectives on crypto markets, decentralized systems, and risk-aware trading.
          </p>
        </header>

        <section className="container pb-16 grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <article key={post.slug} className="rounded-lg border bg-card p-6">
              <h2 className="text-xl font-semibold leading-tight">
                <Link to={post.path} className="hover:text-primary transition-colors">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">{post.excerpt}</p>
              <div className="mt-4">
                <Link to={post.path} className="text-sm font-medium text-primary hover:underline">
                  Read article
                </Link>
              </div>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}
