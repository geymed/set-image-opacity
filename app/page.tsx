'use client'

import { useState, useRef } from 'react'
import ImageProcessor from '@/components/ImageProcessor'

export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <h1 style={{
        color: 'white',
        fontSize: '2.5rem',
        marginBottom: '2rem',
        textAlign: 'center',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
      }}>
        Image Opacity Controller
      </h1>
      <ImageProcessor />
    </main>
  )
}

