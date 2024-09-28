





// import React, { useState, useEffect } from 'react';
// import { db, storage } from '../../FirebaseConfig/Firebaseconfig'; // Import Firebase config including storage
// import { collection, query, where, onSnapshot, getDocs, setDoc, doc } from 'firebase/firestore';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import storage functions from Firebase
// import './../Attendance/AdminAttendance.css';
// import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'; // Import react-pdf

// const Payslips = () => {
//     const [users, setUsers] = useState([]);
//     const [attendanceData, setAttendanceData] = useState(null);
//     const [selectedEmployee, setSelectedEmployee] = useState(null);
//     const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
//     const [presentCount, setPresentCount] = useState(0);
//     const [amount, setAmount] = useState('');
//     const [month, setMonth] = useState('');
//     const [amountReceived, setAmountReceived] = useState(0);
//     const [deductionAmount, setDeductionAmount] = useState(0); // New state for deduction amount
//     const [successMessage, setSuccessMessage] = useState('');

//     const fetchUsers = async () => {
//         const q = query(collection(db, 'users'), where('status', '==', 'Verified'));
//         const querySnapshot = await getDocs(q);
//         const userData = querySnapshot.docs.map(doc => ({
//             id: doc.id,
//             ...doc.data()
//         }));
//         setUsers(userData);
//     };

//     useEffect(() => {
//         fetchUsers();

//         const attendanceRef = collection(db, 'attendance');
//         const unsubscribe = onSnapshot(attendanceRef, (attendanceSnap) => {
//             if (!attendanceSnap.empty) {
//                 const data = {};
//                 attendanceSnap.forEach(doc => {
//                     data[doc.id] = doc.data();
//                 });
//                 setAttendanceData(data);

//                 if (selectedEmployeeId) {
//                     updatePresentCountForSelectedMonth(data[selectedEmployeeId]);
//                 }
//             } else {
//                 setAttendanceData(null);
//             }
//         });

//         return () => unsubscribe();
//     }, [selectedEmployeeId, month]);

//     const handleEmployeeSelect = (e) => {
//         const employeeId = e.target.value;
//         const employee = users.find(user => user.id === employeeId);
//         setSelectedEmployee(employee || null);
//         setSelectedEmployeeId(employeeId);
//     };

//     const handleAmountChange = (e) => {
//         const value = e.target.value;
//         setAmount(value);
//         calculateAmountReceived(value, month);
//     };

//     const handleMonthChange = (e) => {
//         const selectedMonth = e.target.value;
//         setMonth(selectedMonth);
//         updatePresentCountForSelectedMonth(attendanceData[selectedEmployeeId]);
//         calculateAmountReceived(amount, selectedMonth);
//     };

//     const updatePresentCountForSelectedMonth = (employeeAttendance) => {
//         if (!employeeAttendance || !month) {
//             setPresentCount(0);
//             return;
//         }

//         let count = 0;
//         const selectedMonthFormat = new Date(month).toISOString().slice(0, 7);

//         for (const date in employeeAttendance) {
//             const attendanceEntry = employeeAttendance[date];
//             const [day, month, year] = date.split('-');
//             const reformattedDate = `${year}-${month}-${day}`;
//             const entryDate = new Date(reformattedDate);

//             if (isNaN(entryDate)) {
//                 console.warn(`Invalid date encountered: ${date}`);
//                 continue; 
//             }

//             const entryDateFormat = entryDate.toISOString().slice(0, 7);

//             if (entryDateFormat === selectedMonthFormat && attendanceEntry.statuses === 'Present') {
//                 count++;
//             }
//         }

//         setPresentCount(count);
//     };

//     const parseDuration = (duration) => {
//         const matches = duration.match(/(\d+)\s*hours?\s*and\s*(\d+)\s*minutes?/);
//         if (!matches) return 0; 
//         const hours = parseInt(matches[1], 10);
//         const minutes = parseInt(matches[2], 10);
//         return hours + minutes / 60;
//     };

