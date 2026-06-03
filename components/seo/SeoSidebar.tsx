'use client'

import Link from 'next/link'
import type { SeoPage } from '@/lib/seo-content'

interface Props {
  pages: Pick<SeoPage, 'slug' | 'title_en' | 'page_type'>[]
  currentSlug: string
  cluster: string
}

export default function SeoSidebar({ pages, currentSlug, cluster }: Props) {
  const pillar = pages.find(p => p.page_type === 'pillar')
  const clusters = pages.filter(p => p.page_type === 'cluster')

  return (
    <nav style={{
      background: 'rgba(200,144,45,0.04)',
      border: '1px solid rgba(200,144,45,0.15)',
      borderRadius: '5px',
      padding: '1rem',
      position: 'sticky',
      top: '80px',
      maxHeight: 'calc(100vh - 100px)',
      overflowY: 'auto',
    }}>
      {/* Cluster label */}
      <div style={{
        fontSize: '0.68rem',
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: '#C8902D',
        marginBottom: '0.75rem',
        fontFamily: 'Georgia, serif',
        borderBottom: '1px solid rgba(200,144,45,0.2)',
        paddingBottom: '0.5rem',
      }}>
        {cluster.replace(/-/g, ' ')} Guide
      </div>

      {/* Pillar page link */}
      {pillar && (
        <div style={{ marginBottom: '0.5rem' }}>
          <Link
            href={`/learn/${pillar.slug}`}
            style={{
              display: 'block',
              padding: '0.55rem 0.75rem',
              borderRadius: '3px',
              textDecoration: 'none',
              fontSize: '0.82rem',
              fontFamily: 'Georgia, serif',
              fontWeight: 700,
              lineHeight: 1.4,
              background: currentSlug === pillar.slug
                ? 'rgba(200,144,45,0.18)'
                : 'transparent',
              color: currentSlug === pillar.slug
                ? '#C8902D'
                : '#D4B87A',
              borderLeft: currentSlug === pillar.slug
                ? '3px solid #C8902D'
                : '3px solid transparent',
              transition: 'all 0.15s',
            }}
          >
            ★ {pillar.title_en.split(' — ')[0]}
          </Link>
        </div>
      )}

      {/* Divider */}
      {clusters.length > 0 && (
        <div style={{
          fontSize: '0.65rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#7A6A50',
          margin: '0.5rem 0 0.4rem',
          fontFamily: 'Georgia, serif',
        }}>
          Deep Dive Topics
        </div>
      )}

      {/* Cluster pages */}
      {clusters.map(p => {
        const isActive = p.slug === currentSlug
        return (
          <Link
            key={p.slug}
            href={`/learn/${p.slug}`}
            style={{
              display: 'block',
              padding: '0.45rem 0.75rem',
              borderRadius: '3px',
              textDecoration: 'none',
              fontSize: '0.8rem',
              fontFamily: 'Georgia, serif',
              lineHeight: 1.4,
              marginBottom: '0.15rem',
              background: isActive
                ? 'rgba(200,144,45,0.14)'
                : 'transparent',
              color: isActive
                ? '#C8902D'
                : '#9A8568',
              borderLeft: isActive
                ? '3px solid #C8902D'
                : '3px solid transparent',
              transition: 'all 0.15s',
              fontWeight: isActive ? 600 : 400,
            }}
            onMouseEnter={e => {
              if (!isActive) {
                ;(e.currentTarget as HTMLElement).style.color = '#C9B48A'
                ;(e.currentTarget as HTMLElement).style.background = 'rgba(200,144,45,0.07)'
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                ;(e.currentTarget as HTMLElement).style.color = '#9A8568'
                ;(e.currentTarget as HTMLElement).style.background = 'transparent'
              }
            }}
          >
            {p.title_en.split(' — ')[0]}
          </Link>
        )
      })}

      {/* CTA in sidebar */}
      <div style={{
        marginTop: '1.25rem',
        paddingTop: '1rem',
        borderTop: '1px solid rgba(200,144,45,0.15)',
      }}>
        <Link
          href="/birth-form"
          style={{
            display: 'block',
            background: 'linear-gradient(135deg, #C8902D, #A0700F)',
            color: '#fff',
            textAlign: 'center',
            padding: '0.6rem',
            borderRadius: '3px',
            textDecoration: 'none',
            fontSize: '0.8rem',
            fontFamily: 'Georgia, serif',
            fontWeight: 700,
            letterSpacing: '0.02em',
          }}
        >
          ✦ Get Reading — ₹251
        </Link>
        <p style={{
          fontSize: '0.7rem',
          color: '#7A6A50',
          textAlign: 'center',
          margin: '0.4rem 0 0',
          fontStyle: 'italic',
        }}>
          Personalised by Rohiit Gupta
        </p>
      </div>
    </nav>
  )
}
