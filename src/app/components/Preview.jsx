'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Pencil, Plus, Trash2, Save } from 'lucide-react'

export function Preview({ form: initialForm }) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [email, setEmail] = useState('')
  const [answers, setAnswers] = useState({})
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveForm = async () => {
    try {
      setIsSaving(true)
      const response = await fetch(`/api/edit/${form.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          questions: form.questions,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save form')
      }

      const updatedForm = await response.json()
      setForm(updatedForm)
      setIsEditing(false)
      router.refresh()
    } catch (error) {
      console.error('Error saving form:', error)
    } finally {
      setIsSaving(false)
      setIsEditing(false)
    }
  }

  const addNewQuestion = () => {
    const newQuestion = {
      id: `temp-${Date.now()}`,
      type: 'short',
      title: 'New Question',
      options: [],
      required: false,
      order: form.questions.length,
    }

    setForm({
      ...form,
      questions: [...form.questions, newQuestion],
    })
  }

  const updateQuestion = (questionId, updates) => {
    setForm({
      ...form,
      questions: form.questions.map((q) =>
        q.id === questionId ? { ...q, ...updates } : q
      ),
    })
  }

  const deleteQuestion = (questionId) => {
    setForm({
      ...form,
      questions: form.questions.filter((q) => q.id !== questionId),
    })
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="relative w-full h-25 from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 h-full flex justify-between items-center">
          <Image
            src="/logo2.png"
            alt="Left Logo"
            width={120}
            height={40}
            className="object-contain mt-[-10px]"
          />
          <p className='text-white text-6xl font-hacked'>Hackerz <span className='text-[#00f5d0]'>Form</span></p>
          <div className="flex items-center gap-4">
            <Image
              src="/logo1.png"
              alt="Right Logo"
              width={120}
              height={40}
              className="object-contain mt-[8px]"
            />
          </div>
        </div>
      </div>

      <div className="relative w-full h-48 md:h-64">
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          {isEditing ? (
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center px-4 bg-transparent border-b-2 border-purple-500 focus:outline-none"
            />
          ) : (
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center px-4">
              {form.title}
            </h1>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {isEditing && (
          <button
            onClick={addNewQuestion}
            className="w-full p-4 border-2 border-dashed border-purple-500 rounded-xl text-purple-500 hover:bg-purple-500/10 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add New Question
          </button>
        )}

        <div className="bg-white/5 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-gray-700/50">
          <form className="space-y-6">
            {isEditing && (
              <textarea
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-gray-900/50 text-white border-b-2 border-purple-500 px-3 py-2 rounded-lg focus:outline-none focus:border-purple-400 transition-colors"
                placeholder="Form description"
                rows={3}
              />
            )}

            {!isEditing && form.description && (
              <p className="text-gray-300">{form.description}</p>
            )}

            {/* Email field */}
            {!isEditing && (
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
            )}

            {/* Questions */}
            {form.questions.map((question, index) => (
              <div key={question.id} className="bg-white/5 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-gray-700/50 transition-all hover:border-purple-500/50">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <input
                        type="text"
                        value={question.title}
                        onChange={(e) =>
                          updateQuestion(question.id, { title: e.target.value })
                        }
                        className="w-full bg-gray-900/50 text-white border-b-2 border-purple-500 px-3 py-2 rounded-lg focus:outline-none focus:border-purple-400 transition-colors"
                        placeholder="Question title"
                      />
                      <button
                        onClick={() => deleteQuestion(question.id)}
                        className="ml-2 p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="flex gap-4">
                      <select
                        value={question.type}
                        onChange={(e) =>
                          updateQuestion(question.id, { type: e.target.value })
                        }
                        className="bg-gray-900/50 text-white border-b-2 border-purple-500 px-3 py-2 rounded-lg focus:outline-none focus:border-purple-400 transition-colors"
                      >
                        <option value="short">Short Answer</option>
                        <option value="long">Long Answer</option>
                        <option value="multiple">Multiple Choice</option>
                        <option value="checkbox">Checkboxes</option>
                        <option value="dropdown">Dropdown</option>
                      </select>

                      <label className="flex items-center gap-2 text-gray-300">
                        <input
                          type="checkbox"
                          checked={question.required}
                          onChange={(e) =>
                            updateQuestion(question.id, { required: e.target.checked })
                          }
                          className="w-4 h-4 rounded border-2 border-purple-500 text-purple-500 focus:ring-purple-500 focus:ring-offset-gray-800"
                        />
                        Required
                      </label>
                    </div>

                    {(question.type === 'multiple' ||
                      question.type === 'checkbox' ||
                      question.type === 'dropdown') && (
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex gap-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...question.options]
                                newOptions[optionIndex] = e.target.value
                                updateQuestion(question.id, { options: newOptions })
                              }}
                              className="flex-1 bg-gray-900/50 text-white border-b-2 border-purple-500 px-3 py-2 rounded-lg focus:outline-none focus:border-purple-400 transition-colors"
                              placeholder={`Option ${optionIndex + 1}`}
                            />
                            <button
                              onClick={() => {
                                const newOptions = question.options.filter(
                                  (_, i) => i !== optionIndex
                                )
                                updateQuestion(question.id, { options: newOptions })
                              }}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const newOptions = [...question.options, '']
                            updateQuestion(question.id, { options: newOptions })
                          }}
                          className="text-purple-500 hover:text-purple-400 transition-colors"
                        >
                          + Add Option
                        </button>
                      </div>
                    )}

                    <input
                      type="text"
                      value={question.imageUrl || ''}
                      onChange={(e) =>
                        updateQuestion(question.id, { imageUrl: e.target.value })
                      }
                      className="w-full bg-gray-900/50 text-white border-b-2 border-purple-500 px-3 py-2 rounded-lg focus:outline-none focus:border-purple-400 transition-colors"
                      placeholder="Image URL (optional)"
                    />
                  </div>
                ) : (
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
                )}
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
          </form>
          {isEditing ? (
              <button
                onClick={handleSaveForm}
                disabled={isSaving}
                className="flex items-center mt-[10px] gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                <Save size={20} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center mt-[10px] gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                <Pencil size={20} />
                Edit Form
              </button>
            )}
        </div>
        <div className='mt-[10px]'><a className='bg-red-500 mt-[10px] text-white px-4 py-2 rounded hover:bg-red-600' href="/">Back</a></div>
      </div>
    </div>
    </>
  )
}