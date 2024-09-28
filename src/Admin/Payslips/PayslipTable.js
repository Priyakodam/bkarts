import React, { useEffect, useState } from 'react';
import { db } from '../../FirebaseConfig/Firebaseconfig';
import { collection, getDocs } from 'firebase/firestore';
import './PayslipTable.css'; // Create and style this file as needed

const PayslipTable = () => {
    const [payslips, setPayslips] = useState([]);

    const fetchPayslipData = async () => {
        try {
            const payslipCollection = collection(db, 'payslips');
            const payslipSnapshot = await getDocs(payslipCollection);
            const payslipData = [];

            payslipSnapshot.docs.forEach(doc => {
                const data = doc.data();
                for (const month in data) {
                    if (data.hasOwnProperty(month)) {
                        payslipData.push({
                            id: doc.id,
                            ...data[month], // Spread the payslip data for the month
                        });
                    }
                }
            });

            setPayslips(payslipData);
        } catch (error) {
            console.error('Error fetching payslip data: ', error);
        }
    };

    useEffect(() => {
        fetchPayslipData();
    }, []);



    return (
        <div className="payslip-table">
            <h2>Payslip Details</h2>
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
                                        <a href={payslip.pdfUrl} target="_blank" rel="noopener noreferrer" className="checkin-image-link">
                                            View Image
                                        </a>
                                    ) : 'N/A'}
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
        </div>
    );
};

export default PayslipTable;
