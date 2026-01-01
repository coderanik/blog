import { Github, Twitter, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="mt-20 py-12">
      <div className="container mx-auto px-4">
        <div className="bg-black/20 backdrop-blur-xl backdrop-saturate-150 rounded-2xl border border-white/10 shadow-lg shadow-black/20 p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">anikdas</h3>
              <p className="text-sm text-zinc-400">Exploring the intersection of code, design, and innovation.</p>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">Social</h4>
              <div className="flex space-x-4">
                <a
                  href="https://twitter.com/anikdas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <Twitter className="size-5" />
                  <span className="sr-only">Twitter</span>
                </a>
                <a
                  href="https://github.com/anikdas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <Github className="size-5" />
                  <span className="sr-only">GitHub</span>
                </a>
                <a
                  href="https://linkedin.com/in/anikdas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <Linkedin className="size-5" />
                  <span className="sr-only">LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-white/10 pt-8 text-center text-xs text-zinc-500">
            © {new Date().getFullYear()} anikdas. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
