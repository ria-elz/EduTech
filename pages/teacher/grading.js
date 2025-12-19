import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import Link from 'next/link'

const fetcher = (url) => fetch(url).then(r => r.json())

export default function TeacherGradingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { data: submissions } = useSWR(
    session?.user?.role === 'TEACHER' ? '/api/teacher/grading/pending' : null,
    fetcher
  )

  if (!session || session.user.role !== 'TEACHER') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Access denied</p>
      </div>
    )
  }

  if (!submissions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">📝 Grading Queue</h1>
          <p className="text-gray-600">Review and grade student submissions</p>
        </div>

        {submissions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold mb-2">All Caught Up!</h2>
            <p className="text-gray-600">No submissions waiting to be graded.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Pending Submissions</h2>
                <span className="bg-white text-blue-600 px-4 py-2 rounded-full font-bold">
                  {submissions.length}
                </span>
              </div>
            </div>
            
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
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                          {sub.user.name ? sub.user.name[0].toUpperCase() : '?'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {sub.user.name || 'Anonymous'}
                          </div>
                          <div className="text-sm text-gray-500">{sub.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{sub.quiz.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {sub.quiz.lesson.module.course.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(sub.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/teacher/grading/${sub.id}`}
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition-colors"
                      >
                        Grade Now →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}