export default function TopBar() {
  return (
    <header
      className="fixed top-0 left-0 right-0 max-w-md mx-auto z-50 flex items-center justify-center px-6"
      style={{
        height: 64,
        backgroundColor: 'rgba(248,250,249,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid #e6e9e8',
      }}
    >
      <h1 className="font-headline font-extrabold text-xl" style={{ color: '#49624d' }}>
        Maganda
      </h1>
    </header>
  )
}