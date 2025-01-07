import Image from 'next/image'
import Link from 'next/link'
import { Check } from 'lucide-react'

export default function Page() {
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

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white/5 backdrop-blur-lg rounded-xl shadow-xl p-12 border border-gray-700/50 text-center">
          <div className="mb-8 flex justify-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
              <Check size={32} className="text-green-500" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">
            Form Submitted Successfully!
          </h1>
          
          <p className="text-gray-400 mb-8">
            Thank you for your response. Your submission has been recorded.
          </p>
        </div>
      </div>
    </div>
  )
}