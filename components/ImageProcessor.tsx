'use client'

import { useState, useRef, useCallback } from 'react'

interface ProcessedImage {
  id: string
  originalFile: File
  originalUrl: string
  processedUrl: string | null
  opacity: number
}

export default function ImageProcessor() {
  const [images, setImages] = useState<ProcessedImage[]>([])
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [opacity, setOpacity] = useState(100)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processImage = useCallback(async (
    imageUrl: string,
    opacityValue: number,
    bgColor: string
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        const rgb = hexToRgb(bgColor)
        if (!rgb) {
          reject(new Error('Invalid background color'))
          return
        }

        ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.globalAlpha = opacityValue / 100
        ctx.drawImage(img, 0, 0)

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            resolve(url)
          } else {
            reject(new Error('Failed to create blob'))
          }
        }, 'image/png')
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = imageUrl
    })
  }, [])

  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const newImages: ProcessedImage[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) continue

      const id = `${Date.now()}-${i}`
      const originalUrl = URL.createObjectURL(file)

      const processedUrl = await processImage(originalUrl, opacity, backgroundColor)

      newImages.push({
        id,
        originalFile: file,
        originalUrl,
        processedUrl,
        opacity,
      })
    }

    setImages((prev) => [...prev, ...newImages])
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const updateAllImages = useCallback(async () => {
    const updatedImages = await Promise.all(
      images.map(async (img) => {
        const processedUrl = await processImage(img.originalUrl, opacity, backgroundColor)
        return {
          ...img,
          processedUrl,
          opacity,
        }
      })
    )
    setImages(updatedImages)
  }, [images, opacity, backgroundColor, processImage])

  const handleOpacityChange = async (newOpacity: number) => {
    setOpacity(newOpacity)
    const updatedImages = await Promise.all(
      images.map(async (img) => {
        const processedUrl = await processImage(img.originalUrl, newOpacity, backgroundColor)
        return {
          ...img,
          processedUrl,
          opacity: newOpacity,
        }
      })
    )
    setImages(updatedImages)
  }

  const handleBackgroundColorChange = async (newColor: string) => {
    setBackgroundColor(newColor)
    const updatedImages = await Promise.all(
      images.map(async (img) => {
        const processedUrl = await processImage(img.originalUrl, opacity, newColor)
        return {
          ...img,
          processedUrl,
        }
      })
    )
    setImages(updatedImages)
  }

  const handleDownload = (image: ProcessedImage) => {
    if (!image.processedUrl) return

    const link = document.createElement('a')
    link.href = image.processedUrl
    link.download = `processed-${image.originalFile.name}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleRemove = (id: string) => {
    setImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id)
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.originalUrl)
        if (imageToRemove.processedUrl) {
          URL.revokeObjectURL(imageToRemove.processedUrl)
        }
      }
      return prev.filter((img) => img.id !== id)
    })
  }

  const handleDownloadAll = () => {
    images.forEach((image) => {
      if (image.processedUrl) {
        setTimeout(() => handleDownload(image), 100)
      }
    })
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: '1200px',
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    }}>
      <div style={{
        marginBottom: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '600',
            color: '#333',
          }}>
            Upload Images (Multiple)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px dashed #667eea',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '600',
            color: '#333',
          }}>
            Opacity: {opacity}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={opacity}
            onChange={(e) => handleOpacityChange(Number(e.target.value))}
            style={{
              width: '100%',
              height: '8px',
              borderRadius: '4px',
              background: 'linear-gradient(to right, #667eea, #764ba2)',
              outline: 'none',
              cursor: 'pointer',
            }}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '600',
            color: '#333',
          }}>
            Background Color
          </label>
          <div style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
          }}>
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => handleBackgroundColorChange(e.target.value)}
              style={{
                width: '80px',
                height: '50px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            />
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => handleBackgroundColorChange(e.target.value)}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
              }}
              placeholder="#ffffff"
            />
          </div>
        </div>

        {images.length > 0 && (
          <button
            onClick={handleDownloadAll}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#5568d3'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#667eea'
            }}
          >
            Download All Images
          </button>
        )}
      </div>

      {images.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#999',
        }}>
          <p style={{ fontSize: '1.2rem' }}>No images uploaded yet</p>
          <p style={{ marginTop: '0.5rem' }}>Upload one or more images to get started</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}>
          {images.map((image) => (
            <div
              key={image.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div style={{
                position: 'relative',
                width: '100%',
                paddingTop: '75%',
                backgroundColor: backgroundColor,
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                {image.processedUrl && (
                  <img
                    src={image.processedUrl}
                    alt={image.originalFile.name}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                )}
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: '#666',
                wordBreak: 'break-word',
              }}>
                {image.originalFile.name}
              </div>
              <div style={{
                display: 'flex',
                gap: '0.5rem',
              }}>
                <button
                  onClick={() => handleDownload(image)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#5568d3'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#667eea'
                  }}
                >
                  Download
                </button>
                <button
                  onClick={() => handleRemove(image.id)}
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#dc2626'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#ef4444'
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

