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

    // Function to fetch payslips from Firestore based on user.uid
    const fetchPayslips = async () => {
        if (user && user.uid) {
            try {
                const payslipRef = collection(db, 'payslips');
                const q = query(payslipRef, where('2024-09.employeeId', '==', user.uid));
                const querySnapshot = await getDocs(q);

                const payslipData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()['2024-09'], // Accessing the nested '2024-09' data
                }));

                setPayslips(payslipData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching payslips:', error);
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchPayslips();
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
