// src/components/NavBar.tsx
import Link from 'next/link';

export default function NavBar() {
  return (
    <nav className="bg-blue-700 text-white px-6 py-4 shadow">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-2xl tracking-tight hover:text-blue-200">Quiz Editor</Link>
          <Link href="/" className="hover:text-blue-200">Home</Link>
          <Link href="/add" className="hover:text-blue-200">Add Question</Link>
        </div>
      </div>
    </nav>
  );
}
