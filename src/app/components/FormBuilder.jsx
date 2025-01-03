'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export function FormBuilder() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addQuestion = (type) => {
    setQuestions([
      ...questions,
      {
        id: Math.random().toString(),
        type,
        title: '',
        options: [],
        required: false,
        order: questions.length,
        imageUrl: '',
      },
    ])
  }

  const handleImageUpload = async (id, file) => {
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const { url } = await response.json()
        updateQuestion(id, { imageUrl: url })
      } else {
        const error = await response.json()
        throw new Error(error.message)
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
    }
  }

  const updateQuestion = (id, updates) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    )
  }

  const deleteQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!title.trim()) {
      alert('Please enter a form title')
      return
    }

    if (questions.length === 0) {
      alert('Please add at least one question')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          questions: questions.map((q, index) => ({
            ...q,
            order: index,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create form')
      }

      const data = await response.json()
      router.push(`/forms/${data.id}`)
    } catch (error) {
      console.error('Error creating form:', error)
      alert('Failed to create form. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Form Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter form title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              rows={3}
              placeholder="Enter form description"
            />
          </div>

          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.id} className="p-4 border rounded-lg bg-gray-50">
                <div className="flex justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={question.title}
                      onChange={(e) =>
                        updateQuestion(question.id, { title: e.target.value })
                      }
                      placeholder="Question title *"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteQuestion(question.id)}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Image (Optional)
                  </label>
                  <input
                    type="file"
                    name="imageURL"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(question.id, e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {question.imageUrl && (
                    <div className="mt-2 relative h-40 w-full">
                      <Image
                        src={question.imageUrl}
                        alt="Question image"
                        fill
                        className="object-contain rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => updateQuestion(question.id, { imageUrl: '' })}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    checked={question.required}
                    onChange={(e) =>
                      updateQuestion(question.id, { required: e.target.checked })
                    }
                    className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                  <label className="text-sm text-gray-600">Required</label>
                </div>

                {(question.type === 'multiple' ||
                  question.type === 'dropdown' ||
                  question.type === 'checkbox') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Options (comma-separated) *
                    </label>
                    <input
                      type="text"
                      value={question.options.join(', ')}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          options: e.target.value.split(',').map((o) => o.trim()),
                        })
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter options separated by commas"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => addQuestion('short')}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Add Short Answer
            </button>
            <button
              type="button"
              onClick={() => addQuestion('long')}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Add Long Answer
            </button>
            <button
              type="button"
              onClick={() => addQuestion('multiple')}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Add Multiple Choice
            </button>
            <button
              type="button"
              onClick={() => addQuestion('dropdown')}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Add Dropdown
            </button>
            <button
              type="button"
              onClick={() => addQuestion('checkbox')}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Add Checkbox
            </button>
          </div>

          <div className="pt-4 border-t">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:bg-green-300"
            >
              {isSubmitting ? 'Creating Form...' : 'Create Form'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}