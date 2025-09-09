import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Authorisation from "./pages/authorisation";
import Dashboard from "./pages/dashboard";
import EmailVerification from "./pages/emailVerification";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Authorisation />} />
        <Route path="/auth" element={<Authorisation />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
