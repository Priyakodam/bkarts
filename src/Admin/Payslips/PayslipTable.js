import React, { useEffect, useState } from 'react';
import { db } from '../../FirebaseConfig/Firebaseconfig';
import { collection, getDocs } from 'firebase/firestore';
import './PayslipTable.css'; // Create and style this file as needed

const PayslipTable = () => {
    const [payslips, setPayslips] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('');
    const currentMonth = new Date().toISOString().slice(0, 7); // Format: YYYY-MM
    const maxMonth = currentMonth; // Disable future months

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
        setSelectedMonth(currentMonth); // Set default selected month to current month
    }, [currentMonth]);

    // Filter payslips based on selected month
    const filteredPayslips = selectedMonth
        ? payslips.filter(payslip => payslip.month === selectedMonth)
        : payslips;


        const getMonthName = (monthString) => {
            const date = new Date(`${monthString}-01`); // Create a date object with the first day of the month
            return date.toLocaleString('default', { month: 'long', year: 'numeric' }); // Format to full month name and year
        };

    return (
        <div className="payslip-table">
            <h2 className='text-center'>Payslips for {getMonthName(selectedMonth)}</h2>
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
            <table className='mt-3'>
                <thead>
                    <tr>
                        <th>S.No</th>
                        <th>Emp ID</th>
                        <th>Emp Name</th>
                        <th>Emp Email</th>
                        <th>Payslip</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredPayslips.length > 0 ? (
                        filteredPayslips.map((payslip, index) => (
                            <tr key={payslip.id}>
                                <td>{index + 1}</td>
                                <td>{payslip.staffId}</td>
                                <td>{payslip.employeeName}</td>
                                <td>{payslip.email}</td>
                                <td>
                                    {payslip.pdfUrl ? (
                                        <a href={payslip.pdfUrl} target="_blank" rel="noopener noreferrer" className="checkin-image-link">
                                            View Payslip
                                        </a>
                                    ) : 'N/A'}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5">No payslips available for the selected month.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default PayslipTable;
