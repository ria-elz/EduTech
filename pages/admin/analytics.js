import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import useSWR from 'swr'

const fetcher = (url) => fetch(url).then(r => r.json())

export default function AdminAnalyticsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { data: analytics } = useSWR(
    session?.user?.role === 'ADMIN' ? '/api/admin/analytics' : null,
    fetcher
  )

  if (!session || session.user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Access Denied</p>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Platform Analytics</h1>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm mb-2">Total Enrollments</div>
            <div className="text-3xl font-bold text-blue-600">{analytics.totalEnrollments}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm mb-2">Total Quizzes</div>
            <div className="text-3xl font-bold text-green-600">{analytics.totalQuizzes}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm mb-2">Quiz Submissions</div>
            <div className="text-3xl font-bold text-purple-600">{analytics.totalSubmissions}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm mb-2">Average Score</div>
            <div className="text-3xl font-bold text-orange-600">
              {analytics.averageScore}%
            </div>
          </div>
        </div>

        {/* Top Courses */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Most Popular Courses</h2>
          <div className="space-y-4">
            {analytics.topCourses.map((course, index) => (
              <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                  <div>
                    <div className="font-semibold">{course.title}</div>
                    <div className="text-sm text-gray-600">
                      by {course.author.name || course.author.email}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{course._count.enrollments}</div>
                  <div className="text-xs text-gray-500">enrollments</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Students */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">Top Performing Students</h2>
          <div className="space-y-4">
            {analytics.topStudents.map((student, index) => (
              <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                    {student.name ? student.name[0].toUpperCase() : '?'}
                  </div>
                  <div>
                    <div className="font-semibold">{student.name || student.email}</div>
                    <div className="text-sm text-gray-600">{student._count.submissions} quizzes completed</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{student.averageScore}%</div>
                  <div className="text-xs text-gray-500">avg score</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}