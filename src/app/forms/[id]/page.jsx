import { prisma } from '@/lib/prisma'
import { FormView } from '@/app/components/FormView'

export default async function FormPage({ params }) {
  // Wait for params to be resolved
  const { id } = params;
  
  const form = await prisma.form.findUnique({
    where: { id: id },
    include: { questions: { orderBy: { order: 'asc' } } }
  });

  if (!form) {
    return <div>Form not found</div>;
  }

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-xl font-semibold mb-6">{form.title}</h2>
        <FormView form={form} />
      </div>
    </>
  );
}
