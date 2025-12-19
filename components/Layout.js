// components/Layout.js
import Link from 'next/link'
import { useSession, signOut, signIn } from 'next-auth/react'

export default function Layout({ children }) {
  const { data: session, status } = useSession()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          {/* LOGO */}
          <Link href="/" className="font-bold text-lg text-blue-600">
            EduPortal
          </Link>

          {/* NAV */}
          <nav className="flex items-center">
            <Link
              href="/courses"
              className="mr-4 text-gray-700 hover:text-blue-600"
            >
              Courses
            </Link>

            {/* ADMIN LINKS */}
            {session?.user?.role === 'ADMIN' && (
              <>
                <Link
                  href="/admin"
                  className="mr-4 text-purple-600 hover:text-purple-800 font-medium"
                >
                  🔧 Admin Dashboard
                </Link>
                <Link
                  href="/admin/users"
                  className="mr-4 text-gray-700 hover:text-blue-600"
                >
                  Users
                </Link>
                <Link
                  href="/admin/analytics"
                  className="mr-4 text-gray-700 hover:text-blue-600"
                >
                  📊 Analytics
                </Link>
              </>
            )}

            {/* TEACHER LINKS */}
            {session?.user?.role === 'TEACHER' && (
              <>
                <Link
                  href="/teacher"
                  className="mr-4 text-gray-700 hover:text-blue-600 font-medium"
                >
                  Teacher Dashboard
                </Link>
                <Link
                  href="/teacher/courses/new"
                  className="mr-4 text-green-600 hover:text-green-800 font-medium"
                >
                  + New Course
                </Link>
                <Link
                  href="/teacher/marks"
                  className="mr-4 text-gray-700 hover:text-blue-600"
                >
                  📊 Marks
                </Link>
              </>
            )}

            {/* STUDENT LINKS */}
            {session && session.user.role === 'STUDENT' && (
              <>
                <Link
                  href="/my-marks"
                  className="mr-4 text-gray-700 hover:text-blue-600"
                >
                  📊 My Marks
                </Link>
                <Link
                  href="/my-progress"
                  className="mr-4 text-gray-700 hover:text-blue-600"
                >
                  📈 My Progress
                </Link>
              </>
            )}

            {/* AUTH SECTION */}
            {status === 'loading' ? null : session ? (
              <div className="flex items-center">
                <span className="mr-4 text-sm text-gray-600">
                  Hi, {session.user.name || session.user.email}
                  {session.user.role === 'ADMIN' && (
                    <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      Admin
                    </span>
                  )}
                </span>

                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-sm text-gray-700 border px-3 py-1 rounded hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <Link
  href="/signin"
  className="text-sm text-gray-700 mr-4 hover:text-blue-600"
>
  Sign in
</Link>

                <Link
                  href="/register"
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* PAGE CONTENT */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}