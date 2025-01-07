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
          isActive: form.isActive
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
      {/* Header Section - Responsive */}
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
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">
        {isEditing && (
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4">
            <input
              type="color"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="w-12 h-12 rounded cursor-pointer"
            />
            <button
              onClick={toggleFormActive}
              className={`w-full sm:w-auto px-4 py-2 rounded ${form.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                } text-white transition-colors`}
            >
              {form.isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        )}

        <div className="bg-white/5 backdrop-blur-lg rounded-xl shadow-xl p-4 sm:p-6 border border-gray-700/50">
          <div className="space-y-4 sm:space-y-6">
            {isEditing && (
              <textarea
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-gray-900/50 text-white px-3 py-2 rounded-lg focus:outline-none transition-colors min-h-[100px] resize-y text-sm sm:text-base"
                style={{ borderBottom: `2px solid ${form.color}` }}
                placeholder="Form description"
              />
            )}

            {!isEditing && (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full bg-gray-900/50 text-white px-3 py-2 rounded-lg focus:outline-none transition-colors text-sm sm:text-base"
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
                className="bg-white/5 backdrop-blur-lg rounded-xl shadow-xl p-4 sm:p-6 border border-gray-700/50 transition-all hover:border-opacity-50"
                style={{ borderColor: form.color }}
              >
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <div className="cursor-move">
                        <GripVertical size={20} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={question.title}
                        onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
                        className="w-full bg-gray-900/50 text-white px-3 py-2 rounded-lg focus:outline-none transition-colors text-sm sm:text-base"
                        style={{ borderBottom: `2px solid ${form.color}` }}
                        placeholder="Question title"
                      />
                      <button
                        onClick={() => deleteQuestion(question.id)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <select
                        value={question.type}
                        onChange={(e) => updateQuestion(question.id, { type: e.target.value })}
                        className="w-full sm:w-auto bg-gray-900/50 text-white px-3 py-2 rounded-lg focus:outline-none transition-colors text-sm sm:text-base"
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
                          onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                          className="w-4 h-4 rounded border-2 text-purple-500 focus:ring-offset-gray-800"
                          style={{ borderColor: form.color }}
                        />
                        Required
                      </label>
                    </div>

                    {(question.type === 'multiple' || question.type === 'checkbox' || question.type === 'dropdown') && (
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex gap-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...question.options];
                                newOptions[optionIndex] = e.target.value;
                                updateQuestion(question.id, { options: newOptions });
                              }}
                              className="flex-1 bg-gray-900/50 text-white px-3 py-2 rounded-lg focus:outline-none transition-colors text-sm sm:text-base"
                              style={{ borderBottom: `2px solid ${form.color}` }}
                              placeholder={`Option ${optionIndex + 1}`}
                            />
                            <button
                              onClick={() => {
                                const newOptions = question.options.filter((_, i) => i !== optionIndex);
                                updateQuestion(question.id, { options: newOptions });
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
                            const newOptions = [...question.options, ''];
                            updateQuestion(question.id, { options: newOptions });
                          }}
                          className="text-sm sm:text-base transition-colors"
                          style={{ color: form.color }}
                        >
                          + Add Option
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Question Display */}
                    <label className="block text-sm sm:text-base font-medium text-gray-300">
                      {question.title}
                      {question.required && <span className="text-red-400 ml-1">*</span>}
                    </label>

                    {/* Answer Input Fields */}
                    {question.type === 'short' && (
                      <input
                        type="text"
                        required={question.required}
                        onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                        className="w-full bg-gray-900/50 text-white px-3 py-2 rounded-lg focus:outline-none transition-colors text-sm sm:text-base"
                        style={{ borderBottom: `2px solid ${form.color}` }}
                        placeholder="Your answer"
                      />
                    )}

                    {question.type === 'long' && (
                      <textarea
                        required={question.required}
                        onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                        rows={4}
                        className="w-full bg-gray-900/50 text-white px-3 py-2 rounded-lg focus:outline-none transition-colors text-sm sm:text-base"
                        style={{ borderBottom: `2px solid ${form.color}` }}
                        placeholder="Your answer"
                      />
                    )}

                    {/* Multiple Choice Options */}
                    {(question.type === 'multiple' || question.type === 'checkbox') && (
                      <div className="space-y-2">
                        {question.options.map((option) => (
                          <label key={option} className="flex items-center gap-2">
                            <input
                              type={question.type === 'multiple' ? 'radio' : 'checkbox'}
                              name={question.id}
                              value={option}
                              required={question.required}
                              onChange={(e) => {
                                if (question.type === 'multiple') {
                                  setAnswers({ ...answers, [question.id]: e.target.value });
                                } else {
                                  const currentValues = answers[question.id]?.split(',') || [];
                                  const newValues = e.target.checked
                                    ? [...currentValues, option]
                                    : currentValues.filter((v) => v !== option);
                                  setAnswers({
                                    ...answers,
                                    [question.id]: newValues.join(','),
                                  });
                                }
                              }}
                              className="w-4 h-4 rounded border-2 focus:ring-offset-gray-800"
                              style={{ borderColor: form.color, color: form.color }}
                            />
                            <span className="text-sm sm:text-base text-gray-300">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Add Question Button */}
            {isEditing && (
              <button
                onClick={addNewQuestion}
                className="w-full p-4 border-2 border-dashed rounded-xl hover:bg-opacity-10 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                style={{ borderColor: form.color, color: form.color }}
              >
                <Plus size={20} />
                Add New Question
              </button>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveForm}
                  disabled={isSaving}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg transition-colors text-sm sm:text-base"
                  style={{ backgroundColor: form.color }}
                >
                  <Save size={20} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base"
                >
                  <X size={20} />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-black rounded-lg transition-colors text-sm sm:text-base"
                style={{ backgroundColor: form.color }}
              >
                <Pencil size={20} />
                Edit Form
              </button>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-4">
          <a
            className="inline-block w-full sm:w-auto text-center bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm sm:text-base"
            href="/"
          >
            Back
          </a>
        </div>
      </div>
    </div>
  );
};
