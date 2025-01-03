import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function Home() {
  const forms = await prisma.form.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Your Forms</h2>
        <Link 
          href="/forms/create" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create New Form
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {forms.map((form) => (
          <div key={form.id} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-2">{form.title}</h3>
            <p className="text-gray-600 mb-4">{form.description}</p>
            <div className="flex gap-2">
              <Link
                href={`/forms/${form.id}`}
                className="text-blue-500 hover:text-blue-600"
              >
                View
              </Link>
              <Link
                href={`/forms/${form.id}/responses`}
                className="text-green-500 hover:text-green-600"
              >
                Responses
              </Link>
              <Link
                href={`/forms/preview/${form.id}`}
                classNa me="text-gray-500 hover:text-gray-600"
              >
                Preview
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}