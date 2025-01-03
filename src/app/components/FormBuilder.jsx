'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'


export function FormBuilder() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState([])

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
      },
    ])
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

    try {
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          questions,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/`)
      }
    } catch (error) {
      console.error('Error creating form:', error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Form Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        {questions.map((question) => (
          <div key={question.id} className="p-4 border rounded-lg">
            <div className="flex justify-between gap-4 mb-4">
              <input
                type="text"
                value={question.title}
                onChange={(e) =>
                  updateQuestion(question.id, { title: e.target.value })
                }
                placeholder="Question"
                className="flex-1 rounded-md border border-gray-300 px-3 py-2"
              />
              <button
                type="button"
                onClick={() => deleteQuestion(question.id)}
                className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) =>
                  updateQuestion(question.id, { required: e.target.checked })
                }
                className="rounded border-gray-300"
              />
              <label className="text-sm text-gray-600">Required</label>
            </div>

            {(question.type === 'multiple' ||
              question.type === 'dropdown' ||
              question.type === 'checkbox') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Options (comma-separated)
                </label>
                <input
                  type="text"
                  value={question.options.join(', ')}
                  onChange={(e) =>
                    updateQuestion(question.id, {
                      options: e.target.value.split(',').map((o) => o.trim()),
                    })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
            )}
          </div>
        ))}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => addQuestion('short')}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Add Short Answer
          </button>
          <button
            type="button"
            onClick={() => addQuestion('long')}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Add Long Answer
          </button>
          <button
            type="button"
            onClick={() => addQuestion('multiple')}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Add Multiple Choice
          </button>
          <button
            type="button"
            onClick={() => addQuestion('dropdown')}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Add Dropdown
          </button>
          <button
            type="button"
            onClick={() => addQuestion('checkbox')}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Add Checkbox
          </button>
        </div>

        <div className="pt-4 border-t">
          <button
            type="submit"
            className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Create Form
          </button>
        </div>
      </form>
    </div>
  )
}