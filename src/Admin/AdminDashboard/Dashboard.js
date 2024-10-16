import React, { useState, useEffect } from 'react';
import AdminDashboard from '../Dashboard/AdminDashboard';
import { db } from '../../FirebaseConfig/Firebaseconfig'; // Import your firebase configuration
import { collection, getDocs, query, where } from 'firebase/firestore'; // Firestore methods
import './Dashboard.css';

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [holidayCount, setHolidayCount] = useState(0);

  useEffect(() => {
    // Fetch users count
    const fetchUsersCount = async () => {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      setTotalUsers(usersSnapshot.size);
    };

    // Fetch attendance data (present and absent)
    const fetchAttendanceCount = async () => {
      try {
        // Query for Present status
        const presentSnapshot = await getDocs(
          query(collection(db, 'attendance'), where('statuses', '==', 'Present'))
        );
        setPresentCount(presentSnapshot.size); // Set present count
    
        // Query for absent status
        const absentSnapshot = await getDocs(
          query(collection(db, 'attendance'), where('statuses', '==', 'Absent'))
        );
        setAbsentCount(absentSnapshot.size); // Set absent count
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };
    
    // Fetch holidays count
    const fetchHolidaysCount = async () => {
      const holidaysSnapshot = await getDocs(collection(db, 'holidays'));
      setHolidayCount(holidaysSnapshot.size);
    };

    // Call all fetch functions
    fetchUsersCount();
    fetchAttendanceCount();
    fetchHolidaysCount();
  }, []);

  return (
    <div>
      <AdminDashboard onToggleSidebar={setCollapsed} />
      <div className={`attendance-content ${collapsed ? 'collapsed' : ''}`}>
        <h1 className='attendance-heading'>Admin Dashboard</h1>

        <div className="container mt-4">
          <div className="row">
            {/* Card for total users */}
            <div className="col-md-4">
              <div className="card text-white bg-primary mb-3">
                <div className="card-header">Total Users</div>
                <div className="card-body">
                  <h5 className="card-title">{totalUsers}</h5>
                  <p className="card-text">Total registered users in the system.</p>
                </div>
              </div>
            </div>

            {/* Card for present count */}
            <div className="col-md-4">
              <div className="card text-white bg-success mb-3">
                <div className="card-header">Present Today</div>
                <div className="card-body">
                  <h5 className="card-title">{presentCount}</h5>
                  <p className="card-text">Total present users for today.</p>
                </div>
              </div>
            </div>

            {/* Card for absent count */}
            <div className="col-md-4">
              <div className="card text-white bg-danger mb-3">
                <div className="card-header">Absent Today</div>
                <div className="card-body">
                  <h5 className="card-title">{absentCount}</h5>
                  <p className="card-text">Total absent users for today.</p>
                </div>
              </div>
            </div>

            {/* Card for holidays count */}
            <div className="col-md-4">
              <div className="card text-white bg-warning mb-3">
                <div className="card-header">Total Holidays</div>
                <div className="card-body">
                  <h5 className="card-title">{holidayCount}</h5>
                  <p className="card-text">Total holidays in the system.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