//     const calculateAmountReceived = (amount, month) => {
//         if (amount && month && selectedEmployeeId) {
//             const daysInMonth = new Date(new Date(month).getFullYear(), new Date(month).getMonth() + 1, 0).getDate();
//             const employeeAttendance = attendanceData[selectedEmployeeId];

//             let totalHoursWorked = 0;

//             for (const date in employeeAttendance) {
//                 const attendanceEntry = employeeAttendance[date];
//                 if (attendanceEntry.statuses === 'Present' && attendanceEntry.duration) {
//                     let hoursWorked = parseDuration(attendanceEntry.duration);

//                     if (hoursWorked > 9) {
//                         hoursWorked = 9;
//                     }

//                     totalHoursWorked += hoursWorked;
//                 }
//             }

//             const dailyAmount = amount / daysInMonth;
//             const hourlyRate = dailyAmount / 9;
//             const calculatedAmount = hourlyRate * totalHoursWorked;
//             setAmountReceived(calculatedAmount);
//             setDeductionAmount(amount - calculatedAmount); // Calculate deduction amount
//         } else {
//             setAmountReceived(0);
//             setDeductionAmount(0); // Reset deduction amount if no calculation is possible
//         }
//     };

//     const PayslipPDF = ({ amount }) => (
//         <Document>
//             <Page style={styles.page}>
//                 <View>
//                     <Text>Payslip for {selectedEmployee.name}</Text>
//                 </View>
//                 <View>
//                     <Text>Employee ID: {selectedEmployee.staffId}</Text>
//                     <Text>Role: {selectedEmployee.role}</Text>
//                     <Text>Email: {selectedEmployee.email}</Text>
//                     <Text>Month: {month}</Text>
//                     <Text>Total Days Present: {presentCount}</Text>
//                     <Text>Amount: {amount}</Text> {/* Show the entered amount */}
//                     <Text>Deduction Amount: {deductionAmount}</Text> {/* Show the deduction amount */}
//                     <Text>Amount Received: {amountReceived}</Text> {/* Show the received amount */}
//                 </View>
//             </Page>
//         </Document>
//     );

