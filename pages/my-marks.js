import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import Link from 'next/link'

const fetcher = (url) => fetch(url).then(r => r.json())

export default function MyMarksPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { data: submissions, error } = useSWR(session ? '/api/my-submissions' : null, fetcher)

  console.log('Session:', session)
  console.log('Submissions:', submissions)
  console.log('Error:', error)

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl mb-4">Please sign in to view your marks</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-6 py-3 rounded"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-700">Error loading marks: {error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!submissions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your marks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">📊 My Marks</h1>

        {submissions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-600 text-lg mb-4">You haven't taken any quizzes yet</p>
            <Link href="/courses" className="text-blue-600 hover:underline font-semibold">
              Browse Courses →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub) => (
  <div key={sub.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <h3 className="font-bold text-xl mb-1">{sub.quiz.title}</h3>
        <p className="text-sm text-gray-500 mb-2">
          📅 Submitted: {new Date(sub.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
        {sub.quiz.lesson && (
          <p className="text-sm text-gray-600">
            Lesson: {sub.quiz.lesson.title}
          </p>
        )}
      </div>
      <div className="text-right ml-4">
        {sub.status === 'PENDING' ? (
          <div>
            <div className="text-2xl mb-1">⏳</div>
            <div className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded">
              Pending Review
            </div>
          </div>
        ) : (
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-1">
              {sub.score}%
            </div>
            <div className="text-sm text-gray-500">Score</div>
            {sub.score >= 80 && <div className="text-2xl mt-2">🏆</div>}
            {sub.score >= 60 && sub.score < 80 && <div className="text-2xl mt-2">👍</div>}
            {sub.score < 60 && <div className="text-2xl mt-2">📚</div>}
          </div>
        )}
      </div>
    </div>
    
    <div className="mt-4 pt-4 border-t">
      <Link
        href={`/submission/${sub.id}`}
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold"
      >
        View Details →
      </Link>
    </div>
  </div>
))}
          </div>
        )}
      </div>
    </div>
  )
}