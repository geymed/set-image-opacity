import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Image Opacity Controller',
  description: 'Upload images and control their opacity with customizable background colors',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

