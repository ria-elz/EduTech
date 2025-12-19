import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import Link from 'next/link'

const fetcher = (url) => fetch(url).then(r => r.json())

export default function MyProgressPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { data: courses, error } = useSWR(session ? '/api/progress/my-progress' : null, fetcher)
  const [generatingCert, setGeneratingCert] = useState({})

  const generateCertificate = async (courseId) => {
    setGeneratingCert({...generatingCert, [courseId]: true})
    
    try {
      const res = await fetch('/api/student/generate-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        alert('Certificate generated successfully!')
        router.push('/my-certificates')
      } else {
        alert(data.message || 'Failed to generate certificate')
      }
    } catch (error) {
      alert('Error generating certificate')
    } finally {
      setGeneratingCert({...generatingCert, [courseId]: false})
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please sign in to view your progress</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-700">Error loading progress</p>
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
          <p>Loading your progress...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Learning Progress</h1>

        {courses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-600 text-lg mb-4">You are not enrolled in any courses yet</p>
            <Link href="/courses" className="text-blue-600 hover:underline font-semibold">
              Browse Courses →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {courses.map(course => (
              <div key={course.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
                  <h2 className="text-2xl font-bold mb-2">{course.title}</h2>
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      {course.completedLessons} / {course.totalLessons} lessons completed
                    </div>
                    <div className="flex-1 bg-white bg-opacity-20 rounded-full h-3">
                      <div
                        className="bg-white rounded-full h-3 transition-all duration-500"
                        style={{ width: course.progressPercent + '%' }}
                      />
                    </div>
                    <div className="text-2xl font-bold">{course.progressPercent}%</div>
                  </div>
                  
                  {course.progressPercent === 100 && (
                    <div className="mt-4 pt-4 border-t border-white border-opacity-30">
                      <button
                        onClick={() => generateCertificate(course.id)}
                        disabled={generatingCert[course.id]}
                        className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold disabled:bg-gray-200 disabled:text-gray-500"
                      >
                        {generatingCert[course.id] ? 'Generating...' : '🏆 Generate Certificate'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {course.modules.map((module, moduleIndex) => (
                    <div key={module.id} className="mb-6 last:mb-0">
                      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          Module {moduleIndex + 1}
                        </span>
                        {module.title}
                      </h3>

                      <div className="space-y-2 ml-4">
                        {module.lessons.map((lesson, lessonIndex) => {
                          const isCompleted = lesson.progress.length > 0 && lesson.progress[0].completed

                          return (
                            <div key={lesson.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                              <div className="flex-shrink-0">
                                {isCompleted ? (
                                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white">
                                    ✓
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
                                )}
                              </div>
                              <div className="flex-1">
                                <Link href={'/lesson/' + lesson.id} className="text-blue-600 hover:underline font-medium">
                                  {lessonIndex + 1}. {lesson.title}
                                </Link>
                              </div>
                              <div className="flex gap-1">
                                {lesson.videoUrl && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">🎥</span>}
                                {lesson.pdfUrl && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">📄</span>}
                                {lesson.audioUrl && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">🎵</span>}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}