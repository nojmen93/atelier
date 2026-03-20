import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: '#0a0a0a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1.5px solid #404040',
        }}
      >
        <span
          style={{
            color: '#f5f5f0',
            fontSize: 18,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          A
        </span>
      </div>
    ),
    { ...size }
  )
}
