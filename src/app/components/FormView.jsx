'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { signIn, useSession, signOut } from 'next-auth/react'

export function FormView({ form }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [submitError, setSubmitError] = useState('')
  const [answers, setAnswers] = useState({})
  const [existingResponse, setExistingResponse] = useState(null)
  const formColor = form.color || '#9333EA'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const formatDescription = (text) => {
    if (!text) return '';
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i !== text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  const isValidEmail = session?.user?.email?.endsWith('@citchennai.net')

  useEffect(() => {
    const fetchExistingResponse = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch(`/api/forms/${form.id}/responses/${session.user.email}`);
          if (response.ok) {
            const data = await response.json();
            setExistingResponse(data);
            // Pre-fill the answers
            const existingAnswers = {};
            data.answers.forEach(answer => {
              existingAnswers[answer.questionId] = answer.value;
            });
            setAnswers(existingAnswers);
          }
        } catch (error) {
          console.error('Error fetching existing response:', error);
        }
      }
      setIsLoading(false);
    };

    fetchExistingResponse();
  }, [session, form.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
  
    if (!session?.user?.email) {
      await signIn('google');
      return;
    }
  
    if (!isValidEmail) {
      setSubmitError('Please use a college email address');
      return;
    }
  
    setIsSubmitting(true);
    try {
      const method = existingResponse ? 'PUT' : 'POST';
      const response = await fetch(`/api/forms/${form.id}/responses`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session.user.email,
          answers: Object.entries(answers).map(([questionId, value]) => ({
            questionId,
            value,
          })),
        }),
      });
  
      if (response.ok) {
        router.push(`/forms/${form.id}/success`);
      } else {
        const data = await response.json();
        setSubmitError(data.error || 'An error occurred while submitting the form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError('An error occurred while submitting the form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitchAccount = async () => {
    await signOut({ redirect: false })
    await signIn('google')
  }

  const buttonStyle = {
    backgroundColor: formColor,
    ':hover': {
      backgroundColor: formColor,
      opacity: 0.9
    }
  }

  const getPreviousAnswer = (questionId) => {
    if (!existingResponse) return null;
    const answer = existingResponse.answers.find(a => a.questionId === questionId);
    return answer ? answer.value : null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Header section remains the same */}
      <div className="relative w-full h-25 from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 h-full flex justify-between items-center">
          <Image
            src="/logo2.png"
            alt="Left Logo"
            width={120}
            height={40}
            className="object-contain mt-[-10px]"
          />
          <p className="text-white text-6xl font-hacked">Hackerz <span className="text-[#00f5d0]">Form</span></p>
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
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center px-4">
            {form.title}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {!form.isActive ? (
          <div className="bg-red-500/10 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-red-500/50">
            <p className="text-red-400 text-xl text-center font-semibold">
              This form is currently deactivated
            </p>
          </div>
        ) : (
          <>
            {existingResponse && (
              <div className="bg-blue-500/10 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-blue-500/50">
                <p className="text-blue-400 text-lg font-semibold mb-2">
                  You're updating your previous response
                </p>
                <p className="text-gray-300 text-sm">
                  Last submitted: {new Date(existingResponse.updatedAt).toLocaleString()}
                </p>
              </div>
            )}

            {form.description && (
              <div className="bg-white/5 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-gray-700/50">
                <p className="text-gray-300">{formatDescription(form.description)}</p>
              </div>
            )}

            {/* Email section remains the same */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <p className="text-gray-400">
                    {status === 'loading'
                      ? 'Loading...'
                      : session?.user?.email || 'Please sign in to submit the form'}
                  </p>
                  {session?.user?.email && !isValidEmail && (
                    <p className="text-red-400 text-sm mt-2">
                      Please use college email address
                    </p>
                  )}
                </div>
                {!session && (
                  <button
                    onClick={() => signIn('google')}
                    style={buttonStyle}
                    className="px-4 py-2 text-white rounded-lg transition-colors"
                  >
                    Sign in with Google
                  </button>
                )}
                {session && (
                  <button
                    onClick={handleSwitchAccount}
                    style={buttonStyle}
                    className="px-4 py-2 text-black rounded-lg transition-colors"
                  >
                    Switch Account
                  </button>
                )}
              </div>
            </div>

            {submitError && (
              <div className="bg-red-500/10 text-red-400 p-4 rounded-lg border border-red-500/50">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {form.questions.map((question) => {
                const previousAnswer = getPreviousAnswer(question.id);
                return (
                  <div
                    key={question.id}
                    className="bg-white/5 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-gray-700/50 transition-all"
                    style={{ ':hover': { borderColor: `${formColor}50` } }}
                  >
                    <label className="block text-lg font-medium text-white mb-4">
                      {question.title}
                      {question.required && (
                        <span className="text-red-400 ml-1">*</span>
                      )}
                    </label>

                    {previousAnswer && (
                      <div className="mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-600">
                        <p className="text-sm text-gray-400">Previous answer:</p>
                        <p className="text-gray-300">{previousAnswer}</p>
                      </div>
                    )}

                    {question.imageUrl && (
                      <div className="mb-4 relative h-48 w-full">
                        <Image
                          src={question.imageUrl}
                          alt={question.title}
                          fill
                          className="object-contain rounded-lg"
                        />
                      </div>
                    )}

                    {question.type === 'short' && (
                      <input
                        type="text"
                        required={question.required}
                        value={answers[question.id] || ''}
                        onChange={(e) =>
                          setAnswers({ ...answers, [question.id]: e.target.value })
                        }
                        className="w-full bg-gray-900/50 text-white border-b-2 px-3 py-2 rounded-lg focus:outline-none transition-colors"
                        style={{
                          borderColor: formColor,
                          ':focus': { borderColor: `${formColor}CC` }
                        }}
                      />
                    )}

                    {question.type === 'long' && (
                      <textarea
                        required={question.required}
                        value={answers[question.id] || ''}
                        onChange={(e) =>
                          setAnswers({ ...answers, [question.id]: e.target.value })
                        }
                        rows={4}
                        className="w-full bg-gray-900/50 text-white border-b-2 px-3 py-2 rounded-lg focus:outline-none transition-colors"
                        style={{
                          borderColor: formColor,
                          ':focus': { borderColor: `${formColor}CC` }
                        }}
                      />
                    )}

                    {question.type === 'multiple' && (
                      <div className="space-y-3">
                        {question.options.map((option) => (
                          <label key={option} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={question.id}
                              value={option}
                              checked={answers[question.id] === option}
                              required={question.required}
                              onChange={(e) =>
                                setAnswers({ ...answers, [question.id]: e.target.value })
                              }
                              className="w-4 h-4 border-2 focus:ring-offset-gray-800"
                              style={{
                                borderColor: formColor,
                                color: formColor,
                                ':focus': { ringColor: formColor }
                              }}
                            />
                            <span className="text-gray-300">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === 'dropdown' && (
                      <select
                        required={question.required}
                        value={answers[question.id] || ''}
                        onChange={(e) =>
                          setAnswers({ ...answers, [question.id]: e.target.value })
                        }
                        className="w-full bg-gray-900/50 text-white border-b-2 px-3 py-2 rounded-lg focus:outline-none transition-colors"
                        style={{
                          borderColor: formColor,
                          ':focus': { borderColor: `${formColor}CC` }
                        }}
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
                      <div className="space-y-3">
                        {question.options.map((option) => (
                          <label key={option} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              value={option}
                              checked={(answers[question.id] || '').split(',').includes(option)}
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
                              style={{
                                borderColor: formColor,
                                color: formColor,
                                ':focus': { ringColor: formColor }
                              }}
                            />
                            <span className="text-gray-300">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              <button
                type="submit"
                disabled={isSubmitting || !session || !isValidEmail}
                style={{
                  ...buttonStyle,
                  ':disabled': {
                    opacity: 0.5,
                    transform: 'scale(1)',
                    backgroundColor: formColor,
                  },
                }}
                className="w-full px-6 py-3 text-black rounded-xl transition-all hover:scale-[1.02] shadow-lg disabled:hover:scale-100"
              >
                {isSubmitting ? 'Submitting...' : existingResponse ? 'Update Response' : 'Submit Form'}
              </button>
            </form>
          </>
        )}
        <div className="mt-[10px]">
          <a className="bg-red-500 mt-[10px] text-white px-4 py-2 rounded hover:bg-red-600" href="/">
            Back
          </a>
        </div>
      </div>
    </div>
  )
}