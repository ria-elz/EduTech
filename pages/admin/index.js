import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import Link from 'next/link'

const fetcher = (url) => fetch(url).then(r => r.json())

export default function AdminDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const { data: stats } = useSWR(session?.user?.role === 'ADMIN' ? '/api/admin/stats' : null, fetcher)

  if (!session || session.user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Admin privileges required</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your learning platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl">👥</div>
              <div className="text-right">
                <div className="text-4xl font-bold">{stats.totalUsers}</div>
                <div className="text-blue-100 text-sm">Total Users</div>
              </div>
            </div>
          </div>

          {/* Total Teachers */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl">👨‍🏫</div>
              <div className="text-right">
                <div className="text-4xl font-bold">{stats.totalTeachers}</div>
                <div className="text-green-100 text-sm">Teachers</div>
              </div>
            </div>
          </div>

          {/* Total Students */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl">🎓</div>
              <div className="text-right">
                <div className="text-4xl font-bold">{stats.totalStudents}</div>
                <div className="text-purple-100 text-sm">Students</div>
              </div>
            </div>
          </div>

          {/* Total Courses */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl">📚</div>
              <div className="text-right">
                <div className="text-4xl font-bold">{stats.totalCourses}</div>
                <div className="text-orange-100 text-sm">Courses</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/users" className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-3">👥</div>
            <h3 className="text-xl font-bold mb-2">Manage Users</h3>
            <p className="text-gray-600 text-sm">View, edit, and manage all users</p>
          </Link>

          <Link href="/admin/analytics" className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-xl font-bold mb-2">Analytics</h3>
            <p className="text-gray-600 text-sm">View platform statistics and insights</p>
          </Link>

          <Link href="/courses" className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-3">📚</div>
            <h3 className="text-xl font-bold mb-2">View Courses</h3>
            <p className="text-gray-600 text-sm">Browse all available courses</p>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
          
          <div className="space-y-4">
            {stats.recentSubmissions && stats.recentSubmissions.length > 0 ? (
              stats.recentSubmissions.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                      {sub.user.name ? sub.user.name[0].toUpperCase() : '?'}
                    </div>
                    <div>
                      <p className="font-semibold">{sub.user.name || sub.user.email}</p>
                      <p className="text-sm text-gray-600">Completed quiz: {sub.quiz.title}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{sub.score}%</div>
                    <div className="text-xs text-gray-500">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}