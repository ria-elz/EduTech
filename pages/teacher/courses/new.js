import { useState } from 'react'
import { useRouter } from 'next/router'

export default function NewCourse() {
  const router = useRouter()
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Programming'
  })

  const createCourse = async () => {
    console.log('Attempting to create course...')
    
    const res = await fetch('/api/teacher/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
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
    <div className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">Create New Course</h1>

      <div className="space-y-4">
        <div>
          <label className="block font-semibold mb-2">Course Title</label>
          <input
            className="border w-full p-3 rounded"
            placeholder="Course title"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Description</label>
          <textarea
            className="border w-full p-3 rounded"
            placeholder="Description"
            rows="4"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
        </div>
        
        <div>
          <label className="block font-semibold mb-2">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full border rounded px-4 py-3"
          >
            <option value="Programming">💻 Programming</option>
            <option value="Design">🎨 Design</option>
            <option value="Business">💼 Business</option>
            <option value="Marketing">📈 Marketing</option>
            <option value="Mathematics">🔢 Mathematics</option>
            <option value="Science">🔬 Science</option>
            <option value="Language">🌍 Language</option>
            <option value="Music">🎵 Music</option>
            <option value="Health">❤️ Health & Fitness</option>
            <option value="Other">📚 Other</option>
          </select>
        </div>

        <button
          onClick={createCourse}
          className="w-full bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700 font-semibold"
        >
          Create Course
        </button>
      </div>
    </div>
  )
}