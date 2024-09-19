import React, { useState, useEffect } from 'react';
import { db } from '../../FirebaseConfig/Firebaseconfig'; // Adjust the import path
import { collection, getDocs } from 'firebase/firestore';
import AdminDashboard from '../Dashboard/AdminDashboard';
import './MonthlyAttendance.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
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
        return Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));
    };

    const formatDateForKey = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const getAttendanceStatus = (userAttendance, dateKey) => {
        const dayAttendance = userAttendance[dateKey];
        if (dayAttendance && dayAttendance.statuses === 'Present') {
            return 'P'; // 'P' for Present
        } 
        // return 'A'; 
    };

    // Component state
    const [collapsed, setCollapsed] = useState(false);
    const [users, setUsers] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedRole, setSelectedRole] = useState('All'); // State to hold the selected role
    const [selectedMonth, setSelectedMonth] = useState(getFormattedMonth(new Date())); // State to hold the selected month

    // Fetch users data
    const fetchUsers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'users'));
            const userData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            userData.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
            setUsers(userData);
        } catch (error) {
            console.error("Error fetching users data: ", error);
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
    }, []);

    const processMonthlyAttendanceData = () => {
        const year = currentDate.getFullYear();
        const month = parseInt(selectedMonth.split('-')[1], 10) - 1; // Convert to 0-based month
        const monthDates = getMonthDates(year, month);
        const dateKeys = monthDates.map(formatDateForKey);

        const filteredUsers = selectedRole === 'All' ? users : users.filter(user => user.role === selectedRole);

        return filteredUsers.map(user => {
            const userAttendance = attendanceData.find(entry => entry.id === user.id) || {};
            let totalPresent = 0;
            const dailyStatuses = dateKeys.map(dateKey => {
                const status = getAttendanceStatus(userAttendance, dateKey);
                if (status === 'P') totalPresent++; // Count only 'P' as Present
                return status;
            });

            return {
                ...user,
                dailyStatuses,
                totalPresent
            };
        });
    };

    const monthlyData = processMonthlyAttendanceData();

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        const monthName = new Date(currentDate.getFullYear(), parseInt(selectedMonth.split('-')[1], 10) - 1).toLocaleString('default', { month: 'long' });
        doc.text(`Monthly Attendance Report - ${monthName} ${currentDate.getFullYear()}`, 14, 10);

        const tableColumn = ["User Name", ...getMonthDates(currentDate.getFullYear(), parseInt(selectedMonth.split('-')[1], 10) - 1).map(date => date.getDate().toString().padStart(2, '0')), "Total Present"];
        const tableRows = [];

        monthlyData.forEach(user => {
            const rowData = [
                user.name || 'N/A',
                ...user.dailyStatuses,
                user.totalPresent || 0
            ];
            tableRows.push(rowData);
        });

        doc.autoTable(tableColumn, tableRows, { startY: 20 });
        doc.save(`Monthly_Attendance_Report_${selectedMonth}_${currentDate.getFullYear()}.pdf`);
    };

    // Get current year and month for the max date attribute
    const currentYear = currentDate.getFullYear();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    const maxMonth = `${currentYear}-${currentMonth}`;


    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        const fetchData = async () => {
          // Simulate a network request
          await new Promise(resolve => setTimeout(resolve, 2000));
          setLoading(false); // Set loading to false after data is fetched
        };
    
        fetchData();
      }, []);
    
      if (loading) {
        return (
          <div className="loader-container">
            <ThreeDots 
              height="80" 
              width="80" 
              radius="9"
              color="#00BFFF"
              ariaLabel="three-dots-loading"
              wrapperStyle={{}}
              wrapperClass=""
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
                    <h1 className='monthlyattendance-heading'>Monthly Attendance for {new Date(currentDate.getFullYear(), parseInt(selectedMonth.split('-')[1], 10) - 1).toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}</h1>
                </div>

                <div className="d-flex justify-content-center mt-3">
                   

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
                                            <td key={dayIndex}>{status}</td>
                                        ))}
                                        <td>{user.totalPresent}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={getMonthDates(currentDate.getFullYear(), parseInt(selectedMonth.split('-')[1], 10) - 1).length + 2}>No data available</td>
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
