import logo from './logo.svg';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import HomePage from './homePage';
import PlannerPage from './PlannerPage';  
import AuthPage from './AuthPage';

function App() {
  return (
     <Router>
      <Routes>
        <Route path= "/" element={<AuthPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/planner" element={<PlannerPage />} />
      </Routes>
    </Router>
  );
}

export default App;
