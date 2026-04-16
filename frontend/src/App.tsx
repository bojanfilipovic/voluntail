import { ShelterList } from './components/ShelterList'
import './App.css'

function App() {
  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Voluntail</h1>
        <p className="app-tagline">Discovery (dev shell)</p>
      </header>
      <main className="app-main">
        <div className="split">
          <section className="split-pane split-pane--map" aria-label="Map placeholder">
            <p className="split-placeholder">Map (Mapbox) goes here</p>
          </section>
          <section className="split-pane split-pane--directory" aria-label="Directory">
            <ShelterList />
          </section>
        </div>
      </main>
    </div>
  )
}

export default App
