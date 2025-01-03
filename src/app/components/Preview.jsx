'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export function Preview({ form }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [answers, setAnswers] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch(`/api/forms/${form.id}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,  
          answers: Object.entries(answers).map(([questionId, value]) => ({
            questionId,
            value,
          })),
        }),
      })

      if (response.ok) {
        router.push(`/forms/${form.id}/success`)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="relative w-full h-20 bg-black shadow-lg">
        <div className="max-w-7xl mx-auto px-4 h-full flex justify-between items-center">
          <Image
            src="/logo1.png"
            alt="Left Logo"
            width={120}
            height={40}
            className="object-contain"
          />
          <Image
            src="/logo2.png"
            alt="Right Logo"
            width={120}
            height={40}
            className="object-contain"
          />
        </div>
      </div>

      <div className="relative w-full h-48 md:h-64">
        <Image
          src="/logo1.png"
          alt="Form Preview Banner"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center px-4">
            {form.title}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white/5 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-gray-700/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {form.description && (
              <p className="text-gray-300">{form.description}</p>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full bg-gray-900/50 text-white border-b-2 border-purple-500 px-3 py-2 rounded-lg focus:outline-none focus:border-purple-400 transition-colors"
                placeholder="Enter your email"
              />
            </div>

            {form.questions.map((question) => (
              <div key={question.id} className="bg-white/5 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-gray-700/50 transition-all hover:border-purple-500/50">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300">
                    {question.title}
                    {question.required && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  
                  {question.imageUrl && (
                    <div className="mt-4 relative h-40 w-full">
                      <Image
                        src={question.imageUrl}
                        alt={question.title}
                        fill
                        className="object-contain rounded-lg"
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
                    className="w-full bg-gray-900/50 text-white border-b-2 border-purple-500 px-3 py-2 rounded-lg focus:outline-none focus:border-purple-400 transition-colors"
                    placeholder="Your answer"
                  />
                )}

                {question.type === 'long' && (
                  <textarea
                    required={question.required}
                    onChange={(e) =>
                      setAnswers({ ...answers, [question.id]: e.target.value })
                    }
                    rows={4}
                    className="w-full bg-gray-900/50 text-white border-b-2 border-purple-500 px-3 py-2 rounded-lg focus:outline-none focus:border-purple-400 transition-colors"
                    placeholder="Your answer"
                  />
                )}

                {question.type === 'multiple' && (
                  <div className="mt-1 space-y-3">
                    {question.options.map((option) => (
                      <label key={option} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          required={question.required}
                          onChange={(e) =>
                            setAnswers({ ...answers, [question.id]: e.target.value })
                          }
                          className="w-4 h-4 border-2 border-purple-500 text-purple-500 focus:ring-purple-500 focus:ring-offset-gray-800"
                        />
                        <span className="text-gray-300">{option}</span>
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
                    className="w-full bg-gray-900/50 text-white border-b-2 border-purple-500 px-3 py-2 rounded-lg focus:outline-none focus:border-purple-400 transition-colors"
                  >
                    <option value="">Select an option</option>
                    {question.options.map((option) => (
                      <option key={option} value={option} className="bg-gray-800">
                        {option}
                      </option>
                    ))}
                  </select>
                )}

                {question.type === 'checkbox' && (
                  <div className="mt-1 space-y-3">
                    {question.options.map((option) => (
                      <label key={option} className="flex items-center gap-2">
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
                          className="w-4 h-4 rounded border-2 border-purple-500 text-purple-500 focus:ring-purple-500 focus:ring-offset-gray-800"
                        />
                        <span className="text-gray-300">{option}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <button
              type="submit"
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-500 transition-all hover:scale-[1.02] shadow-lg"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}