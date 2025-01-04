'use client'
import { FormBuilder } from '@/app/components/FormBuilder'

export default function CreateFormPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <a href='/'>Back</a>
      <h2 className="text-xl font-semibold mb-6">Create New Form</h2>
      <FormBuilder />
    </div>
  )
}