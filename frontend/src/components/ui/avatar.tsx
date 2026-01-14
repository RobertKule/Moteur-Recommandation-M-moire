import React from 'react'

interface AvatarProps {
  src?: string
  alt?: string
  fallback?: string
  className?: string
}

export function Avatar({ src, alt = 'Avatar', fallback, className = '' }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`w-10 h-10 rounded-full object-cover ${className}`}
      />
    )
  }

  return (
    <div className={`w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center ${className}`}>
      <span className="text-blue-600 font-medium">
        {fallback?.charAt(0).toUpperCase() || 'U'}
      </span>
    </div>
  )
}