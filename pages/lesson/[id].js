import { useRouter } from 'next/router'
import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

const fetcher = (url) => fetch(url).then(r => r.json())

export default function LessonPage() {
  const router = useRouter()
  const { id } = router.query
   const { data: session } = useSession() 
  const { data } = useSWR(() => id ? `/api/lessons/${id}` : null, fetcher)

  if (!data) {
    return (
      
        <div className="p-8">Loading...</div>
      
    )
  }

  return (
    
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline">Home</Link>
          <span className="mx-2">›</span>
          <span>{data.title}</span>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-8 mb-8">
          <h1 className="text-3xl font-bold">{data.title}</h1>
          <p className="mt-2">Module: {data.module?.title}</p>
        </div>

        {data.videoUrl && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Video Lesson</h2>
            <video controls className="w-full">
              <source src={data.videoUrl} />
            </video>
          </div>
        )}

        {data.content && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Lesson Notes</h2>
            <div className="text-gray-700 whitespace-pre-wrap">{data.content}</div>
          </div>
        )}

        {data.pdfUrl && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">PDF Document</h2>
            <a 
              href={data.pdfUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Download PDF
            </a>
            <div className="mt-4 border rounded">
              <iframe src={data.pdfUrl} className="w-full h-96" title="PDF"></iframe>
            </div>
          </div>
        )}

        {data.audioUrl && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Audio Lesson</h2>
            <audio controls className="w-full">
              <source src={data.audioUrl} />
            </audio>
          </div>
        )}

       {/* Quiz Section */}
{data.quiz && (
  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-md p-6 border border-green-200">
    <h2 className="text-xl font-bold mb-3">📋 Quiz Available</h2>
    <p className="text-gray-700 mb-2">
      <strong>{data.quiz.title}</strong>
    </p>
    {data.quiz.duration && (
      <p className="text-sm text-gray-600 mb-4">
        ⏱️ Duration: {data.quiz.duration} minutes
      </p>
    )}
    <Link
      href={`/quiz/${data.quiz.id}`}
      className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
    >
      Take Quiz →
    </Link>
  </div>
)}
{/* Mark as Complete Button */}
{session && (
  <div className="bg-white rounded-lg shadow p-6">
    <button
      onClick={async () => {
        const res = await fetch('/api/progress/mark-complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lessonId: data.id })
        })
        if (res.ok) {
          const result = await res.json()
          alert(result.completed ? 'Lesson marked as complete!' : 'Lesson marked as incomplete')
          window.location.reload()
        }
      }}
      className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2"
    >
      <span>✓</span>
      <span>Mark as Complete</span>
    </button>
  </div>
)}

      </div>
    
  )
}