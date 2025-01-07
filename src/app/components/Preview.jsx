'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Pencil, Plus, Trash2, Save, X, GripVertical, Link as LinkIcon } from 'lucide-react'

export function Preview({ form: initialForm }) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [email, setEmail] = useState('')
  const [answers, setAnswers] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [draggedQuestion, setDraggedQuestion] = useState(null)

  const handleDragStart = (e, questionId) => {
    setDraggedQuestion(questionId)
    e.currentTarget.classList.add('opacity-50')
  }

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('opacity-50')
    setDraggedQuestion(null)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e, targetQuestionId) => {
    e.preventDefault()
    if (!draggedQuestion || draggedQuestion === targetQuestionId) return

    const updatedQuestions = [...form.questions]
    const draggedIndex = updatedQuestions.findIndex(q => q.id === draggedQuestion)
    const targetIndex = updatedQuestions.findIndex(q => q.id === targetQuestionId)

    const [draggedItem] = updatedQuestions.splice(draggedIndex, 1)
    updatedQuestions.splice(targetIndex, 0, draggedItem)

    const reorderedQuestions = updatedQuestions.map((q, index) => ({
      ...q,
      order: index
    }))

    setForm({
      ...form,
      questions: reorderedQuestions
    })
  }

  const formatDescription = (text) => {
    if (!text) return '';
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i !== text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

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
          color: form.color,
          isActive: form.isActive,
          link: form.link
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
    }
  }


  const handleImageUpload = async (id, file) => {
    if (!file) return

    try {
      const reader = new FileReader()
      reader.readAsDataURL(file)

      reader.onloadend = async () => {
        const base64String = reader.result

        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: base64String
          }),
        })

        if (response.ok) {
          const { url } = await response.json()
          updateQuestion(id, { imageUrl: url })
        } else {
          throw new Error('Upload failed')
        }
      }

      reader.onerror = () => {
        throw new Error('Failed to read file')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
    }
  }

  const toggleFormActive = async () => {
    const updatedForm = {
      ...form,
      isActive: !form.isActive
    }
    setForm(updatedForm)

    try {
      const response = await fetch(`/api/edit/${form.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedForm),
      })

      if (!response.ok) {
        throw new Error('Failed to toggle form status')
      }

      router.refresh()
    } catch (error) {
      console.error('Error toggling form status:', error)
      setForm(form)
    }
  }

  const handleCancel = () => {
    setForm(initialForm)
    setIsEditing(false)
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="relative w-full h-25 from-gray-900 to-gray-800">
        <div className="w-full py-4 sm:py-6 from-gray-900 to-gray-800">
          <div className="max-w-7xl mx-auto px-4 h-full flex justify-between items-center">
            <Image
              src="/logo2.png"
              alt="Left Logo"
              width={120}
              height={40}
              className="object-contain mt-[-10px]"
            />
            <p className='text-white text-4xl sm:text-6xl font-hacked'>Hackerz <span className='text-purple-500'>Forms</span></p>
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

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {isEditing && (
          <div className="flex gap-4 items-center mb-4">
            <input
              type="color"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="w-12 h-12 rounded cursor-pointer"
            />
            <button
              onClick={toggleFormActive}
              className={`px-4 py-2 rounded ${form.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                } text-white transition-colors`}
            >
              {form.isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        )}

        <div className="bg-white/5 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-gray-700/50">
          <div className="space-y-6">
            {isEditing && (
              <textarea
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-gray-900/50 text-white px-3 py-2 rounded-lg focus:outline-none transition-colors min-h-[100px] resize-y"
                style={{ borderBottom: `2px solid ${form.color}` }}
                placeholder="Form description"
              />
            )}

            {!isEditing && form.description && (
              <div className="text-gray-300">
                {formatDescription(form.description)}
              </div>
            )}

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
                  className="mt-1 block w-full bg-gray-900/50 text-white px-3 py-2 rounded-lg focus:outline-none transition-colors"
                  style={{ borderBottom: `2px solid ${form.color}` }}
                  placeholder="Enter your email"
                />
              </div>
            )}

            {form.questions.map((question, index) => (
              <div
                key={question.id}
                draggable={isEditing}
                onDragStart={(e) => handleDragStart(e, question.id)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, question.id)}
                className="bg-white/5 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-gray-700/50 transition-all hover:border-opacity-50"
                style={{ borderColor: form.color }}
              >
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="cursor-move">
                        <GripVertical size={20} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={question.title}
                        onChange={(e) =>
                          updateQuestion(question.id, { title: e.target.value })
                        }
                        className="w-full bg-gray-900/50 text-white px-3 py-2 rounded-lg focus:outline-none transition-colors"
                        style={{ borderBottom: `2px solid ${form.color}` }}
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
                        className="bg-gray-900/50 text-white px-3 py-2 rounded-lg focus:outline-none transition-colors"
                        style={{ borderBottom: `2px solid ${form.color}` }}
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
                          className="w-4 h-4 rounded border-2 text-purple-500 focus:ring-offset-gray-800"
                          style={{ borderColor: form.color }}
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
                                className="flex-1 bg-gray-900/50 text-white px-3 py-2 rounded-lg focus:outline-none transition-colors"
                                style={{ borderBottom: `2px solid ${form.color}` }}
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
                            className="transition-colors"
                            style={{ color: form.color }}
                          >
                            + Add Option
                          </button>
                        </div>
                      )}

                    <div className="mb-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(question.id, e.target.files[0])}
                        className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-900 file:text-purple-300 hover:file:bg-purple-800 transition-colors"
                      />
                      {question.imageUrl && (
                        <div className="mt-2 relative h-40 w-full">
                          <Image
                            src={question.imageUrl}
                            alt="Question image"
                            fill
                            className="object-contain rounded-lg"
                          />
                          <button
                            onClick={() => updateQuestion(question.id, { imageUrl: '' })}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}

                    </div>

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

                    {question.link && (
                      <div className="mt-2">
                        <a
                          href={question.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline break-all flex items-center gap-2"
                          style={{ color: form.color }}
                        >
                          <LinkIcon size={16} />
                          {question.link}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {!isEditing && (
                  <>
                    {question.type === 'short' && (
                      <input
                        type="text"
                        required={question.required}
                        onChange={(e) =>
                          setAnswers({ ...answers, [question.id]: e.target.value })
                        }
                        className="w-full bg-gray-900/50 text-white px-3 py-2 rounded-lg focus:outline-none transition-colors"
                        style={{ borderBottom: `2px solid ${form.color}` }}
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
                        className="w-full bg-gray-900/50 text-white px-3 py-2 rounded-lg focus:outline-none transition-colors"
                        style={{ borderBottom: `2px solid ${form.color}` }}
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
                              className="w-4 h-4 border-2 focus:ring-offset-gray-800"
                              style={{ borderColor: form.color, color: form.color }}
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
                        className="w-full bg-gray-900/50 text-white px-3 py-2 rounded-lg focus:outline-none transition-colors"
                        style={{ borderBottom: `2px solid ${form.color}` }}
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
                              className="w-4 h-4 rounded border-2 focus:ring-offset-gray-800"
                              style={{ borderColor: form.color, color: form.color }}
                            />
                            <span className="text-gray-300">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}

            {isEditing && (
              <button
                onClick={addNewQuestion}
                className="w-full p-4 border-2 border-dashed rounded-xl hover:bg-opacity-10 transition-colors flex items-center justify-center gap-2"
                style={{ borderColor: form.color, color: form.color }}
              >
                <Plus size={20} />
                Add New Question
              </button>
            )}

          </div>

          <div className="flex gap-4 mt-6">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveForm}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors"
                  style={{ backgroundColor: form.color }}
                >
                  <Save size={20} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X size={20} />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 text-black rounded-lg transition-colors"
                style={{ backgroundColor: form.color }}
              >
                <Pencil size={20} />
                Edit Form
              </button>
            )}
          </div>
        </div>

        <div className="mt-4">
          <a
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            href="/"
          >
            Back
          </a>
        </div>
      </div>
    </div>
  )
}