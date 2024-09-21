import React, { useState, useEffect } from 'react';
import { db } from '../../FirebaseConfig/Firebaseconfig'; // Adjust the import path
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import AdminDashboard from '../Dashboard/AdminDashboard';
import { ThreeDots } from 'react-loader-spinner';
import { format } from 'date-fns';
import "./Payslips.css" // To format dates

const Payslips = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true); // Loading state
    const [selectedEmployee, setSelectedEmployee] = useState(null); // Selected employee state
    const [amount, setAmount] = useState(''); // Amount state
    const [month, setMonth] = useState(''); // Selected month state
    const [daysPresent, setDaysPresent] = useState(''); // Total days present state
    const [amountReceived, setAmountReceived] = useState(''); // Amount received state
    const [attendance, setAttendance] = useState([]); // Attendance data
    const [isLoading, setIsLoading] = useState(false); // For modal or other actions

    // Map for the number of days in each month
    const daysInMonth = {
        January: 31,
        February: 28, // Leap year check can be added if needed
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
        } finally {
            setLoading(false); // Set loading to false after data fetch
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleEmployeeSelect = async (event) => {
        const selectedId = event.target.value;
        const employee = users.find(user => user.staffId === selectedId);
        setSelectedEmployee(employee || null); // Set the selected employee or reset if not found

        if (employee) {
            // Fetch attendance for the selected employee
            await fetchAttendanceData(employee.staffId);
        }
    };

    const fetchAttendanceData = async (employeeUid) => {
        try {
            setIsLoading(true);
            const querySnapshot = await getDocs(collection(db, `attendance_${employeeUid}`));
            const attendanceData = querySnapshot.docs.map(doc => doc.data());
            setAttendance(attendanceData);
            console.log("uid",attendanceData);
        } catch (error) {
            console.error("Error fetching attendance data: ", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate the total days present for the selected month from the attendance data
    useEffect(() => {
        if (month && attendance.length > 0) {
            const filteredAttendance = attendance.filter(att => {
                const entryDate = Object.keys(att)[0]; // Get the attendance date (key)
                const entryMonth = format(new Date(entryDate), 'MMMM'); // Extract month name from the date
                return entryMonth === month && att[entryDate].statuses === "Present"; // Check if the month matches and status is "Present"
            });

            setDaysPresent(filteredAttendance.length); // Set total days present
        }
    }, [month, attendance]);

    // Calculate the amount received based on the total days present and selected month
    useEffect(() => {
        if (amount && month && daysPresent) {
            const daysInSelectedMonth = daysInMonth[month];
            const perDayAmount = amount / daysInSelectedMonth;
            const calculatedAmountReceived = perDayAmount * daysPresent;
            setAmountReceived(calculatedAmountReceived.toFixed(2)); // Set calculated amount received
        }
    }, [amount, month, daysPresent]);

    // Handle submit and store the payslip in Firestore
    const handleSubmit = async () => {
        if (!selectedEmployee || !amount || !month || !daysPresent) {
            alert("Please fill in all fields!");
            return;
        }

        try {
            const docId = selectedEmployee.staffId; // Use employeeUid (staffId) as the docId for the payslip
            const payslipData = {
                employeeName: selectedEmployee.name,
                employeeRole: selectedEmployee.role,
                amount: Number(amount),
                month: month,
                totalDaysPresent: Number(daysPresent),
                amountReceived: Number(amountReceived),
                createdAt: new Date(),
            };

            // Store in Firestore under the 'payslip' collection with docId as employeeUid
            await setDoc(doc(db, 'payslips', docId), payslipData);
            alert("Payslip submitted successfully!");

            // Clear the form
            setAmount('');
            setMonth('');
            setDaysPresent('');
            setAmountReceived('');
            setSelectedEmployee(null);
        } catch (error) {
            console.error("Error submitting payslip: ", error);
            alert("Error submitting payslip!");
        }
    };

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
                    visible={true}
                />
            </div>
        );
    }

    return (
        <div className='admin-payslips-container'>
            <AdminDashboard onToggleSidebar={setCollapsed} />
            <div className={`admin-payslips-content ${collapsed ? 'collapsed' : ''}`}>
                <h1 className='payslips-heading'>Payslips</h1>

                {/* Dropdown to select Employee ID */}
                <div className="form-group mt-3">
                    <label htmlFor="employeeId">Select Employee ID:</label>
                    <select
                        id="employeeId"
                        className="form-control"
                        onChange={handleEmployeeSelect}
                        value={selectedEmployee?.staffId || ''}
                    >
                        <option value="">Select Employee ID</option>
                        {users.map(user => (
                            <option key={user.id} value={user.staffId}>
                                {user.staffId}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Display selected employee details */}
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
                            <label htmlFor="employeeRole">Role:</label>
                            <input
                                type="text"
                                id="employeeRole"
                                className="form-control"
                                value={selectedEmployee.role || 'N/A'}
                                readOnly
                            />
                        </div>

                        {/* Input field for Amount */}
                        <div className="form-group mt-3">
                            <label htmlFor="amount">Amount:</label>
                            <input
                                type="number"
                                id="amount"
                                className="form-control"
                                placeholder="Enter Amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>

                        {/* Dropdown to select Month */}
                        <div className="form-group mt-3">
                            <label htmlFor="month">Select Month:</label>
                            <select
                                id="month"
                                className="form-control"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                            >
                                <option value="">Select Month</option>
                                {Object.keys(daysInMonth).map(monthName => (
                                    <option key={monthName} value={monthName}>
                                        {monthName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Input field for Total Days Present */}
                        <div className="form-group mt-3">
                            <label htmlFor="daysPresent">Total Days Present (Current Month):</label>
                            <input
                                type="number"
                                id="daysPresent"
                                className="form-control"
                                placeholder="Enter Total Days Present"
                                value={daysPresent}
                                readOnly
                            />
                        </div>

                        {/* Display calculated Amount Received */}
                        <div className="form-group mt-3">
                            <label htmlFor="amountReceived">Amount Received:</label>
                            <input
                                type="text"
                                id="amountReceived"
                                className="form-control"
                                value={amountReceived || '0.00'}
                                readOnly
                            />
                        </div>

                        {/* Submit Button */}
                        <button className="btn btn-primary mt-3" onClick={handleSubmit}>
                            Submit Payslip
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Payslips;
