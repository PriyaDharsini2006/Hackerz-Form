'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export function Preview({ form }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [answers, setAnswers] = useState({})

  

  return (
    <div className="max-w-3xl mx-auto p-6">
      <form className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{form.title}</h1>
          <a 
            className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors' 
            href="/"
          >
            Back
          </a>
        </div>
        
        {form.description && (
          <p className="text-gray-600 mt-2">{form.description}</p>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {form.questions.map((question) => (
          <div key={question.id} className="bg-white p-4 rounded-lg border">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                {question.title}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {question.imageUrl && (
                <div className="mt-2 relative h-48 w-full">
                  <Image
                    src={question.imageUrl}
                    alt={question.title}
                    fill
                    className="object-contain rounded-md"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              )}
            </div>

            {question.type === 'short' && (
              <input
                type="text"
                required={question.required}
                onChange={(e) =>
                  setAnswers({ ...answers, [question.id]: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            )}

            {question.type === 'long' && (
              <textarea
                required={question.required}
                onChange={(e) =>
                  setAnswers({ ...answers, [question.id]: e.target.value })
                }
                rows={4}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            )}

            {question.type === 'multiple' && (
              <div className="mt-1 space-y-2">
                {question.options.map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name={question.id}
                      value={option}
                      required={question.required}
                      onChange={(e) =>
                        setAnswers({ ...answers, [question.id]: e.target.value })
                      }
                      className="mr-2 focus:ring-blue-500 text-blue-500 border-gray-300"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {question.type === 'dropdown' && (
              <select
                required={question.required}
                onChange={(e) =>
                  setAnswers({ ...answers, [question.id]: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select an option</option>
                {question.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}

            {question.type === 'checkbox' && (
              <div className="mt-1 space-y-2">
                {question.options.map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      value={option}
                      onChange={(e) => {
                        const currentValues = answers[question.id]?.split(',') || []
                        const newValues = e.target.checked
                          ? [...currentValues, option]
                          : currentValues.filter((v) => v !== option)
                        setAnswers({
                          ...answers,
                          [question.id]: newValues.join(','),
                        })
                      }}
                      className="mr-2 rounded focus:ring-blue-500 text-blue-500 border-gray-300"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Submit
        </button>
      </form>
    </div>
  )
}