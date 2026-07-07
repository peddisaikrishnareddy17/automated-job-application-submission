import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-black text-white font-outfit">
      <nav className="flex items-center justify-between px-8 py-6 backdrop-blur-md bg-white/5 sticky top-0 z-50">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          JobFlow AI
        </div>
        <div className="space-x-4">
          <Link href="/login" className="px-6 py-2 rounded-lg hover:bg-white/10 transition-all">Login</Link>
          <Link href="/register" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20">Get Started</Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto py-20">
        <h1 className="text-6xl md:text-8xl font-extrabold mb-8 leading-tight">
          Automate Your <br />
          <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Job Hunt</span>
        </h1>
        <p className="text-xl text-gray-400 mb-12 max-w-2xl leading-relaxed">
          Stop wasting hours filling out identical forms. JobFlow AI finds jobs, matching your skills, and applies automatically using Selenium power.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-16">
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all hover:-translate-y-2 group">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6 text-blue-400 text-2xl group-hover:scale-110 transition-transform">📄</div>
            <h3 className="text-xl font-bold mb-4">Resume Upload</h3>
            <p className="text-gray-400">One-click resume parsing and automated field matching.</p>
          </div>
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all hover:-translate-y-2 group">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-6 text-purple-400 text-2xl group-hover:scale-110 transition-transform">🔍</div>
            <h3 className="text-xl font-bold mb-4">Job Matching</h3>
            <p className="text-gray-400">Advanced scraping across LinkedIn, Naukri, and Indeed.</p>
          </div>
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-pink-500/50 transition-all hover:-translate-y-2 group">
            <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-6 text-pink-400 text-2xl group-hover:scale-110 transition-transform">🤖</div>
            <h3 className="text-xl font-bold mb-4">Auto-Apply</h3>
            <p className="text-gray-400">Hands-free application status tracking in real-time.</p>
          </div>
        </div>

        <Link href="/register" className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full text-xl font-bold transition-all transform hover:scale-105 shadow-2xl shadow-blue-500/40">
          Start for Free
        </Link>
      </main>

      <footer className="py-10 border-t border-white/10 text-center text-gray-500">
        &copy; 2024 JobFlow AI. Ship faster, get hired sooner.
      </footer>
    </div>
  );
}
