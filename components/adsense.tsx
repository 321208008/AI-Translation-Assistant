import Script from 'next/script'

export function AdSense() {
  const clientId = 'ca-pub-9535069756501112'

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
      data-ad-client={clientId}
    />
  )
} 