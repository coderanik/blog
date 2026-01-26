export function Footer() {
  return (
    <footer className="mt-16 py-8 border-t border-black bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center text-sm text-gray-500 font-sans">
          © {new Date().getFullYear()} Engineering Insights. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
