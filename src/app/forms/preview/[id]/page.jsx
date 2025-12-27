import prisma from "@/lib/prisma";
import { Preview } from "@/app/components/Preview";

export default async function FormPage({ params }) {
  const { id } = await params; 

  const form = await prisma.form.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  if (!form) {
    return <div>Form not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Preview form={form} />
    </div>
  );
}

