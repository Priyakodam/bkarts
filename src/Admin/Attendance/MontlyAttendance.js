import React, { useState, useEffect } from 'react';
import { db } from '../../FirebaseConfig/Firebaseconfig'; // Adjust the import path
import { collection, getDocs, query, where } from 'firebase/firestore';
import AdminDashboard from '../Dashboard/AdminDashboard';
import './MonthlyAttendance.css';
import { ThreeDots } from 'react-loader-spinner';

const MonthlyAttendance = () => {
    // Utility functions
    const getFormattedMonth = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    };

    const getMonthDates = (year, month) => {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date(); // Current date
    
        return Array.from({ length: daysInMonth }, (_, i) => {
            const date = new Date(year, month, i + 1);
            return date;
        });
    };
    

    const formatDateForKey = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const getAttendanceStatus = (userAttendance, dateKey, date) => {
        const today = new Date();
        
        // If the date is in the future, return an empty string
        
        if (date > today) {
            return ''; // Future days will be left blank
        }
    
        const dayAttendance = userAttendance[dateKey];
        if (dayAttendance && dayAttendance.statuses === 'Present') {
            return 'P'; // 'P' for Present
        } else if (date.getDay() === 0) {
            return 'H'; // 'H' for Holiday (Sunday)
        } else {
            return 'A'; // 'A' for Absent
        }
    };
    

    // Component state
    const [collapsed, setCollapsed] = useState(false);
    const [users, setUsers] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedRole, setSelectedRole] = useState('All'); // State to hold the selected role
    const [selectedMonth, setSelectedMonth] = useState(getFormattedMonth(new Date())); // State to hold the selected month
    const [loading, setLoading] = useState(true); 

    // Fetch users data
    const fetchUsers = async () => {
        try {
            const q = query(collection(db, 'users'), where('status', '==', 'Verified'));
            const querySnapshot = await getDocs(q);
            const userData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            userData.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
            setUsers(userData);
        } catch (error) {
            console.error("Error fetching verified users data: ", error);
        }
    };

    // Fetch attendance data
    const fetchAttendance = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'attendance'));
            const attendance = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAttendanceData(attendance);
        } catch (error) {
            console.error("Error fetching attendance data: ", error);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchAttendance();
        setLoading(false);
    }, []);

    const processMonthlyAttendanceData = () => {
        const year = currentDate.getFullYear();
        const month = parseInt(selectedMonth.split('-')[1], 10) - 1; // Convert to 0-based month
        const monthDates = getMonthDates(year, month);
        const dateKeys = monthDates.map(formatDateForKey);
    
        const filteredUsers = selectedRole === 'All' ? users : users.filter(user => user.role === selectedRole);
    
        // This flag will check if there's any attendance data for the selected month
        let isAttendanceDataAvailable = false;
    
        const processedData = filteredUsers.map(user => {
            const userAttendance = attendanceData.find(entry => entry.id === user.id) || {};
            let totalPresent = 0;
            const dailyStatuses = dateKeys.map((dateKey, index) => {
                const status = getAttendanceStatus(userAttendance, dateKey, monthDates[index]);
                if (status === 'P') totalPresent++; // Count only 'P' as Present
                // If any attendance data is found, set the flag to true
                if (status !== 'A' && status !== 'H') {
                    isAttendanceDataAvailable = true;
                }
                return status;
            });
    
            return {
                ...user,
                dailyStatuses,
                totalPresent
            };
        });
    
        // If no attendance data is available for the selected month, return an empty array
        if (!isAttendanceDataAvailable) {
            return []; // This triggers the "No data found" message
        }
    
        return processedData;
    };
    

    const monthlyData = processMonthlyAttendanceData();

    // Get current year and month for the max date attribute
    const currentYear = currentDate.getFullYear();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    const maxMonth = `${currentYear}-${currentMonth}`;

    if (loading) {
        return (
            <div className="loader-container">
                <ThreeDots 
                    height="80" 
                    width="80" 
                    radius="9"
                    color="#00BFFF"
                    ariaLabel="three-dots-loading"
                    visible={true}
                />
            </div>
        );
    }

    return (
        <div className='monthlyattendance-container'>
            <AdminDashboard onToggleSidebar={setCollapsed} />
            <div className={`monthlyattendance-content ${collapsed ? 'collapsed' : ''}`}>
                <div className="d-flex justify-content-center">
                    <h2 className='monthlyattendance-heading'>Monthly Attendance for {new Date(currentDate.getFullYear(), parseInt(selectedMonth.split('-')[1], 10) - 1).toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}</h2>
                </div>
    
                <div className="d-flex mt-3">
                    <label htmlFor="monthFilter" className="ms-3 me-2">Select Month:</label>
                    <input 
                        type="month" 
                        id="monthFilter" 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(e.target.value)} 
                        max={maxMonth} // Disable future months
                    />
                </div>
    
                <div className="table-responsive mt-3">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>User Name</th>
                                {getMonthDates(currentDate.getFullYear(), parseInt(selectedMonth.split('-')[1], 10) - 1).map(date => (
                                    <th key={date.getDate()}>{date.getDate().toString().padStart(2, '0')}</th>
                                ))}
                                <th>Total Present</th>
                            </tr>
                        </thead>
                        <tbody>
    {monthlyData.length > 0 ? (
        monthlyData.map((user, index) => (
            <tr key={index}>
                <td>{user.name || 'N/A'}</td>
                {user.dailyStatuses.map((status, dayIndex) => (
                    <td 
                    key={dayIndex} 
                    style={{
                        color: status === 'P' ? 'green' : status === 'A' ? 'red' : 'purple',fontWeight: 'bold',
                        // Text color for better contrast
                    }}
                >
                    {status}
                </td>
                ))}
                <td>{user.totalPresent}</td>
            </tr>
        ))
    ) : (
        <tr>
            <td colSpan={getMonthDates(currentDate.getFullYear(), parseInt(selectedMonth.split('-')[1], 10) - 1).length + 2}>
                No data found
            </td>
        </tr>
    )}
</tbody>

                    </table>
                </div>
            </div>
        </div>
    );
    
};

export default MonthlyAttendance;
