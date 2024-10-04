import React, { useEffect, useState } from 'react';
import { db } from '../../FirebaseConfig/Firebaseconfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import EmployeeDashboard from '../EmployeeDashboard/EmployeeDashboard';
import { useAuth } from '../../Context/AuthContext';

const EmployeePayslipTable = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [payslips, setPayslips] = useState([]);
    const { user } = useAuth(); // Get current authenticated user
    const [loading, setLoading] = useState(true);

    // Function to fetch payslips based on the logged-in user's uid
    const fetchPayslipData = async () => {
        if (user && user.uid) {  // Ensure the user is authenticated and has a uid
            try {
                const payslipCollection = collection(db, 'payslips');
                const payslipDocRef = query(payslipCollection, where('__name__', '==', user.uid));  // Query to get the document with the ID that matches user.uid
                
                const payslipSnapshot = await getDocs(payslipDocRef);

                const payslipData = [];

                payslipSnapshot.docs.forEach(doc => {
                    const data = doc.data();
                    // Iterate through all the months (keys) in the document
                    for (const month in data) {
                        if (data.hasOwnProperty(month)) {
                            payslipData.push({
                                id: doc.id,
                                ...data[month], // Spread the payslip data for each month
                            });
                        }
                    }
                });

                setPayslips(payslipData); // Set state with the fetched payslip data
                setLoading(false); // Set loading to false after data is fetched
            } catch (error) {
                console.error('Error fetching payslip data: ', error);
                setLoading(false); // Stop loading even on error
            }
        }
    };

    useEffect(() => {
        fetchPayslipData(); // Fetch payslip data when the component mounts or when the user changes
    }, [user]);

    return (
        <div className="calendar-container">
            <EmployeeDashboard />
            <div className={`calendar-content ${collapsed ? "collapsed" : ""}`}>
                <div className="payslip-table">
                    <h2>Payslip Details</h2>
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Serial No</th>
                                    <th>Emp ID</th>
                                    <th>Emp Name</th>
                                    <th>Emp Email</th>
                                    <th>Payslip</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payslips.length > 0 ? (
                                    payslips.map((payslip, index) => (
                                        <tr key={payslip.id}>
                                            <td>{index + 1}</td>
                                            <td>{payslip.staffId}</td>
                                            <td>{payslip.employeeName}</td>
                                            <td>{payslip.email}</td>
                                            <td>
                                                {payslip.pdfUrl ? (
                                                    <a
                                                        href={payslip.pdfUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="checkin-image-link"
                                                    >
                                                        View Payslip
                                                    </a>
                                                ) : (
                                                    'N/A'
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5">No payslips available.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmployeePayslipTable;
