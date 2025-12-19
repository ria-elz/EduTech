import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import useSWR from 'swr'
import Link from 'next/link'

const fetcher = (url) => fetch(url).then(r => r.json())

export default function TeacherDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const { data: courses, mutate } = useSWR(
    session?.user?.role === 'TEACHER' ? '/api/teacher/courses' : null,
    fetcher
  )

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'TEACHER') {
      router.push('/login')
    }
  }, [session, status, router])

  if (!session) return null

  const deleteCourse = async (courseId, courseTitle) => {
    if (!confirm(`Are you sure you want to delete "${courseTitle}"? This will delete all modules, lessons, and uploaded files.`)) {
      return
    }

    const res = await fetch(`/api/teacher/courses/${courseId}`, {
      method: 'DELETE'
    })

    if (res.ok) {
      mutate()
      alert('Course deleted successfully')
    } else {
      const error = await res.json()
      alert('Failed to delete course: ' + (error.message || 'Unknown error'))
    }
  }

  return (
    
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Teacher Dashboard</h1>
          <Link
            href="/teacher/courses/new"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-colors"
          >
            + Create New Course
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Courses</p>
                <p className="text-3xl font-bold mt-2">{courses?.length || 0}</p>
              </div>
              <svg className="w-12 h-12 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Published</p>
                <p className="text-3xl font-bold mt-2">
                  {courses?.filter(c => c.published).length || 0}
                </p>
              </div>
              <svg className="w-12 h-12 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Modules</p>
                <p className="text-3xl font-bold mt-2">
                  {courses?.reduce((sum, c) => sum + (c.modules?.length || 0), 0) || 0}
                </p>
              </div>
              <svg className="w-12 h-12 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>

        {/* Courses List */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Courses</h2>

          {!courses && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading courses...</p>
            </div>
          )}

          {courses && courses.length === 0 && (
            <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No courses yet</h3>
              <p className="text-gray-500 mb-6">Create your first course to get started!</p>
              <Link
                href="/teacher/courses/new"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Create Your First Course
              </Link>
            </div>
          )}

          <div className="space-y-6">
            {courses?.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 overflow-hidden">
                {/* Course Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold">{course.title}</h3>
                        {course.published ? (
                          <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                            ✓ Published
                          </span>
                        ) : (
                          <span className="bg-yellow-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                            Draft
                          </span>
                        )}
                      </div>
                      <p className="text-blue-100 mb-2">{course.description}</p>
                      <p className="text-sm text-blue-200">
                        Created: {new Date(course.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Course Stats */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span className="font-semibold text-gray-700">
                        {course.modules?.length || 0} Modules
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="font-semibold text-gray-700">
                        {course.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0} Lessons
                      </span>
                    </div>
                  </div>
                </div>

                {/* Modules List */}
                {course.modules && course.modules.length > 0 && (
                  <div className="p-6">
                    <h4 className="font-bold text-gray-800 mb-4">Modules:</h4>
                    <div className="space-y-3">
                      {course.modules.map((module, idx) => (
                        <div key={module.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                                  Module {idx + 1}
                                </span>
                                <h5 className="font-semibold text-gray-800">{module.title}</h5>
                              </div>
                              
                              {/* Lessons in module */}
                              {module.lessons && module.lessons.length > 0 && (
                                <div className="ml-4 mt-2 space-y-1">
                                  {module.lessons.map((lesson, lessonIdx) => (
                                    <div key={lesson.id} className="text-sm text-gray-600 flex items-center gap-2">
                                      <span className="text-gray-400">•</span>
                                      <span>{lessonIdx + 1}. {lesson.title}</span>
                                      <div className="flex gap-1 ml-2">
                                        {lesson.videoUrl && (
                                          <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">🎥</span>
                                        )}
                                        {lesson.pdfUrl && (
                                          <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">📄</span>
                                        )}
                                        {lesson.audioUrl && (
                                          <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">🎵</span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <Link
                              href={`/teacher/modules/${module.id}`}
                              className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                            >
                              Edit →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="bg-gray-50 px-6 py-4 flex gap-3">
                  <Link
                    href={`/teacher/courses/${course.id}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Manage Course
                  </Link>
                  <Link
                    href={`/courses/${course.slug}`}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold transition-colors"
                    target="_blank"
                  >
                    Preview
                  </Link>
                  <button
                    onClick={() => deleteCourse(course.id, course.title)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    
  )
}