import { prisma } from '@/lib/prisma'

import { Preview } from '@/app/components/Preview'

export default async function FormPage({ params  }) {
  const form = await prisma.form.findUnique({
    where: { id: params.id },
    include: { questions: { orderBy: { order: 'asc' } } }
  })

  if (!form) {
    return <div>Form not found</div>
  }

  return (
    <>
     
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="flex justify-end items-center mb-6">
        <a className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600' href="/">back</a>
      </div>
      
      <h2 className="text-xl font-semibold mb-6">{form.title}</h2>
      
      <Preview form={form} />
    </div>
    </>
  )
}
