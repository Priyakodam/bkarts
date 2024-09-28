// AddPayslipModal.js
import React from 'react';
import './AddPayslipModal.css'; // Make sure to style your modal

const AddPayslipModal = ({ showModal, onClose, users, selectedEmployee, setSelectedEmployee, selectedEmployeeId, setSelectedEmployeeId, month, setMonth, amount, setAmount, handleSubmit }) => {
    return (
        <div className={`modal ${showModal ? 'show' : ''}`} onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <span className="close" onClick={onClose}>&times;</span>
                <h2>Add Payslip</h2>
                <select value={selectedEmployeeId} onChange={(e) => {
                    const employeeId = e.target.value;
                    const employee = users.find(user => user.id === employeeId);
                    setSelectedEmployee(employee || null);
                    setSelectedEmployeeId(employeeId);
                }}>
                    <option value="">Select Employee ID</option>
                    {users.map(user => (
                        <option key={user.id} value={user.id}>{user.staffId}</option>
                    ))}
                </select>
                
                {selectedEmployee && (
                    <form onSubmit={handleSubmit}>
                        <div className="employee-details mt-3">
                            {/* Copy the form structure here */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="employeeName">Employee Name:</label>
                                    <input type="text" id="employeeName" className="form-control" value={selectedEmployee.name} disabled />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="role">Role:</label>
                                    <input type="text" id="role" className="form-control" value={selectedEmployee.role} disabled />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="email">Email:</label>
                                    <input type="email" id="email" className="form-control" value={selectedEmployee.email} disabled />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="month">Month:</label>
                                    <input type="month" id="month" className="form-control" value={month} onChange={(e) => setMonth(e.target.value)} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="amount">Amount:</label>
                                    <input type="number" id="amount" className="form-control" value={amount} onChange={(e) => setAmount(e.target.value)} />
                                </div>
                            </div>

                            
                            {/* Other fields can go here */}
                        </div>
                        <button type="submit" className="btn btn-primary">Generate Payslip</button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AddPayslipModal;
