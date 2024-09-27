import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
  },
  companyDetails: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 15,
  },
  section: {
    marginBottom: 10,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCol: {
    borderStyle: 'solid',
    borderWidth: 1,
    flexGrow: 1,
    textAlign: 'center',
    padding: 5,
  },
  tableCellHeader: {
    backgroundColor: '#d3d3d3',
    fontWeight: 'bold',
  },
  tableCell: {
    padding: 5,
    fontSize: 10,
  },
  total: {
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'right',
    paddingRight: 15,
    marginTop: 5,
  },
});

const PayslipPDF = ({ employeeDetails, earnings }) => {
  return (
    <Document>
      <Page style={styles.page}>
        {/* Title */}
        <Text style={styles.title}>Payslip</Text>

        {/* Company Details */}
        <View style={styles.companyDetails}>
          <Text>Zoonodle Inc</Text>
          <Text>21023 Pearson Point Road</Text>
          <Text>Gateway Avenue</Text>
        </View>

        {/* Employee and Pay Details */}
        <View style={styles.section}>
          <Text>Date of Joining: {employeeDetails.dateOfJoining}</Text>
          <Text>Employee name: {employeeDetails.name}</Text>
          <Text>Pay Period: {employeeDetails.payPeriod}</Text>
          <Text>Worked Days: {employeeDetails.workedDays}</Text>
          <Text>Designation: {employeeDetails.designation}</Text>
          <Text>Department: {employeeDetails.department}</Text>
        </View>

        {/* Earnings Table */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, styles.tableCellHeader]}>
              <Text>Earnings</Text>
            </View>
            <View style={[styles.tableCol, styles.tableCellHeader]}>
              <Text>Amount</Text>
            </View>
          </View>

          {earnings.map((earning, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{earning.type}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{earning.amount}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Total Earnings */}
        <Text style={styles.total}>
          Total Earnings: {earnings.reduce((total, item) => total + item.amount, 0)}
        </Text>
      </Page>
    </Document>
  );
};

export default PayslipPDF;
