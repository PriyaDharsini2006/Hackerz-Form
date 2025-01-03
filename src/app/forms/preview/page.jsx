    'use client'
    import { useState } from 'react'
    import { useRouter } from 'next/navigation'
    import exp from 'constants'

    function  PreviewFormPage({ form }) {
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
        <form onSubmit={handleSubmit} className="space-y-6">
        <div>
            <label className="block text-sm font-medium text-gray-700">
            Email Address
            </label>
            <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
        </div>

        {form.questions.map((question) => (
            <div key={question.id}>
            <label className="block text-sm font-medium text-gray-700">
                {question.title}
                {question.required && <span className="text-red-500">*</span>}
            </label>

            {question.type === 'short' && (
                <input
                type="text"
                required={question.required}
                onChange={(e) =>
                    setAnswers({ ...answers, [question.id]: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
            )}

            {question.type === 'long' && (
                <textarea
                required={question.required}
                onChange={(e) =>
                    setAnswers({ ...answers, [question.id]: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
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
                        className="mr-2"
                    />
                    {option}
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
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
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
                        className="mr-2"
                    />
                    {option}
                    </label>
                ))}
                </div>
            )}
            </div>
        ))}

        
        </form>
    )
    }

    export default PreviewFormPage