import TopBar from '../components/TopBar'
import ProfileNudge from '../components/home/ProfileNudge'

export default function HomeScreen() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="pt-24 pb-32 px-6">
        <ProfileNudge />
      </main>
    </div>
  )
}
