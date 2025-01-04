'use client'
import Image from 'next/image'

export function ResponsesList({ form }) {
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
          alt="Responses Banner"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center px-4">
            {form.title} Responses
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white/5 backdrop-blur-lg rounded-xl shadow-xl border border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700/50">
              <thead className="bg-gray-900/50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                    Email
                  </th>
                  {form.questions.map((question) => (
                    <th
                      key={question.id}
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider"
                    >
                      {question.title}
                    </th>
                  ))}
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                    Submitted At
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {form.responses.map((response, responseIdx) => (
                  <tr 
                    key={response.id}
                    className="hover:bg-purple-500/5 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0 rounded-full bg-purple-500/10 flex items-center justify-center mr-3">
                          <span className="text-purple-300">
                            {response.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="truncate max-w-xs">{response.email}</span>
                      </div>
                    </td>
                    {form.questions.map((question) => (
                      <td
                        key={question.id}
                        className="px-6 py-4 text-sm text-gray-300"
                      >
                        <div className="max-w-xs overflow-hidden">
                          <div className="truncate">
                            {response.answers.find((a) => a.questionId === question.id)?.value || '-'}
                          </div>
                          <button 
                            className="text-xs text-purple-400 hover:text-purple-300 mt-1 hidden group-hover:block"
                            onClick={() => {
                              const value = response.answers.find((a) => a.questionId === question.id)?.value;
                              if (value) {
                                alert(value);
                              }
                            }}
                          >
                            Show full response
                          </button>
                        </div>
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(response.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {form.responses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">No responses yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}