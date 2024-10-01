import React, { useState, useEffect } from 'react';
import { db, storage } from '../../FirebaseConfig/Firebaseconfig';
import { collection, query, where, onSnapshot, getDocs, getDoc, setDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './../Attendance/AdminAttendance.css';
import { pdf } from '@react-pdf/renderer'; // Import react-pdf utilities
import PayslipPDF from './PayslipPDF';
import AdminDashboard from '../Dashboard/AdminDashboard';
import "./Payslips.css"; // Import the PayslipPDF component from the new file
import PayslipTable from './PayslipTable'; // Add this import at the top
import { Modal, Button } from 'react-bootstrap'; // Import Bootstrap Modal components
import { useNavigate} from "react-router-dom";


const Payslips = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [users, setUsers] = useState([]);
    const [attendanceData, setAttendanceData] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [presentCount, setPresentCount] = useState(0);
    const [amount, setAmount] = useState('');
    const [month, setMonth] = useState('');
    const [amountReceived, setAmountReceived] = useState(0);
    const [deductionAmount, setDeductionAmount] = useState(0);
    const [successMessage, setSuccessMessage] = useState('');
    const [showModal, setShowModal] = useState(false); // State to control modal visibility

    const fetchUsers = async () => {
        const q = query(collection(db, 'users'), where('status', '==', 'Verified'));
        const querySnapshot = await getDocs(q);
        const userData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setUsers(userData);
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

                if (selectedEmployeeId) {
                    updatePresentCountForSelectedMonth(data[selectedEmployeeId]);
                }
            } else {
                setAttendanceData(null);
            }
        });

        return () => unsubscribe();
    }, [selectedEmployeeId, month]);

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
        updatePresentCountForSelectedMonth(attendanceData[selectedEmployeeId]);
        calculateAmountReceived(amount, selectedMonth);
    };

    const updatePresentCountForSelectedMonth = (employeeAttendance) => {
        if (!employeeAttendance || !month) {
            setPresentCount(0);
            return;
        }

        let count = 0;
        const selectedMonthFormat = new Date(month).toISOString().slice(0, 7);

        for (const date in employeeAttendance) {
            const attendanceEntry = employeeAttendance[date];
            const [day, monthPart, year] = date.split('-');
            const reformattedDate = `${year}-${monthPart}-${day}`;
            const entryDate = new Date(reformattedDate);

            if (isNaN(entryDate)) {
                console.warn(`Invalid date encountered: ${date}`);
                continue;
            }

            const entryDateFormat = entryDate.toISOString().slice(0, 7);

            if (entryDateFormat === selectedMonthFormat && attendanceEntry.statuses === 'Present') {
                count++;
            }
        }

        setPresentCount(count);
    };

    const parseDuration = (duration) => {
        const matches = duration.match(/(\d+)\s*hours?\s*and\s*(\d+)\s*minutes?/);
        if (!matches) return 0;
        const hours = parseInt(matches[1], 10);
        const minutes = parseInt(matches[2], 10);
        return hours + minutes / 60;
    };

    const calculateAmountReceived = async (amount, month) => {
        if (amount && month && selectedEmployeeId) {
            const daysInMonth = new Date(new Date(month).getFullYear(), new Date(month).getMonth() + 1, 0).getDate();
            const employeeAttendance = attendanceData[selectedEmployeeId];
            
            let totalHoursWorked = 0;
            let sundayHours = 0;
            let holidayHours = 0;
    
            // Calculate hours for attendance entries
            for (const date in employeeAttendance) {
                const attendanceEntry = employeeAttendance[date];
                if (attendanceEntry.statuses === 'Present' && attendanceEntry.duration) {
                    let hoursWorked = parseDuration(attendanceEntry.duration);
    
                    if (hoursWorked > 9) {
                        hoursWorked = 9; // Maximum 9 hours per day
                    }
    
                    totalHoursWorked += hoursWorked;
                }
            }
    
            // Calculate Sundays and treat each Sunday as a 9-hour workday
            const selectedMonthYear = new Date(month);
            for (let day = 1; day <= daysInMonth; day++) {
                const currentDay = new Date(selectedMonthYear.getFullYear(), selectedMonthYear.getMonth(), day);
                if (currentDay.getDay() === 0) { // 0 means Sunday
                    sundayHours += 9; // Each Sunday is considered 9 hours
                }
            }
    
            // Fetch holidays for the selected month and count them as 9-hour workdays
            const holidaysRef = collection(db, 'holidays');
            const holidayQuery = query(holidaysRef, where('date', '>=', `${month}-01`), where('date', '<=', `${month}-${daysInMonth}`));
            const holidaySnapshot = await getDocs(holidayQuery);
    
            holidaySnapshot.forEach(doc => {
                const holidayData = doc.data();
                if (holidayData && holidayData.date) {
                    holidayHours += 9; // Each holiday is considered 9 hours
                }
            });
    
            // Add Sunday and holiday hours to totalHoursWorked
            totalHoursWorked += sundayHours + holidayHours;
    
            const dailyAmount = amount / daysInMonth;
            const hourlyRate = dailyAmount / 9;
            const calculatedAmount = hourlyRate * totalHoursWorked;
    
            // Round to two decimal places
            const roundedAmountReceived = parseFloat(calculatedAmount.toFixed(2));
            const roundedDeductionAmount = parseFloat((amount - roundedAmountReceived).toFixed(2));
    
            setAmountReceived(roundedAmountReceived);
            setDeductionAmount(roundedDeductionAmount);
        } else {
            setAmountReceived(0);
            setDeductionAmount(0);
        }
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedEmployee || !month || !amount || amountReceived === 0) {
            alert('Please fill all fields.');
            return;
        }

        try {
            setIsSubmitting(true);
            // Generate the PDF blob
            const blob = await pdf(
                <PayslipPDF
                    selectedEmployee={selectedEmployee}
                    presentCount={presentCount}
                    month={month}
                    amount={amount}
                    amountReceived={amountReceived}
                    deductionAmount={deductionAmount}
                />
            ).toBlob();

            // Download the PDF
            

            // Upload the PDF to Firebase Storage
            const storageRef = ref(storage, `payslips/${selectedEmployeeId}_${month}.pdf`);
            await uploadBytes(storageRef, blob);

            // Get the download URL of the uploaded PDF
            const downloadURL = await getDownloadURL(storageRef);

            // Define the payslip data
            const payslipData = {
                employeeId: selectedEmployeeId,
                employeeName: selectedEmployee.name,
                email: selectedEmployee.email,
                role: selectedEmployee.role,
                month,
                amount,
                presentCount,
                amountReceived,
                deductionAmount,
                pdfUrl: downloadURL,
                createdAt: new Date(),
                staffId: selectedEmployee.staffId,
            };

            // Get reference to the employee's document in Firestore
            const employeeDocRef = doc(db, 'payslips', selectedEmployeeId);

            // Fetch the existing payslip data for the employee
            const employeeDocSnapshot = await getDoc(employeeDocRef);

            let existingPayslips = {};

            if (employeeDocSnapshot.exists()) {
                existingPayslips = employeeDocSnapshot.data() || {};
            }

            // Add the new payslip to the Firestore document under the month key
            existingPayslips[month] = payslipData;

            // Update the Firestore document with the new payslip data directly under the month key
            await setDoc(employeeDocRef, existingPayslips, { merge: true });

            // Set success message
            alert('Payslip submitted successfully!');
            setShowModal(false);
            
        } catch (error) {
            console.error('Error submitting payslip: ', error);
            alert('Failed to submit payslip. Please try again.');
        } finally {
            setIsSubmitting(false); // Re-enable the button after submission completes or fails
        }
    };

    // Function to reset all form fields and states
    const resetForm = () => {
        setSelectedEmployee(null);
        setSelectedEmployeeId('');
        setMonth('');
        setAmount('');
        setAmountReceived(0);
        setDeductionAmount(0);
        setSuccessMessage('');
    };

    // Handler for closing the modal which resets the form
    const handleCloseModal = () => {
        resetForm();
        setShowModal(false);
    };

    return (
        <div className="admin-payslip-container">
            <AdminDashboard onToggleSidebar={setCollapsed} />
            <div className={`admin-payslip-content ${collapsed ? 'collapsed' : ''}`}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                   
                    <Button variant="primary" onClick={() => setShowModal(true)}>
                        Add Payslip
                    </Button>
                </div>

                {/* Modal for Adding Payslip */}
                <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Generate Payslip</Modal.Title>
                    </Modal.Header>
                    <Modal.Body >
                        <form onSubmit={handleSubmit}>
                            <div className="employee-details">
                                <div className="row mb-3">
                                    <div className="col-md-12">
                                        <label htmlFor="employeeSelect" className="form-label">Select Employee ID:</label>
                                        <select
                                            id="employeeSelect"
                                            className="form-select"
                                            value={selectedEmployeeId}
                                            onChange={handleEmployeeSelect}
                                            required
                                        >
                                            <option value="">-- Select Employee ID --</option>
                                            {users.map(user => (
                                                <option key={user.id} value={user.id}>{user.staffId}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {selectedEmployee && (
                                    <>
                                        <div className="row mb-3">
                                        <div className="col-md-12">
                                        <label htmlFor="month" className="form-label">Month:</label>
                                        <input
                                            type="month"
                                            id="month"
                                            className="form-control"
                                            value={month}
                                            onChange={handleMonthChange}
                                            required
                                        />
                                    </div>
                                            <div className="col-md-6">
                                                <label htmlFor="employeeName" className="form-label">Employee Name:</label>
                                                <input
                                                    type="text"
                                                    id="employeeName"
                                                    className="form-control"
                                                    value={selectedEmployee.name}
                                                    disabled
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="role" className="form-label">Role:</label>
                                                <input
                                                    type="text"
                                                    id="role"
                                                    className="form-control"
                                                    value={selectedEmployee.role}
                                                    disabled
                                                />
                                            </div>
                                        </div>

                                        <div className="row mb-3">
                                            <div className="col-md-6">
                                                <label htmlFor="email" className="form-label">Email:</label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    className="form-control"
                                                    value={selectedEmployee.email}
                                                    disabled
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="amount" className="form-label">Amount:</label>
                                                <input
                                                    type="number"
                                                    id="amount"
                                                    className="form-control"
                                                    value={amount}
                                                    onChange={handleAmountChange}
                                                    required
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                        </div>

                                        <div className="row mb-3">
                                            <div className="col-md-6">
                                                <label htmlFor="deductionAmount" className="form-label">Deduction Amount:</label>
                                                <input
                                                    type="number"
                                                    id="deductionAmount"
                                                    className="form-control"
                                                    value={deductionAmount}
                                                    disabled
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="amountReceived" className="form-label">Amount Received:</label>
                                                <input
                                                    type="number"
                                                    id="amountReceived"
                                                    className="form-control"
                                                    value={amountReceived}
                                                    disabled
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="d-flex justify-content-end">
                                <Button variant="secondary" onClick={handleCloseModal} className="me-2">
                                    Close
                                </Button>
                                <Button type="submit" variant="primary" disabled={isSubmitting || !selectedEmployee}>
    {isSubmitting ? 'Generating...' : 'Generate Payslip'}
</Button>
                            </div>
                        </form>

                        {successMessage && <div className="alert alert-success mt-3">{successMessage}</div>}
                    </Modal.Body>
                </Modal>

                {/* Payslip Table */}
                <PayslipTable />

            </div>
        </div>
    );
};

export default Payslips;
