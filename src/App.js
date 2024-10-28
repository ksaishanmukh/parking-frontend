import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ParkingBookingForm from './components/ParkingBookingForm';
import AdminDashboard from './components/AdminDashboard';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<ParkingBookingForm />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="*" element={<h1>Page Not Found</h1>} />
            </Routes>
        </Router>
    );
}

export default App;
