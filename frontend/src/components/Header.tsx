export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
      <div className="flex items-center gap-2">
        <span className="font-bold text-blue-600 text-lg">OWL</span>
        <span className="text-gray-500 text-sm">Fund Intelligence</span>
      </div>
      <div className="flex items-center gap-3">
        <button className="text-gray-400 hover:text-gray-600">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-semibold">
          JB
        </div>
      </div>
    </header>
  );
}
