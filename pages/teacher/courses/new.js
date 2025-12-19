import { useState } from 'react'
import { useRouter } from 'next/router'

export default function NewCourse() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const createCourse = async () => {
    console.log('Attempting to create course...')
    
    const res = await fetch('/api/teacher/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description })
    })

    console.log('Response status:', res.status)
    
    if (res.ok) {
      const course = await res.json()
      router.push(`/teacher/courses/${course.id}`)
    } else {
      const error = await res.json()
      console.error('Error:', error)
      alert(`Failed to create course: ${error.message}`)
    }
  }

  return (
    
      <div className="max-w-xl mx-auto py-12">
        <h1 className="text-2xl font-bold">Create Course</h1>

        <input
          className="border w-full p-2 mt-4"
          placeholder="Course title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <textarea
          className="border w-full p-2 mt-4"
          placeholder="Description"
          rows="4"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        <button
          onClick={createCourse}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Course
        </button>
      </div>
    
  )
}