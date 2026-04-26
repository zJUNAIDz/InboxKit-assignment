import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './App.css'
import Grid from './Grid'
import Nav from './Header'

const queryClient = new QueryClient()

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-shell">
        <div className="app-background" aria-hidden="true" />
        <div className="app-frame">
          <Nav />
          <main className="grid-stage">
            <Grid />
          </main>
        </div>
      </div>
    </QueryClientProvider>
  )
}

export default App
