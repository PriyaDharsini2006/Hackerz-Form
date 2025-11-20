'use client'

import React, { useState } from 'react'

export default function ExportButton({ formId, formTitle }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleExport = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/forms/${formId}/responses?format=excel`)
      
      if (!response.ok) {
        throw new Error('Download failed')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${formTitle}-responses.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Export error:', err)
      setError('Failed to download. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleExport}
        disabled={isLoading}
        className={`bg-green-500 text-white px-4 py-2 rounded flex items-center space-x-2
          ${isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:bg-green-600'}`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Exporting...
          </>
        ) : (
          'Export Excel'
        )}
      </button>
      {error && (
        <div className="absolute top-full left-0 mt-2 text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}