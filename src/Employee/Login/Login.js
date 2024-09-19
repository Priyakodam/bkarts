import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, db } from "../../FirebaseConfig/Firebaseconfig";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from "../../Context/AuthContext";
import logo from "../../Img/Company_logo.png";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();

          // Check if the user is already logged in from another device
          if (userData.loggedIn) {
            // Log out the user from any previous sessions
            await updateDoc(userDocRef, { loggedIn: false });
          }

          // Set loggedIn to true for the new session
          await updateDoc(userDocRef, { loggedIn: true });

          // Store user session data in context or state
          login({
            uid: user.uid,
            email: user.email,
            name: userData.name || 'No name provided',
            role: userData.role,
            sessionId: user.uid, // Could use something unique for different devices
          });

          // Handle role-based navigation
          switch (userData.role) {
            case 'Employee':
              if (userData.firstLogin === undefined || userData.firstLogin === true) {
                await updateDoc(userDocRef, { firstLogin: false });
                navigate('/e-profile');
              } else {
                navigate('/e-attendance');
              }
              break;


            default:
              setError('Invalid role. Please contact support.');
          }
        } else {
          setError('User data not found.');
        }
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = email.trim() !== '' && password.trim() !== '';

  return (
    <div className="d-flex justify-content-center align-items-center mt-5 pt-5">
      <div className="card" style={{ width: '36rem' }}>
        <div className="card-body">
          <div className="text-center mb-4">
            <img src={logo} alt="Logo" className="mb-2" style={{ width: '250px', height: '100px' }} />
            <h3>Login</h3>
          </div>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="email" style={{ fontWeight: 'bold' }}>Email</label><br />
              <input
                type="email"
                className="input-login-email mt-1"
                id="email"
                placeholder="Enter Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3 position-relative">
              <label htmlFor="password" style={{ fontWeight: 'bold' }}>Password</label><br />
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-login-password mt-1"
                id="password"
                placeholder="Enter Your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
                onClick={togglePasswordVisibility}
                className="position-absolute"
                style={{ right: '10px', top: '46px', cursor: 'pointer' }}
              />
            </div>
            {error && <div className="text-danger text-center">{error}</div>}
            <div className="text-center">
              <button
                type="submit"
                className="btn loginbutton btn-primary"
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
        </div>
        <div className="text-center mt-2">
          <p>
            Don't have an account?
            <strong>
              <a
                onClick={() => navigate('/register')}
                style={{ textDecoration: 'none', color: '#007bff', cursor: 'pointer', padding: '0' }}
              >
                &nbsp;Register
              </a>
            </strong>
            &nbsp;here
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
