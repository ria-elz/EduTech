import { useRouter } from 'next/router'
import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

const fetcher = (url) => fetch(url).then(r => r.json())

export default function CoursePage() {
  const router = useRouter()
  const { slug } = router.query
  const { data: session } = useSession()
  const { data } = useSWR(() => slug ? `/api/courses/slug/${slug}` : null, fetcher)

  if (!data) return <div className="p-8">Loading...</div>

  const onEnroll = async () => {
    const res = await fetch('/api/enroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId: data.id })
    })
    if (res.ok) {
      alert('Enrolled successfully')
    } else {
      const err = await res.json()
      alert(err.message || 'Enrollment failed')
    }
  }

  return (
    
      <div className="max-w-4xl mx-auto py-12 px-4">
        {/* Course Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold mb-3">{data.title}</h1>
          <p className="text-lg text-blue-100 mb-4">{data.description}</p>
          <p className="text-sm text-blue-200">
            👤 Instructor: {data.author?.name}
          </p>
        </div>

        {/* Enrollment Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {session ? (
            <button
              onClick={onEnroll}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold shadow-md transition-colors w-full md:w-auto"
            >
              ✓ Enroll in This Course
            </button>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">Please sign in to enroll in this course</p>
              <Link
                href="/signin"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Course Content */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">📚 Course Content</h2>
          
          {(!data.modules || data.modules.length === 0) && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No modules available yet</p>
            </div>
          )}

          <div className="space-y-4">
            {data.modules?.map((module, moduleIndex) => (
              <div key={module.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                {/* Module Header */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                      {moduleIndex + 1}
                    </span>
                    <h3 className="text-xl font-bold text-gray-800">{module.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {module.lessons?.length || 0} lessons
                  </p>
                </div>

                {/* Lessons List */}
                <div className="p-6">
                  {(!module.lessons || module.lessons.length === 0) ? (
                    <p className="text-gray-500 text-sm">No lessons in this module yet</p>
                  ) : (
                    <ul className="space-y-3">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <li key={lesson.id} className="flex items-start gap-3 group">
                          <span className="text-gray-400 font-semibold min-w-[24px]">
                            {lessonIndex + 1}.
                          </span>
                          <div className="flex-1">
                            <Link 
                              href={`/lesson/${lesson.id}`} 
                              className="text-blue-600 hover:text-blue-800 font-medium group-hover:underline"
                            >
                              {lesson.title}
                            </Link>
                            
                            {/* Media Indicators */}
                            <div className="flex gap-2 mt-1">
                              {lesson.videoUrl && (
                                <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                  🎥 Video
                                </span>
                              )}
                              {lesson.pdfUrl && (
                                <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  📄 PDF
                                </span>
                              )}
                              {lesson.audioUrl && (
                                <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                  🎵 Audio
                                </span>
                              )}
                              {lesson.content && (
                                <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                  📝 Notes
                                </span>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    
  )
}