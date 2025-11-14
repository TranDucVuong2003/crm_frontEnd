import React from 'react'
import AppRouter from './Router/AppRouter'
import AuthDebugPanel from './Components/AuthDebugPanel'
import { AuthProvider } from './Context/AuthContext'

function App() {
  // Chỉ hiển thị AuthDebugPanel trong development
  // const isDevelopment = import.meta.env.MODE === 'development';
  
  return (
    <AuthProvider>
      <div>
        <AppRouter />
        {/* {isDevelopment && <AuthDebugPanel />} */}
      </div>
    </AuthProvider>
  )
}

export default App
