import React, { useState, useEffect } from 'react';
import { db } from '../../FirebaseConfig/Firebaseconfig'; // Adjust the import path
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import './../Attendance/AdminAttendance.css';

const Payslips = () => {
    const [users, setUsers] = useState([]);
    const [attendanceData, setAttendanceData] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [presentCount, setPresentCount] = useState(0);
    const [amount, setAmount] = useState('');
    const [month, setMonth] = useState('');
    const [amountReceived, setAmountReceived] = useState(0);

    const daysInMonth = {
        January: 31,
        February: 28, // Consider leap year if needed
        March: 31,
        April: 30,
        May: 31,
        June: 30,
        July: 31,
        August: 31,
        September: 30,
        October: 31,
        November: 30,
        December: 31,
    };

    const fetchUsers = async () => {
        const q = query(collection(db, 'users'), where('status', '==', 'Verified'));
        const querySnapshot = await getDocs(q);
        const userData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setUsers(userData);
        console.log("Fetched users:", userData);
    };

    useEffect(() => {
        fetchUsers();

        const attendanceRef = collection(db, 'attendance');
        const unsubscribe = onSnapshot(attendanceRef, (attendanceSnap) => {
            if (!attendanceSnap.empty) {
                const data = {};
                attendanceSnap.forEach(doc => {
                    data[doc.id] = doc.data();
                });
                setAttendanceData(data);
                console.log("Fetched attendance data:", data);

                if (selectedEmployeeId) {
                    let count = 0;

                    const employeeAttendance = data[selectedEmployeeId];

                    if (employeeAttendance) {
                        for (const date in employeeAttendance) {
                            const attendanceEntry = employeeAttendance[date];

                            if (attendanceEntry.statuses === 'Present') {
                                count++;
                            }
                        }
                    }

                    setPresentCount(count);
                    console.log("Present count for selected employee:", count);
                }
            } else {
                setAttendanceData(null);
                console.log("No attendance data found.");
            }
        });

        return () => unsubscribe();
    }, [selectedEmployeeId]);

    const handleEmployeeSelect = (e) => {
        const employeeId = e.target.value;
        const employee = users.find(user => user.id === employeeId);
        setSelectedEmployee(employee || null);
        setSelectedEmployeeId(employeeId);
    };

    const handleAmountChange = (e) => {
        const value = e.target.value;
        setAmount(value);
        calculateAmountReceived(value, month);
    };

    const handleMonthChange = (e) => {
        const selectedMonth = e.target.value;
        setMonth(selectedMonth);
        calculateAmountReceived(amount, selectedMonth);
    };

    const calculateAmountReceived = (amount, month) => {
        if (amount && month) {
            const totalDays = daysInMonth[month] || 0;
            const calculatedAmount = (amount / totalDays) * presentCount;
            setAmountReceived(calculatedAmount);
        } else {
            setAmountReceived(0);
        }
    };

    return (
        <div className='attendance-container'>
            <h2>Attendance Count</h2>
            <select
                value={selectedEmployeeId}
                onChange={handleEmployeeSelect}
            >
                <option value="">Select Employee ID</option>
                {users.map(user => (
                    <option key={user.id} value={user.id}>{user.staffId}</option>
                ))}
            </select>

            {selectedEmployee && (
                <div className="employee-details mt-3">
                    <div className="form-group">
                        <label htmlFor="employeeName">Employee Name:</label>
                        <input
                            type="text"
                            id="employeeName"
                            className="form-control"
                            value={selectedEmployee.name || 'N/A'}
                            readOnly
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="employeeEmail">Email:</label>
                        <input
                            type="text"
                            id="employeeEmail"
                            className="form-control"
                            value={selectedEmployee.email || 'N/A'}
                            readOnly
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="employeeRole">Role:</label>
                        <input
                            type="text"
                            id="employeeRole"
                            className="form-control"
                            value={selectedEmployee.role || 'N/A'}
                            readOnly
                        />
                    </div>

                    <div className="form-group mt-3">
                        <label htmlFor="amount">Amount:</label>
                        <input
                            type="number"
                            id="amount"
                            className="form-control"
                            placeholder="Enter Amount"
                            value={amount}
                            onChange={handleAmountChange}
                        />
                    </div>

                    <div className="form-group mt-3">
                        <label htmlFor="month">Select Month:</label>
                        <select
                            id="month"
                            className="form-control"
                            value={month}
                            onChange={handleMonthChange}
                        >
                            <option value="">Select Month</option>
                            {Object.keys(daysInMonth).map(monthName => (
                                <option key={monthName} value={monthName}>
                                    {monthName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group mt-3">
                        <label htmlFor="daysPresent">Total Days Present:</label>
                        <input
                            type="text"
                            id="daysPresent"
                            className="form-control"
                            value={presentCount}
                            readOnly
                        />
                    </div>

                    <div className="form-group mt-3">
                        <label htmlFor="amountReceived">Amount Received:</label>
                        <input
                            type="text"
                            id="amountReceived"
                            className="form-control"
                            value={amountReceived}
                            readOnly
                        />
                    </div>

                   
                </div>
            )}
        </div>
    );
};

export default Payslips;
