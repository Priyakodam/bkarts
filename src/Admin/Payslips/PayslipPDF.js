





// import React from 'react';
// import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'; // Import react-pdf
// import logo from './logo/bk-logo.jpg'; // Adjust the path as needed

// const PayslipPDF = ({ selectedEmployee, presentCount, month, amount, amountReceived, deductionAmount }) => (
//     <Document>
//         <Page style={styles.page}>
//             {/* Title Section */}
//             <View style={styles.header}>
//                 <Text style={styles.title}>PaySlip</Text>
//                 <Image style={styles.logo} src={logo} /> {/* Display the company logo */}
//                 <Text style={styles.address}>123 Business Avenue</Text>
//                 <Text style={styles.address}>City, Country, ZIP</Text>
//             </View>

//             {/* Employee Details in Two Columns */}
//             <View style={styles.detailsRow}>
//                 {/* Left Column */}
//                 <View style={styles.column}>
//                     <View style={styles.row}>
//                         <Text style={styles.label}>Employee ID:</Text>
//                         <Text style={styles.data}>{selectedEmployee?.staffId || 'N/A'}</Text>
//                     </View>
//                     <View style={styles.row}>
//                         <Text style={styles.label}>Email:</Text>
//                         <Text style={styles.data}>{selectedEmployee?.email || 'N/A'}</Text>
//                     </View>
//                     <View style={styles.row}>
//                         <Text style={styles.label}>Month:</Text>
//                         <Text style={styles.data}>{month}</Text>
//                     </View>
//                 </View>

//                 {/* Right Column */}
//                 <View style={styles.column}>
//                     <View style={styles.row}>
//                         <Text style={styles.label}>Employee Name:</Text>
//                         <Text style={styles.data}>{selectedEmployee?.name || 'N/A'}</Text>
//                     </View>
//                     <View style={styles.row}>
//                         <Text style={styles.label}>Role:</Text>
//                         <Text style={styles.data}>{selectedEmployee?.role || 'N/A'}</Text>
//                     </View>
//                     <View style={styles.row}>
//                         <Text style={styles.label}>Total Days Present:</Text>
//                         <Text style={styles.data}>{presentCount}</Text>
//                     </View>
//                 </View>
//             </View>

//             {/* Amount Section */}
//             <Text style={styles.boldText}>Salary Details</Text>
//             <View style={styles.horizontalLine} />

//             <View style={styles.row}>
//                 <Text style={styles.label}>Principal Amount:</Text>
//                 <Text style={styles.data}>{amount}</Text>
//             </View>

         
//             <View style={styles.row}>
//                 <Text style={styles.label}>Deduction Amount:</Text>
//                 <Text style={styles.data}>{deductionAmount}</Text>
//             </View>
          

//             <View style={styles.horizontalLine} />

//             <View style={styles.row}>
//                 <Text style={styles.label}>Amount Received:</Text>
//                 <Text style={styles.data}>{amountReceived}</Text>
//             </View>
//             <View style={styles.horizontalLine} />

           
//         </Page>
//     </Document>
// );

// const styles = StyleSheet.create({
//     page: {
//         padding: 30,
//     },
//     header: {
//         textAlign: 'center',
//         marginBottom: 20,
//     },
//     title: {
//         fontSize: 20,
//         fontWeight: 'bold',
//         marginBottom: 6,
//     },
//     logo: {
//         width: 100,
//         height: 40,
//         marginBottom: 6,
//         alignSelf: 'center',
//     },
//     address: {
//         fontSize: 12,
//         color: '#555',
//     },
//     detailsRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginTop: 20,
//     },
//     column: {
//         width: '48%',
//     },
//     row: {
//         flexDirection: 'row',
//         marginBottom: 10,
//     },
//     label: {
//         fontSize: 14,
//         fontWeight: 'bold',
//     },
//     data: {
//         fontSize: 14,
//         color: '#777',
//         marginLeft: 10,
//     },
//     boldText: {
//         fontSize: 16,
//         fontWeight: 'bold',
//         marginTop: 20,
//         marginBottom: 10,
//         textAlign: 'center',
//     },
//     horizontalLine: {
//         borderBottomColor: '#000',
//         borderBottomWidth: 1,
//         marginBottom: 10,
//     },
// });