//     const styles = StyleSheet.create({
//         page: {
//             padding: 30,
//         },
//         text: {
//             fontSize: 12,
//         },
//     });

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (!selectedEmployee || !month || !amount || amountReceived === 0) {
//             alert('Please fill all fields.');
//             return;
//         }

//         try {
//             // Generate PDF as a blob
//             const blob = await pdf(<PayslipPDF amount={amount} />).toBlob(); // Pass amount to PayslipPDF

//             // 1. Download PDF locally
//             const pdfURL = window.URL.createObjectURL(blob);
//             const link = document.createElement('a');
//             link.href = pdfURL;
//             link.download = `${selectedEmployee.name}_Payslip_${month}.pdf`;
//             link.click(); // This triggers the download on the user's local machine

//             // Upload PDF to Firebase Storage
//             const storageRef = ref(storage, `payslips/${selectedEmployeeId}_${month}.pdf`);
//             await uploadBytes(storageRef, blob);

//             // Get the download URL from Firebase Storage
//             const downloadURL = await getDownloadURL(storageRef);

//             // Save the download URL in Firestore
//             const payslipData = {
//                 employeeId: selectedEmployeeId,
//                 employeeName: selectedEmployee.name,
//                 email: selectedEmployee.email,
//                 role: selectedEmployee.role,
//                 month,
//                 amount,
//                 presentCount,
//                 amountReceived,
//                 deductionAmount, // Include deductionAmount in the data
//                 pdfUrl: downloadURL, // Save the PDF URL in Firestore
//                 createdAt: new Date(),
//             };

//             await setDoc(doc(db, 'payslips', selectedEmployeeId + '_' + month), payslipData);
//             setSuccessMessage('Payslip submitted successfully!');
//         } catch (error) {
//             console.error('Error submitting payslip: ', error);
//         }
//     };

//     return (
//         <div className='attendance-container'>
//             <h2>Attendance Count</h2>
//             <select
//                 value={selectedEmployeeId}
//                 onChange={handleEmployeeSelect}
//             >
//                 <option value="">Select Employee ID</option>
//                 {users.map(user => (
//                     <option key={user.id} value={user.id}>{user.staffId}</option>
//                 ))}
//             </select>

//             {selectedEmployee && (
//                 <form onSubmit={handleSubmit}>
//                     <div className="employee-details mt-3">
//                         <div className="form-group">
//                             <label htmlFor="employeeName">Employee Name:</label>
//                             <input
//                                 type="text"
//                                 id="employeeName"
//                                 className="form-control"
//                                 value={selectedEmployee.name}
//                                 disabled
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label htmlFor="role">Role:</label>
//                             <input
//                                 type="text"
//                                 id="role"
//                                 className="form-control"
//                                 value={selectedEmployee.role}
//                                 disabled
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label htmlFor="email">Email:</label>
//                             <input
//                                 type="email"
//                                 id="email"
//                                 className="form-control"
//                                 value={selectedEmployee.email}
//                                 disabled
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label htmlFor="month">Month:</label>
//                             <input
//                                 type="month"
//                                 id="month"
//                                 className="form-control"
//                                 value={month}
//                                 onChange={handleMonthChange}
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label htmlFor="amount">Amount:</label>
//                             <input
//                                 type="number"
//                                 id="amount"
//                                 className="form-control"
//                                 value={amount}
//                                 onChange={handleAmountChange}
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label htmlFor="deductionAmount">Deduction Amount:</label>
//                             <input
//                                 type="number"
//                                 id="deductionAmount"
//                                 className="form-control"
//                                 value={deductionAmount}
//                                 disabled
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label htmlFor="amountReceived">Amount Received:</label>
//                             <input
//                                 type="number"
//                                 id="amountReceived"
//                                 className="form-control"
//                                 value={amountReceived}
//                                 disabled
//                             />
//                         </div>

//                     </div>

//                     <button type="submit" className="btn btn-primary">Generate Payslip</button>
//                 </form>
//             )}

//             {successMessage && <p>{successMessage}</p>}
//         </div>
//     );
// };

// export default Payslips;





// import React, { useState, useEffect } from 'react';
// import { db, storage } from '../../FirebaseConfig/Firebaseconfig'; 
// import { collection, query, where, onSnapshot, getDocs, setDoc, doc } from 'firebase/firestore';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 
// import './../Attendance/AdminAttendance.css';
// import { pdf } from '@react-pdf/renderer'; // Import react-pdf utilities
// import PayslipPDF from './PayslipPDF';
// import AdminDashboard from '../Dashboard/AdminDashboard';
// import "./Payslips.css" // Import the PayslipPDF component from the new file

// const Payslips = () => {
//     const [collapsed, setCollapsed] = useState(false);
//     const [users, setUsers] = useState([]);
//     const [attendanceData, setAttendanceData] = useState(null);
//     const [selectedEmployee, setSelectedEmployee] = useState(null);
//     const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
//     const [presentCount, setPresentCount] = useState(0);
//     const [amount, setAmount] = useState('');
//     const [month, setMonth] = useState('');
//     const [amountReceived, setAmountReceived] = useState(0);
//     const [deductionAmount, setDeductionAmount] = useState(0);
//     const [successMessage, setSuccessMessage] = useState('');

//     const fetchUsers = async () => {
//         const q = query(collection(db, 'users'), where('status', '==', 'Verified'));
//         const querySnapshot = await getDocs(q);
//         const userData = querySnapshot.docs.map(doc => ({
//             id: doc.id,
//             ...doc.data()
//         }));
//         setUsers(userData);
//     };

//     useEffect(() => {
//         fetchUsers();

//         const attendanceRef = collection(db, 'attendance');
//         const unsubscribe = onSnapshot(attendanceRef, (attendanceSnap) => {
//             if (!attendanceSnap.empty) {
//                 const data = {};
//                 attendanceSnap.forEach(doc => {
//                     data[doc.id] = doc.data();
//                 });
//                 setAttendanceData(data);

//                 if (selectedEmployeeId) {
//                     updatePresentCountForSelectedMonth(data[selectedEmployeeId]);
//                 }
//             } else {
//                 setAttendanceData(null);
//             }
//         });

//         return () => unsubscribe();
//     }, [selectedEmployeeId, month]);

//     const handleEmployeeSelect = (e) => {
//         const employeeId = e.target.value;
//         const employee = users.find(user => user.id === employeeId);
//         setSelectedEmployee(employee || null);
//         setSelectedEmployeeId(employeeId);
//     };

//     const handleAmountChange = (e) => {
//         const value = e.target.value;
//         setAmount(value);
//         calculateAmountReceived(value, month);
//     };

//     const handleMonthChange = (e) => {
//         const selectedMonth = e.target.value;
//         setMonth(selectedMonth);
//         updatePresentCountForSelectedMonth(attendanceData[selectedEmployeeId]);
//         calculateAmountReceived(amount, selectedMonth);
//     };

//     const updatePresentCountForSelectedMonth = (employeeAttendance) => {
//         if (!employeeAttendance || !month) {
//             setPresentCount(0);
//             return;
//         }

//         let count = 0;
//         const selectedMonthFormat = new Date(month).toISOString().slice(0, 7);

//         for (const date in employeeAttendance) {
//             const attendanceEntry = employeeAttendance[date];
//             const [day, month, year] = date.split('-');
//             const reformattedDate = `${year}-${month}-${day}`;
//             const entryDate = new Date(reformattedDate);

//             if (isNaN(entryDate)) {
//                 console.warn(`Invalid date encountered: ${date}`);
//                 continue; 
//             }

//             const entryDateFormat = entryDate.toISOString().slice(0, 7);

//             if (entryDateFormat === selectedMonthFormat && attendanceEntry.statuses === 'Present') {
//                 count++;
//             }
//         }

//         setPresentCount(count);
//     };

//     const parseDuration = (duration) => {
//         const matches = duration.match(/(\d+)\s*hours?\s*and\s*(\d+)\s*minutes?/);
//         if (!matches) return 0; 
//         const hours = parseInt(matches[1], 10);
//         const minutes = parseInt(matches[2], 10);
//         return hours + minutes / 60;
//     };

//     const calculateAmountReceived = (amount, month) => {
//         if (amount && month && selectedEmployeeId) {
//             const daysInMonth = new Date(new Date(month).getFullYear(), new Date(month).getMonth() + 1, 0).getDate();
//             const employeeAttendance = attendanceData[selectedEmployeeId];

//             let totalHoursWorked = 0;

//             for (const date in employeeAttendance) {
//                 const attendanceEntry = employeeAttendance[date];
//                 if (attendanceEntry.statuses === 'Present' && attendanceEntry.duration) {
//                     let hoursWorked = parseDuration(attendanceEntry.duration);

//                     if (hoursWorked > 9) {
//                         hoursWorked = 9;
//                     }

//                     totalHoursWorked += hoursWorked;
//                 }
//             }

//             const dailyAmount = amount / daysInMonth;
//             const hourlyRate = dailyAmount / 9;
//             const calculatedAmount = hourlyRate * totalHoursWorked;
//             setAmountReceived(calculatedAmount);
//             setDeductionAmount(amount - calculatedAmount);
//         } else {
//             setAmountReceived(0);
//             setDeductionAmount(0);
//         }
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (!selectedEmployee || !month || !amount || amountReceived === 0) {
//             alert('Please fill all fields.');
//             return;
//         }

//         try {
//             const blob = await pdf(
//                 <PayslipPDF
//                     selectedEmployee={selectedEmployee}
//                     presentCount={presentCount}
//                     month={month}
//                     amount={amount}
//                     amountReceived={amountReceived}
//                     deductionAmount={deductionAmount}
//                 />
//             ).toBlob();

//             const pdfURL = window.URL.createObjectURL(blob);
//             const link = document.createElement('a');
//             link.href = pdfURL;
//             link.download = `${selectedEmployee.name}_Payslip_${month}.pdf`;
//             link.click();

//             const storageRef = ref(storage, `payslips/${selectedEmployeeId}_${month}.pdf`);
//             await uploadBytes(storageRef, blob);

//             const downloadURL = await getDownloadURL(storageRef);

//             const payslipData = {
//                 employeeId: selectedEmployeeId,
//                 employeeName: selectedEmployee.name,
//                 email: selectedEmployee.email,
//                 role: selectedEmployee.role,
//                 month,
//                 amount,
//                 presentCount,
//                 amountReceived,
//                 deductionAmount,
//                 pdfUrl: downloadURL,
//                 createdAt: new Date(),
//             };

//             await setDoc(doc(db, 'payslips', selectedEmployeeId + '_' + month), payslipData);
//             setSuccessMessage('Payslip submitted successfully!');
//         } catch (error) {
//             console.error('Error submitting payslip: ', error);
//         }
//     };

//     return (
//         <div className='admin-payslip-container'>
//         <AdminDashboard onToggleSidebar={setCollapsed} />
//         <div className={`admin-payslip-content ${collapsed ? 'collapsed' : ''}`}>

//             <h2>Attendance Count</h2>
//             <select
//                 value={selectedEmployeeId}
//                 onChange={handleEmployeeSelect}
//             >
//                 <option value="">Select Employee ID</option>
//                 {users.map(user => (
//                     <option key={user.id} value={user.id}>{user.staffId}</option>
//                 ))}
//             </select>

//             {selectedEmployee && (
//                 <form onSubmit={handleSubmit}>
//                     <div className="employee-details mt-3">
//                         <div className="form-group">
//                             <label htmlFor="employeeName">Employee Name:</label>
//                             <input
//                                 type="text"
//                                 id="employeeName"
//                                 className="form-control"
//                                 value={selectedEmployee.name}
//                                 disabled
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label htmlFor="role">Role:</label>
//                             <input
//                                 type="text"
//                                 id="role"
//                                 className="form-control"
//                                 value={selectedEmployee.role}
//                                 disabled
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label htmlFor="email">Email:</label>
//                             <input
//                                 type="email"
//                                 id="email"
//                                 className="form-control"
//                                 value={selectedEmployee.email}
//                                 disabled
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label htmlFor="month">Month:</label>
//                             <input
//                                 type="month"
//                                 id="month"
//                                 className="form-control"
//                                 value={month}
//                                 onChange={handleMonthChange}
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label htmlFor="amount">Amount:</label>
//                             <input
//                                 type="number"
//                                 id="amount"
//                                 className="form-control"
//                                 value={amount}
//                                 onChange={handleAmountChange}
//                             />
//                         </div>

//                         <div className="form-group">
//                             <label htmlFor="deductionAmount">Deduction Amount:</label>
//                             <input
//                                 type="number"
//                                 id="deductionAmount"
//                                 className="form-control"
//                                 value={deductionAmount}
//                                 disabled
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label htmlFor="amountReceived">Amount Received:</label>
//                             <input
//                                 type="number"
//                                 id="amountReceived"
//                                 className="form-control"
//                                 value={amountReceived}
//                                 disabled
//                             />
//                         </div>

//                     </div>

//                     <button type="submit" className="btn btn-primary">Generate Payslip</button>
//                 </form>
//             )}

//             {successMessage && <p>{successMessage}</p>}
//         </div>

//         </div>
//     );
// };

// export default Payslips;









import React, { useState, useEffect } from 'react';
import { db, storage } from '../../FirebaseConfig/Firebaseconfig'; 
import { collection, query, where, onSnapshot, getDocs, getDoc, setDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 
import './../Attendance/AdminAttendance.css';
import { pdf } from '@react-pdf/renderer'; // Import react-pdf utilities
import PayslipPDF from './PayslipPDF';
import AdminDashboard from '../Dashboard/AdminDashboard';
import "./Payslips.css" // Import the PayslipPDF component from the new file
import PayslipTable from './PayslipTable'; // Add this import at the top


const Payslips = () => {
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
            const [day, month, year] = date.split('-');
            const reformattedDate = `${year}-${month}-${day}`;
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

  


    const calculateAmountReceived = (amount, month) => {
        if (amount && month && selectedEmployeeId) {
            const daysInMonth = new Date(new Date(month).getFullYear(), new Date(month).getMonth() + 1, 0).getDate();
            const employeeAttendance = attendanceData[selectedEmployeeId];
    
            let totalHoursWorked = 0;
    
            for (const date in employeeAttendance) {
                const attendanceEntry = employeeAttendance[date];
                if (attendanceEntry.statuses === 'Present' && attendanceEntry.duration) {
                    let hoursWorked = parseDuration(attendanceEntry.duration);
    
                    if (hoursWorked > 9) {
                        hoursWorked = 9;
                    }
    
                    totalHoursWorked += hoursWorked;
                }
            }
    
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
            const pdfURL = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = pdfURL;
            link.download = `${selectedEmployee.name}_Payslip_${month}.pdf`;
            link.click();
    
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
            setSuccessMessage('Payslip submitted successfully!');
        } catch (error) {
            console.error('Error submitting payslip: ', error);
        }
    };
    

    
    return (
        <div className="admin-payslip-container">
        <AdminDashboard onToggleSidebar={setCollapsed} />
        <div className={`admin-payslip-content ${collapsed ? 'collapsed' : ''}`}>
    
            {/* <h2>Attendance Count</h2> */}
            <select value={selectedEmployeeId} onChange={handleEmployeeSelect}>
                <option value="">Select Employee ID</option>
                {users.map(user => (
                    <option key={user.id} value={user.id}>{user.staffId}</option>
                ))}
            </select>
    
            {selectedEmployee && (
                <form onSubmit={handleSubmit}>
                    <div className="employee-details mt-3">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="employeeName">Employee Name:</label>
                                <input
                                    type="text"
                                    id="employeeName"
                                    className="form-control"
                                    value={selectedEmployee.name}
                                    disabled
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="role">Role:</label>
                                <input
                                    type="text"
                                    id="role"
                                    className="form-control"
                                    value={selectedEmployee.role}
                                    disabled
                                />
                            </div>
                        </div>
    
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="email">Email:</label>
                                <input
                                    type="email"
                                    id="email"
                                    className="form-control"
                                    value={selectedEmployee.email}
                                    disabled
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="month">Month:</label>
                                <input
                                    type="month"
                                    id="month"
                                    className="form-control"
                                    value={month}
                                    onChange={handleMonthChange}
                                />
                            </div>
                        </div>
    
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="amount">Amount:</label>
                                <input
                                    type="number"
                                    id="amount"
                                    className="form-control"
                                    value={amount}
                                    onChange={handleAmountChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="deductionAmount">Deduction Amount:</label>
                                <input
                                    type="number"
                                    id="deductionAmount"
                                    className="form-control"
                                    value={deductionAmount}
                                    disabled
                                />
                            </div>
                        </div>
    
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="amountReceived">Amount Received:</label>
                                <input
                                    type="number"
                                    id="amountReceived"
                                    className="form-control"
                                    value={amountReceived}
                                    disabled
                                />
                            </div>
                        </div>
    
                    </div>
    
                    <button type="submit" className="btn btn-primary">Generate Payslip</button>
                </form>
            )}
    
            {successMessage && <p>{successMessage}</p>}

            <PayslipTable />

        </div>
    </div>
    
    );
};

export default Payslips;







