import Link from 'next/link'

export default function LearnNotFound() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0D0A06',
      color: '#F5EDD8',
      textAlign: 'center',
      padding: '2rem',
      fontFamily: 'Georgia, serif',
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔮</div>
      <h1 style={{ fontSize: '1.5rem', color: '#C8902D', marginBottom: '0.75rem' }}>
        Page Not Found
      </h1>
      <p style={{ color: '#8C7B60', marginBottom: '1.5rem', maxWidth: '400px', lineHeight: 1.6 }}>
        This article could not be found. The planets may have shifted — explore our full knowledge hub instead.
      </p>
      <Link
        href="/learn"
        style={{
          background: 'linear-gradient(135deg, #C8902D, #A0700F)',
          color: '#fff',
          padding: '0.65rem 1.4rem',
          borderRadius: '3px',
          textDecoration: 'none',
          fontWeight: 700,
          fontSize: '0.9rem',
        }}
      >
        ✦ Explore All Articles
      </Link>
    </div>
  )
}
