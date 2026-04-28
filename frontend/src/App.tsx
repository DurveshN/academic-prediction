import { Navigate, Route, Routes } from 'react-router-dom'

type PlaceholderPageProps = {
  title: string
  description: string
}

function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-50">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/40">
        <span className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-400">
          Academic Performance Prediction System
        </span>
        <h1 className="text-3xl font-semibold text-white">{title}</h1>
        <p className="text-base leading-7 text-slate-300">{description}</p>
      </div>
    </main>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/login"
        element={
          <PlaceholderPage
            title="Login"
            description="Placeholder login route for the upcoming cookie-based authentication flow."
          />
        }
      />
      <Route
        path="/dashboard"
        element={
          <PlaceholderPage
            title="Dashboard"
            description="Placeholder dashboard route for cohort-level academic performance insights."
          />
        }
      />
      <Route
        path="/models"
        element={
          <PlaceholderPage
            title="Models"
            description="Placeholder models route for model monitoring and prediction summaries."
          />
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
