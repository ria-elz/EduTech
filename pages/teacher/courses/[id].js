import { useState } from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

const fetcher = (url) => fetch(url).then(res => res.json())

export default function TeacherCoursePage() {
  const router = useRouter()
  const { id } = router.query
  const { data: session } = useSession()
  const [moduleTitle, setModuleTitle] = useState('')

  const { data: course, mutate } = useSWR(
    () => id ? `/api/teacher/courses/${id}` : null,
    fetcher
  )

  if (!course) return <div className="p-8">Loading...</div>

  if (session?.user.role !== 'TEACHER') {
    return <div className="p-8">Access denied</div>
  }

  const publishCourse = async () => {
    const res = await fetch(`/api/teacher/courses/${id}/publish`, {
      method: 'POST'
    })

    if (res.ok) {
      mutate()
      alert(course.published ? 'Course unpublished' : 'Course published')
    } else {
      alert('Failed to update course')
    }
  }

  const addModule = async () => {
    if (!moduleTitle.trim()) {
      alert('Please enter a module title')
      return
    }

    const res = await fetch(`/api/teacher/courses/${id}/modules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: moduleTitle })
    })

    if (res.ok) {
      setModuleTitle('')
      mutate()
      alert('Module added successfully!')
    } else {
      alert('Failed to add module')
    }
  }

  return (
    
      <div className="max-w-4xl mx-auto py-12 px-4">
        {/* Course Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
          <p className="text-gray-600 mb-4">{course.description}</p>
          
          <div className="flex gap-4 items-center">
            <button
              onClick={publishCourse}
              className={`px-6 py-2 rounded font-semibold transition-colors ${
                course.published
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {course.published ? '📤 Unpublish Course' : '✅ Publish Course'}
            </button>
            
            {course.published && (
              <span className="text-green-700 font-semibold flex items-center gap-2">
                ✓ Published
              </span>
            )}
          </div>
        </div>

        {/* Add Module Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-md p-6 mb-8 border border-blue-100">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">📚 Add New Module</h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter module title (e.g., 'Introduction to React')"
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && addModule()}
            />
            <button
              onClick={addModule}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors shadow-md"
            >
              Add Module
            </button>
          </div>
        </div>

        {/* Modules List */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">📋 Course Modules</h2>
          
          {(!course.modules || course.modules.length === 0) && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-gray-500 text-lg">No modules yet. Add your first module above!</p>
            </div>
          )}
          
          <div className="space-y-4">
            {course.modules?.map((module, index) => (
              <div key={module.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                          Module {index + 1}
                        </span>
                        <h3 className="text-xl font-bold text-gray-800">{module.title}</h3>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">
                        📝 {module.lessons?.length || 0} lessons
                      </p>
                      <Link
                        href={`/teacher/modules/${module.id}`}
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                      >
                        Manage Lessons 
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    
  )
}