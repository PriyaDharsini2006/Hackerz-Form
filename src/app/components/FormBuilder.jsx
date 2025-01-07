'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Plus, X, Trash2, ChevronDown } from 'lucide-react'

export function FormBuilder() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newOption, setNewOption] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [color, setColor] = useState('#9333EA')
  const dropdownRef = useRef(null)

  const questionTypes = [
    { type: 'short', label: 'Short Answer' },
    { type: 'long', label: 'Long Answer' },
    { type: 'multiple', label: 'Multiple Choice' },
    { type: 'dropdown', label: 'Dropdown' },
    { type: 'checkbox', label: 'Checkbox' }
  ]

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
    setIsDropdownOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])


  const addOption = (questionId) => {
    if (!newOption.trim()) return

    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: [...q.options, newOption.trim()]
        }
      }
      return q
    }))
    setNewOption('')
  }

  const removeOption = (questionId, optionIndex) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options]
        newOptions.splice(optionIndex, 1)
        return { ...q, options: newOptions }
      }
      return q
    }))
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
        throw new Error('Upload failed')
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

    const invalidQuestions = questions.filter(q => !q.title.trim())
    if (invalidQuestions.length > 0) {
      alert('Please fill in all question titles')
      return
    }

    const invalidOptionQuestions = questions.filter(q =>
      (q.type === 'multiple' || q.type === 'dropdown' || q.type === 'checkbox') &&
      q.options.length === 0
    )
    if (invalidOptionQuestions.length > 0) {
      alert('Please add at least one option for all choice-based questions')
      return
    }

    setIsSubmitting(true)

    try {
      const formData = {
        title,
        description,
        color,
        questions: questions.map((q, index) => ({
          type: q.type,
          title: q.title.trim(),
          options: q.options,
          required: q.required,
          order: index,
          imageUrl: q.imageUrl || '',
        })),
      }

      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create form')
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
          <Image
            src="/logo1.png"
            alt="Right Logo"
            width={120}
            height={40}
            className="object-contain mt-[8px]"
          />
        </div>
      </div>

      <div className="relative w-full h-48 md:h-64">
        <Image
          src="/logo1.png"
          alt="Form Builder Banner"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center px-4">
            Create Form
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white/5 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-gray-700/50">
          <form onSubmit={handleSubmit} className="space-y-6">
          <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-900/50 text-white text-2xl font-medium border-b-2 border-purple-500 px-3 py-2 rounded-lg focus:outline-none focus:border-purple-400 transition-colors"
              placeholder="Form Title"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-900/50 text-gray-300 border-b-2 border-purple-500 px-3 py-2 rounded-lg focus:outline-none focus:border-purple-400 transition-colors whitespace-pre-wrap min-h-[100px] resize-y"
              placeholder="Form Description"
            />

            <div className="flex items-center gap-4">
              <label className="text-gray-300">Form Color:</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-8 w-16 rounded cursor-pointer"
              />
            </div>
          </form>
        </div>

        {questions.map((question, index) => (
          <div key={question.id} className="bg-white/5 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-gray-700/50 transition-all hover:border-purple-500/50">
            <div className="flex justify-between gap-4 mb-4">
              <input
                type="text"
                value={question.title}
                onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
                className="flex-1 bg-gray-900/50 text-white border-b-2 border-purple-500 px-3 py-2 rounded-lg focus:outline-none focus:border-purple-400 transition-colors"
                placeholder="Question title"
              />
              <button
                onClick={() => deleteQuestion(question.id)}
                className="p-2 text-red-400 hover:text-red-300 transition-colors rounded-lg hover:bg-red-500/10"
              >
                <Trash2 size={20} />
              </button>
            </div>

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

            {(question.type === 'multiple' || question.type === 'dropdown' || question.type === 'checkbox') && (
              <div className="space-y-3">
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center gap-2">
                    <div className={`w-4 h-4 ${question.type === 'checkbox' ? 'border-2' : 'rounded-full border-2'} border-purple-500`} />
                    <div className="flex-1 px-3 py-2 bg-gray-900/50 text-white rounded-lg">
                      {option}
                    </div>
                    <button
                      onClick={() => removeOption(question.id, optionIndex)}
                      className="p-1 text-gray-400 hover:text-gray-300 hover:bg-red-500/10 rounded-full transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}

                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 ${question.type === 'checkbox' ? 'border-2' : 'rounded-full border-2'} border-purple-500`} />
                  <input
                    type="text"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addOption(question.id)
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-gray-900/50 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="Add option"
                  />
                  <button
                    onClick={() => addOption(question.id)}
                    className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-full transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                className="w-4 h-4 rounded border-gray-600 text-purple-500 focus:ring-purple-500 focus:ring-offset-gray-800"
              />
              <span className="text-sm text-gray-300">Required</span>
            </div>
          </div>
        ))}

        <div className="bg-white/5 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-gray-700/50">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full md:w-auto flex items-center justify-between gap-2 px-6 py-3 bg-purple-600/20 text-purple-300 rounded-xl hover:bg-purple-600/30 transition-all"
            >
              <span className="flex items-center gap-2">
                <Plus size={20} />
                Add New Question
              </span>
              <ChevronDown
                size={20}
                className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''
                  }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-50 mt-2 w-full bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
                <div className="max-h-[300px] overflow-y-auto">
                  {questionTypes.map(({ type, label }) => (
                    <button
                      key={type}
                      onClick={() => addQuestion(type)}
                      className="w-full px-4 py-3 text-left text-gray-300 hover:bg-purple-600/20 hover:text-purple-300 transition-colors flex items-center gap-2"
                    >
                      <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-600/10">
                        {type === 'short' && 'Aa'}
                        {type === 'long' && '¶'}
                        {type === 'multiple' && '○'}
                        {type === 'dropdown' && '▼'}
                        {type === 'checkbox' && '☐'}
                      </span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-500 disabled:bg-purple-800 disabled:cursor-not-allowed transition-all hover:scale-[1.02] shadow-lg"
        >
          {isSubmitting ? 'Creating Form...' : 'Create Form'}
        </button>
      </div>
    </div>
  )
}

export default FormBuilder;