import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PersonasList from './pages/personas/PersonasList'
import PersonaDetail from './pages/personas/PersonaDetail'
import AutomotoresList from './pages/automotores/AutomotoresList'
import AutomotorDetail from './pages/automotores/AutomotorDetail'
import InfraccionesList from './pages/infracciones/InfraccionesList'
import InfraccionDetail from './pages/infracciones/InfraccionDetail'
import ComparendosList from './pages/comparendos/ComparendosList'
import ComparendoDetail from './pages/comparendos/ComparendoDetail'
import NuevoComparendo from './pages/comparendos/NuevoComparendo'
import EditarComparendo from './pages/comparendos/EditarComparendo'
import UsuariosList from './pages/usuarios/UsuariosList'
import UsuarioDetail from './pages/usuarios/UsuarioDetail'
import Perfil from './pages/usuarios/Profile'
import Reportes from './pages/reportes/Reportes'

type Theme = 'light' | 'dark'

function App() {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    const initialTheme =
      savedTheme ??
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

    setTheme(initialTheme)
    document.documentElement.classList.toggle('dark', initialTheme === 'dark')
  }, [])

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    localStorage.setItem('theme', nextTheme)
    document.documentElement.classList.toggle('dark', nextTheme === 'dark')
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute roles={['admin', 'agente', 'supervisor', 'ciudadano']}>
              <Layout theme={theme} onToggleTheme={toggleTheme}>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/personas"
          element={
            <ProtectedRoute roles={['admin', 'agente', 'supervisor', 'ciudadano']}>
              <Layout theme={theme} onToggleTheme={toggleTheme}>
                <PersonasList />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/personas/:id"
          element={
            <ProtectedRoute roles={['admin', 'agente', 'supervisor', 'ciudadano']}>
              <Layout theme={theme} onToggleTheme={toggleTheme}>
                <PersonaDetail />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Automotores (antes /vehiculos) */}
        <Route
          path="/automotores"
          element={
            <ProtectedRoute roles={['admin', 'agente', 'supervisor', 'ciudadano']}>
              <Layout theme={theme} onToggleTheme={toggleTheme}>
                <AutomotoresList />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/automotores/:id"
          element={
            <ProtectedRoute roles={['admin', 'agente', 'supervisor', 'ciudadano']}>
              <Layout theme={theme} onToggleTheme={toggleTheme}>
                <AutomotorDetail />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Redirección legacy /vehiculos -> /automotores */}
        <Route path="/vehiculos" element={<Navigate to="/automotores" replace />} />
        <Route path="/vehiculos/:id" element={<Navigate to="/automotores" replace />} />

        <Route
          path="/infracciones"
          element={
            <ProtectedRoute roles={['admin', 'agente', 'supervisor']}>
              <Layout theme={theme} onToggleTheme={toggleTheme}>
                <InfraccionesList />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/infracciones/:id"
          element={
            <ProtectedRoute roles={['admin', 'agente', 'supervisor']}>
              <Layout theme={theme} onToggleTheme={toggleTheme}>
                <InfraccionDetail />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/comparendos"
          element={
            <ProtectedRoute roles={['admin', 'agente', 'supervisor', 'ciudadano']}>
              <Layout theme={theme} onToggleTheme={toggleTheme}>
                <ComparendosList />
              </Layout>
            </ProtectedRoute>
          }
        />

         <Route
          path="/comparendos/nuevo"
          element={
            <ProtectedRoute roles={['admin', 'agente']}>
              <Layout theme={theme} onToggleTheme={toggleTheme}>
                <NuevoComparendo />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/comparendos/editar/:id"
          element={
            <ProtectedRoute roles={['admin', 'agente']}>
              <Layout theme={theme} onToggleTheme={toggleTheme}>
                <EditarComparendo />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/comparendos/:id"
          element={
            <ProtectedRoute roles={['admin', 'agente', 'supervisor', 'ciudadano']}>
              <Layout theme={theme} onToggleTheme={toggleTheme}>
                <ComparendoDetail />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Usuarios – solo admin */}
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute roles={['admin', 'agente', 'supervisor', 'ciudadano']}>
              <Layout theme={theme} onToggleTheme={toggleTheme}>
                <UsuariosList />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/usuarios/:id"
          element={
            <ProtectedRoute roles={['admin', 'agente', 'supervisor', 'ciudadano']}>
              <Layout theme={theme} onToggleTheme={toggleTheme}>
                <UsuarioDetail />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/perfil"
          element={
            <ProtectedRoute roles={['admin', 'agente', 'supervisor', 'ciudadano']}>
              <Layout theme={theme} onToggleTheme={toggleTheme}>
                <Perfil />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Reportes – solo admin y supervisor */}
        <Route
          path="/reportes"
          element={
            <ProtectedRoute roles={['admin', 'supervisor']}>
              <Layout theme={theme} onToggleTheme={toggleTheme}>
                <Reportes />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App