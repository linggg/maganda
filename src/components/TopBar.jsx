export default function TopBar() {
  return (
    <header className="fixed top-0 left-0 right-0 max-w-md mx-auto flex justify-between items-center px-6 py-4 bg-background/80 backdrop-blur-xl z-50">
      <button className="hover:bg-surface-container transition-colors p-2 rounded-full flex items-center justify-center">
        <span className="material-symbols-outlined text-primary">search</span>
      </button>
      <h1 className="font-headline text-primary text-xl tracking-tight font-bold">Lingda</h1>
      <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
        <span className="material-symbols-outlined text-primary text-sm">person</span>
      </div>
    </header>
  )
}