import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import useSWR from 'swr'

const fetcher = (url) => fetch(url).then(r => r.json())

export default function TeacherMarksPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { data: courses, error } = useSWR(session ? '/api/teacher/all-marks' : null, fetcher)
  const [selectedCourse, setSelectedCourse] = useState(null)

  if (!session || session.user.role !== 'TEACHER') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Access denied. Teachers only.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-700">Error loading marks</p>
          </div>
        </div>
      </div>
    )
  }

  if (!courses) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading marks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">📊 Student Marks</h1>

        {courses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No quiz submissions yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Course Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-4 sticky top-4">
                <h2 className="font-bold text-lg mb-4">Courses</h2>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCourse(null)}
                    className={`w-full text-left px-4 py-2 rounded transition-colors ${
                      selectedCourse === null
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    All Courses
                  </button>
                  {courses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => setSelectedCourse(course.id)}
                      className={`w-full text-left px-4 py-2 rounded transition-colors ${
                        selectedCourse === course.id
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="font-semibold">{course.title}</div>
                      <div className="text-xs opacity-75">
                        {course.submissions.length} submission(s)
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Marks Table */}
            <div className="lg:col-span-3">
              {courses
                .filter((c) => selectedCourse === null || c.id === selectedCourse)
                .map((course) => (
                  <div key={course.id} className="bg-white rounded-lg shadow mb-6">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
                      <h2 className="text-2xl font-bold">{course.title}</h2>
                      <p className="text-blue-100 mt-1">
                        {course.submissions.length} total submission(s)
                      </p>
                    </div>

                    {course.submissions.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        No submissions for this course yet
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                Student
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                Quiz
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                Score
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                Date
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {course.submissions.map((sub) => (
                              <tr key={sub.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                  <div className="font-medium text-gray-900">
                                    {sub.user.name || 'Anonymous'}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {sub.user.email}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-900">
                                    {sub.quiz.title}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center">
                                    <span
                                      className={`text-2xl font-bold ${
                                        sub.score >= 80
                                          ? 'text-green-600'
                                          : sub.score >= 60
                                          ? 'text-blue-600'
                                          : 'text-red-600'
                                      }`}
                                    >
                                      {sub.score}%
                                    </span>
                                    <span className="ml-2 text-xl">
                                      {sub.score >= 80 ? '🏆' : sub.score >= 60 ? '👍' : '📚'}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                  {new Date(sub.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Statistics */}
                    {course.submissions.length > 0 && (
                      <div className="bg-gray-50 p-6 rounded-b-lg border-t">
                        <h3 className="font-semibold mb-3">Statistics</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-white p-4 rounded shadow-sm">
                            <div className="text-2xl font-bold text-blue-600">
                              {Math.round(
                                course.submissions.reduce((sum, s) => sum + s.score, 0) /
                                  course.submissions.length
                              )}
                              %
                            </div>
                            <div className="text-sm text-gray-600">Average Score</div>
                          </div>
                          <div className="bg-white p-4 rounded shadow-sm">
                            <div className="text-2xl font-bold text-green-600">
                              {Math.max(...course.submissions.map((s) => s.score))}%
                            </div>
                            <div className="text-sm text-gray-600">Highest Score</div>
                          </div>
                          <div className="bg-white p-4 rounded shadow-sm">
                            <div className="text-2xl font-bold text-red-600">
                              {Math.min(...course.submissions.map((s) => s.score))}%
                            </div>
                            <div className="text-sm text-gray-600">Lowest Score</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}