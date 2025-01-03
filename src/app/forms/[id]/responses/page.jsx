import { prisma } from '@/lib/prisma'
import { ResponsesList } from '@/app/components/ResponsesList'

export default async function ResponsesPage({ params  }) {
  const form = await prisma.form.findUnique({
    where: { id: params.id },
    include: {
      questions: { orderBy: { order: 'asc' } },
      responses: {
        include: { answers: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!form) {
    return <div>Form not found</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <a
          href={`/api/forms/${form.id}/responses`}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          download
        >
          Export CSV
        </a>
        <a className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600' href="/">back</a>
      </div>
      <ResponsesList form={form} />
    </div>
  )
}