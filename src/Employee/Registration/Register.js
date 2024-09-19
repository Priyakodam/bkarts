import React, { useState, useEffect } from 'react';
import { db } from "../../FirebaseConfig/Firebaseconfig";
import { getAuth, fetchSignInMethodsForEmail } from 'firebase/auth';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import logo from "../../Img/Company_logo.png";
import "./Register.css";

const SignUp = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [role, setRole] = useState('');
  const [project, setProject] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleNameChange = (e) => {
    const value = e.target.value;
    if (/^[a-zA-Z\s]*$/.test(value) && value.length <= 50) {
      setName(value);
    }
  };

  const handleMobileNumberChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,10}$/.test(value)) {
      setMobileNumber(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const auth = getAuth();

      // Check if the email exists in Firebase Authentication
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        throw new Error('The email is already in use in Firebase Authentication.');
      }

      // Check if the email exists in Firestore
      const usersCollection = collection(db, 'users');
      const emailQuery = query(usersCollection, where('email', '==', email));
      const mobileQuery = query(usersCollection, where('mobileNumber', '==', mobileNumber));

      const [emailSnapshot, mobileSnapshot] = await Promise.all([
        getDocs(emailQuery),
        getDocs(mobileQuery),
      ]);

      // If email exists in Firestore, show an error
      if (!emailSnapshot.empty) {
        throw new Error('The email is already in use.');
      }

      // If mobile number exists in Firestore, show an error
      if (!mobileSnapshot.empty) {
        throw new Error('The mobile number is already in use.');
      }

      // Add the user to Firestore
      await addDoc(collection(db, 'users'), {
        name,
        email,
        mobileNumber,
        role:'Employee',
        createdAt: new Date(),
      });

      // Reset form fields and show success message
      setName('');
      setEmail('');
      setMobileNumber('');
      setRole('');
      setProject('');
      setError('');
      setIsSubmitting(false);

      alert('You have registered successfully!');
      navigate('/');
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  const canSubmit = name.trim() !== '' && email.trim() !== '' && mobileNumber.trim() !== '';

  return (
    <div className="d-flex justify-content-center align-items-center mt-2 pt-5">
      <div className="card" style={{ width: '36rem' }}>
        <div className="card-body">
          <div className="text-center mb-4">
            <img src={logo} alt="Logo" className="mb-2" style={{ width: '250px', height: '100px' }} />
            <h3>Register</h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-1">
              <label htmlFor="name" style={{ fontWeight: 'bold' }}>Name</label><br/>
              <input
                type="text"
                className="input-register-name mt-1"
                id="name"
                placeholder="Enter Your Name"
                value={name}
                onChange={handleNameChange}
                required
              />
            </div>
            <div className="mb-1">
              <label htmlFor="email" style={{ fontWeight: 'bold' }}>Email</label><br/>
              <input
                type="email"
                className="input-register-email mt-1"
                id="email"
                placeholder="Enter Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-1">
              <label htmlFor="mobileNumber" style={{ fontWeight: 'bold' }}>Mobile Number</label><br/>
              <input
                type="tel"
                className="input-register-mobileNo mt-1"
                id="mobileNumber"
                placeholder="Enter Your Mobile Number"
                value={mobileNumber}
                onChange={handleMobileNumberChange}
                required
                minLength="10"
              />
            </div>
           
            {error && <div className="text-danger text-center">{error}</div>}
            <div className="text-center">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? 'Registering...' : 'Register'}
              </button>
            </div>

            <div className="text-center mt-2">
              <p>
                Already have an account? Please
                <strong>
                  <a
                    onClick={() => navigate('/')}
                    style={{ textDecoration: 'none', color: '#007bff', cursor: 'pointer', padding: '0' }}
                  >
                    &nbsp;Login
                  </a>
                </strong>
                &nbsp;here
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