// export default PayslipPDF;




import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import logo from './../../Img/bkarts.jpg'; // Adjust the path as needed

const PayslipPDF = ({ selectedEmployee, presentCount, month, amount, amountReceived, deductionAmount }) => (
    <Document>
        <Page style={styles.page}>
            {/* Title Section with Logo */}
            <View style={styles.header}>
            <Text style={styles.companyName}>BK-ARTS</Text>
                <Image style={styles.logo} src={logo} />
                <Text style={styles.address}>123 Business Avenue, City, Country, ZIP</Text>
            </View>

            {/* Document Title */}
            <View style={styles.titleSection}>
                <Text style={styles.title}>PaySlip for {month}</Text>
            </View>

            {/* Employee Details Section */}
            <View style={styles.detailsSection}>
                <Text style={styles.sectionTitle}>Employee Details</Text>
                <View style={styles.detailsRow}>
                    {/* Left Column */}
                    <View style={styles.column}>
                        <View style={styles.row}>
                            <Text style={styles.label}>Employee ID:</Text>
                            <Text style={styles.data}>{selectedEmployee?.staffId || 'N/A'}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Email:</Text>
                            <Text style={styles.data}>{selectedEmployee?.email || 'N/A'}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Month:</Text>
                            <Text style={styles.data}>{month}</Text>
                        </View>
                    </View>

                    {/* Right Column */}
                    <View style={styles.column}>
                        <View style={styles.row}>
                            <Text style={styles.label}>Employee Name:</Text>
                            <Text style={styles.data}>{selectedEmployee?.name || 'N/A'}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Role:</Text>
                            <Text style={styles.data}>{selectedEmployee?.role || 'N/A'}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Total Days Present:</Text>
                            <Text style={styles.data}>{presentCount}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Enhanced Salary Details Section */}
            <View style={styles.salarySection}>
                <Text style={styles.sectionTitle}>Salary Details</Text>
                <View style={styles.salaryTable}>
                    <View style={styles.salaryRow}>
                        <Text style={styles.salaryLabel}>Principal Amount:</Text>
                        <Text style={styles.salaryData}>{amount}</Text>
                    </View>
                    <View style={styles.salaryRow}>
                        <Text style={styles.salaryLabel}>Deduction Amount:</Text>
                        <Text style={styles.salaryData}>{deductionAmount}</Text>
                    </View>
                    <View style={styles.salaryRow}>
                        <Text style={styles.salaryLabel}>Amount Received:</Text>
                        <Text style={styles.salaryData}>{amountReceived}</Text>
                    </View>
                </View>
            </View>

            {/* Footer Section */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>This is a system-generated payslip and does not require a signature.</Text>
            </View>
        </Page>
    </Document>
);

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica',
        fontSize: 12,
        backgroundColor: '#f5f5f5',
    },
    header: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#ddd',
    },
    logo: {
        width: 100,
        height: 40,
        marginBottom: 6,
    },
    companyName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    address: {
        fontSize: 12,
        color: '#666',
    },
    titleSection: {
        textAlign: 'center',
        marginVertical: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    detailsSection: {
        marginVertical: 10,
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 8,
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#444',
        marginBottom: 10,
        textAlign: 'left',
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    column: {
        width: '48%',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
    },
    data: {
        fontSize: 12,
        color: '#555',
    },
    salarySection: {
        marginVertical: 20,
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 8,
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    },
    salaryTable: {
        border: '1px solid #ddd',
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#f9f9f9',
    },
    salaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    salaryLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    salaryData: {
        fontSize: 14,
        color: '#333',
    },
    footer: {
        marginTop: 30,
        paddingTop: 10,
        textAlign: 'center',
        borderTop: '1px solid #ddd',
    },
    footerText: {
        fontSize: 12,
        color: '#777',
    },
});

export default PayslipPDF;
