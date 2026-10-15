import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import Cases from './pages/Cases.jsx'
import Directory from './pages/Directory.jsx'
import NewCase from './pages/NewCase.jsx'
import NewCasePayment from './pages/NewCasePayment.jsx'
import NewCaseReview from './pages/NewCaseReview.jsx'
import CustomerDetail from './pages/CustomerDetail.jsx'
import RequireAuth from './components/auth/RequireAuth.jsx'

function App() {
  return (
    <Routes>
      {/* Every route requires a session verified by the backend */}
      <Route element={<RequireAuth />}>
        <Route path="/spoc/dashboard" element={<Dashboard />} />
        <Route path="/spoc/cases" element={<Cases />} />
        <Route path="/spoc/cases/new" element={<NewCase />} />
        <Route path="/spoc/cases/new/payment" element={<NewCasePayment />} />
        <Route path="/spoc/cases/new/review" element={<NewCaseReview />} />
        <Route path="/spoc/directory" element={<Directory />} />
        <Route path="/spoc/directory/:customerId" element={<CustomerDetail />} />
        <Route path="*" element={<Navigate to="/spoc/dashboard" replace />} />
      </Route>
    </Routes>
  )
}

export default App
