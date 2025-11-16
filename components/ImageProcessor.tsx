'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

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
  const [displayOpacity, setDisplayOpacity] = useState(100)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const opacityTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isProcessingRef = useRef(false)

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

  const getColorName = (hex: string): string => {
    const normalizedHex = hex.toLowerCase()
    const rgb = hexToRgb(normalizedHex)
    if (!rgb) return normalizedHex

    const colorMap: { [key: string]: string } = {
      '#ffffff': 'White',
      '#000000': 'Black',
      '#ff0000': 'Red',
      '#00ff00': 'Green',
      '#0000ff': 'Blue',
      '#ffff00': 'Yellow',
      '#ff00ff': 'Magenta',
      '#00ffff': 'Cyan',
      '#ffa500': 'Orange',
      '#800080': 'Purple',
      '#ffc0cb': 'Pink',
      '#a52a2a': 'Brown',
      '#808080': 'Gray',
      '#c0c0c0': 'Silver',
      '#ffd700': 'Gold',
      '#008000': 'Dark Green',
      '#000080': 'Navy',
      '#800000': 'Maroon',
      '#008080': 'Teal',
      '#ff6347': 'Tomato',
      '#40e0d0': 'Turquoise',
      '#ee82ee': 'Violet',
      '#f5deb3': 'Wheat',
      '#9acd32': 'Yellow Green',
      '#2e8b57': 'Sea Green',
      '#da70d6': 'Orchid',
      '#d2691e': 'Chocolate',
      '#cd5c5c': 'Indian Red',
      '#4b0082': 'Indigo',
      '#f0e68c': 'Khaki',
      '#e6e6fa': 'Lavender',
      '#fff0f5': 'Lavender Blush',
      '#7cfc00': 'Lawn Green',
      '#fffacd': 'Lemon Chiffon',
      '#add8e6': 'Light Blue',
      '#f08080': 'Light Coral',
      '#e0ffff': 'Light Cyan',
      '#fafad2': 'Light Goldenrod Yellow',
      '#d3d3d3': 'Light Gray',
      '#90ee90': 'Light Green',
      '#ffb6c1': 'Light Pink',
      '#ffa07a': 'Light Salmon',
      '#20b2aa': 'Light Sea Green',
      '#87cefa': 'Light Sky Blue',
      '#778899': 'Light Slate Gray',
      '#b0c4de': 'Light Steel Blue',
      '#ffffe0': 'Light Yellow',
      '#32cd32': 'Lime Green',
      '#faf0e6': 'Linen',
      '#66cdaa': 'Medium Aquamarine',
      '#0000cd': 'Medium Blue',
      '#ba55d3': 'Medium Orchid',
      '#9370db': 'Medium Purple',
      '#3cb371': 'Medium Sea Green',
      '#7b68ee': 'Medium Slate Blue',
      '#00fa9a': 'Medium Spring Green',
      '#48d1cc': 'Medium Turquoise',
      '#c71585': 'Medium Violet Red',
      '#191970': 'Midnight Blue',
      '#f5fffa': 'Mint Cream',
      '#ffe4e1': 'Misty Rose',
      '#ffe4b5': 'Moccasin',
      '#ffdead': 'Navajo White',
      '#fdf5e6': 'Old Lace',
      '#808000': 'Olive',
      '#6b8e23': 'Olive Drab',
      '#ff4500': 'Orange Red',
      '#eee8aa': 'Pale Goldenrod',
      '#98fb98': 'Pale Green',
      '#afeeee': 'Pale Turquoise',
      '#db7093': 'Pale Violet Red',
      '#ffefd5': 'Papaya Whip',
      '#ffdab9': 'Peach Puff',
      '#cd853f': 'Peru',
      '#dda0dd': 'Plum',
      '#b0e0e6': 'Powder Blue',
      '#bc8f8f': 'Rosy Brown',
      '#4169e1': 'Royal Blue',
      '#8b4513': 'Saddle Brown',
      '#fa8072': 'Salmon',
      '#f4a460': 'Sandy Brown',
      '#fff5ee': 'Seashell',
      '#a0522d': 'Sienna',
      '#87ceeb': 'Sky Blue',
      '#6a5acd': 'Slate Blue',
      '#708090': 'Slate Gray',
      '#fffafa': 'Snow',
      '#00ff7f': 'Spring Green',
      '#4682b4': 'Steel Blue',
      '#d2b48c': 'Tan',
      '#d8bfd8': 'Thistle',
      '#f5f5f5': 'White Smoke',
    }

    if (colorMap[normalizedHex]) {
      return colorMap[normalizedHex]
    }

    let closestColor = ''
    let minDistance = Infinity

    for (const [hexKey, colorName] of Object.entries(colorMap)) {
      const keyRgb = hexToRgb(hexKey)
      if (!keyRgb) continue

      const distance = Math.sqrt(
        Math.pow(rgb.r - keyRgb.r, 2) +
        Math.pow(rgb.g - keyRgb.g, 2) +
        Math.pow(rgb.b - keyRgb.b, 2)
      )

      if (distance < minDistance) {
        minDistance = distance
        closestColor = colorName
      }
    }

    if (minDistance < 30) {
      return closestColor
    }

    const getColorDescription = (r: number, g: number, b: number): string => {
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      const diff = max - min
      const sum = r + g + b
      const lightness = sum / 3

      if (diff < 10) {
        if (lightness > 240) return 'White'
        if (lightness < 15) return 'Black'
        return 'Gray'
      }

      const hue = (() => {
        if (diff === 0) return 0
        if (max === r) return ((g - b) / diff) % 6
        if (max === g) return (b - r) / diff + 2
        return (r - g) / diff + 4
      })()

      const hueDeg = Math.round(hue * 60)
      const saturation = diff / max
      const brightness = max / 255

      if (brightness < 0.2) return 'Very Dark'
      if (brightness > 0.9) return 'Very Light'
      if (saturation < 0.2) return 'Grayish'

      if (hueDeg >= 0 && hueDeg < 15) return 'Red'
      if (hueDeg >= 15 && hueDeg < 45) return 'Orange'
      if (hueDeg >= 45 && hueDeg < 75) return 'Yellow'
      if (hueDeg >= 75 && hueDeg < 150) return 'Green'
      if (hueDeg >= 150 && hueDeg < 210) return 'Cyan'
      if (hueDeg >= 210 && hueDeg < 270) return 'Blue'
      if (hueDeg >= 270 && hueDeg < 330) return 'Purple'
      return 'Pink'
    }

    return getColorDescription(rgb.r, rgb.g, rgb.b)
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

      const processedUrl = await processImage(originalUrl, displayOpacity, backgroundColor)

      newImages.push({
        id,
        originalFile: file,
        originalUrl,
        processedUrl,
        opacity: displayOpacity,
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

  const processImagesWithOpacity = useCallback(async (newOpacity: number) => {
    if (images.length === 0 || isProcessingRef.current) return
    
    isProcessingRef.current = true
    try {
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
      setOpacity(newOpacity)
    } finally {
      isProcessingRef.current = false
    }
  }, [images, backgroundColor, processImage])

  const handleOpacityChange = (newOpacity: number) => {
    setDisplayOpacity(newOpacity)
    
    if (opacityTimeoutRef.current) {
      clearTimeout(opacityTimeoutRef.current)
    }
    
    opacityTimeoutRef.current = setTimeout(() => {
      processImagesWithOpacity(newOpacity)
    }, 150)
  }

  useEffect(() => {
    return () => {
      if (opacityTimeoutRef.current) {
        clearTimeout(opacityTimeoutRef.current)
      }
    }
  }, [])

  const handleBackgroundColorChange = async (newColor: string) => {
    setBackgroundColor(newColor)
    const updatedImages = await Promise.all(
      images.map(async (img) => {
        const processedUrl = await processImage(img.originalUrl, displayOpacity, newColor)
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
            Opacity: {displayOpacity}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={displayOpacity}
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
          <p style={{
            fontSize: '0.875rem',
            color: '#666',
            marginBottom: '0.75rem',
            lineHeight: '1.4',
          }}>
            This color will be visible behind transparent areas of your images. Adjust the opacity slider to control how much of the background shows through.
          </p>
          <div style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap',
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
                minWidth: '150px',
                padding: '0.75rem',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
              }}
              placeholder="#ffffff"
            />
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: '500',
              color: '#333',
              minWidth: '120px',
              textAlign: 'center',
            }}>
              {getColorName(backgroundColor)}
            </div>
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

