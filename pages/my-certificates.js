import { useSession } from 'next-auth/react'
import useSWR from 'swr'

const fetcher = (url) => fetch(url).then(r => r.json())

export default function MyCertificatesPage() {
  const { data: session } = useSession()
  const { data: certificates } = useSWR(session ? '/api/student/certificates' : null, fetcher)

  if (!session) return <div className="p-8">Please sign in</div>
  if (!certificates) return <div className="p-8">Loading...</div>

  if (certificates.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">My Certificates</h1>
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📜</div>
            <h2 className="text-2xl font-bold mb-2">No Certificates Yet</h2>
            <p className="text-gray-600">Complete courses to earn certificates!</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Certificates</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map(cert => {
            const url = '/api/certificate/' + cert.id + '/download'
            const date = new Date(cert.completionDate).toLocaleDateString()
            
            return (
              <div key={cert.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                  <div className="text-4xl mb-3">🏆</div>
                  <h3 className="text-xl font-bold">{cert.courseName}</h3>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Student</p>
                    <p className="font-semibold">{cert.studentName}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Completed</p>
                    <p className="font-semibold">{date}</p>
                  </div>
                  <div className="mb-6">
                    <p className="text-sm text-gray-500">Certificate No</p>
                    <p className="text-sm font-mono">{cert.certificateNo}</p>
                  </div>
                  <div className="flex gap-3">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center px-4 py-2 rounded font-semibold">
                      Download
                    </a>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="flex-1 bg-green-600 hover:bg-green-700 text-white text-center px-4 py-2 rounded font-semibold">
                      View
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}