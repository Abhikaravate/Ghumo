// const firebaseConfig = {
//   apiKey: "AIzaSyB6fz4cQbh9IS2kX_WcqOTQDHFATBJcNfc",
//   authDomain: "ghumo-349cf.firebaseapp.com",
//   projectId: "ghumo-349cf",
//   storageBucket: "ghumo-349cf.appspot.com",
//   messagingSenderId: "209647680828",
//   appId: "1:209647680828:web:a4888f5f5c957b7c7c7239",
//   measurementId: "G-QMPE99WYYZ"
// };



import React, { useState, useEffect, useRef } from 'react';
import { initializeApp, getApps, getApp } from "firebase/app";
// To make this component runnable in isolation, we'll comment out the router
import { useNavigate } from 'react-router-dom';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { User, Mail, Lock, Phone, MessageSquare, Image as ImageIcon } from 'lucide-react';

// --- IMPORTANT SECURITY NOTE ---
// It's not recommended to expose your Firebase config keys directly in the source code.
// Use environment variables (.env file) to store them securely.
const firebaseConfig = {
  apiKey: "AIzaSyB6fz4cQbh9IS2kX_WcqOTQDHFATBJcNfc",
  authDomain: "ghumo-349cf.firebaseapp.com",
  projectId: "ghumo-349cf",
  storageBucket: "ghumo-349cf.appspot.com",
  messagingSenderId: "209647680828",
  appId: "1:209647680828:web:a4888f5f5c957b7c7c7239",
  measurementId: "G-QMPE99WYYZ"
};

// Initialize Firebase safely to prevent "duplicate app" errors
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// --- STYLES (UI/UX Expert Makeover) ---
const styles = {
  page: (isDarkMode, bgImage) => ({
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: "'Poppins', sans-serif",
    position: 'relative',
    overflow: 'hidden',
    backgroundImage: `url('/asset/Gemini_Generated_Image_7tptrc7tptrc7tpt.png')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transition: 'background-image 0.5s ease-in-out',
    filter: 'brightness(80%)',
  }),
  authContainer: (isDarkMode) => ({
    width: '420px',
    padding: '40px',
    // Warmer glass tone for dark mode to match the wood
    backgroundColor: isDarkMode ? 'rgba(70, 70, 70, 0.38)' : 'rgba(255, 255, 255, 0.58)',
    backdropFilter: 'blur(5px) saturate(10%)',
    WebkitBackdropFilter: 'blur(10px) saturate(40%)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: `inset 0 0 1px 1px rgba(255, 255, 255, 0.08), 0 8px 32px 0 rgba(0, 0, 0, 0.25)`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transition: 'all 0.3s ease',
  }),
  toggleContainer: (isDarkMode) => ({
    display: 'flex',
    // Using a warmer, darker tone for the container
    backgroundColor: isDarkMode ? 'rgba(40, 30, 25, 0.6)' : 'rgba(0, 0, 0, 0.05)',
    borderRadius: '9999px',
    padding: '5px',
    marginBottom: '25px',
  }),
  toggleButton: (isActive, isDarkMode) => ({
    padding: '10px 25px',
    border: 'none',
    borderRadius: '9999px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    // Using green from the calendar for the active state
    backgroundColor: isActive ? '#5D9C5D' : 'transparent',
    color: isActive ? '#FFFFFF' : (isDarkMode ? '#D1C7C2' : '#5A4A42'),
    textShadow: isActive ? '0 0 5px rgba(255,255,255,0.2)' : 'none',
  }),
  formSection: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  title: (isDarkMode) => ({
    fontWeight: '700',
    fontSize: '2.2rem',
    color: isDarkMode ? '#FFF' : '#2C221F',
    marginBottom: '20px',
    //textShadow: isDarkMode ? '0 1px 3px rgba(0,0,0,0.5)' : 'none',
  }),
  inputContainer: (isDarkMode) => ({
    display: 'flex',
    alignItems: 'center',
    // Warmer background for inputs
    backgroundColor: isDarkMode ? 'rgba(60, 50, 45, 0.5)' : 'rgba(255, 255, 255, 0.5)',
    borderRadius: '8px',
    width: '100%',
    padding: '0 15px',
    marginBottom: '12px',
    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(209, 213, 219, 0.8)'}`,
    transition: 'box-shadow 0.2s ease',
  }),
  input: (isDarkMode) => ({
    width: '100%',
    padding: '14px 10px',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    fontSize: '1rem',
    placeholder: {
      fontcolor: isDarkMode ? '#bbb9b9ff' : '#4B5563',
    fontFamily: "'Poppins', sans-serif",
    },
    fontcolor: isDarkMode ? '#202020ff' : '#4B5563',
    fontFamily: "'Poppins', sans-serif",
    color: isDarkMode ? '#FFF' : '#2C221F',
  }),
  submitButton: {
    width: '100%',
    padding: '14px',
    // Using maroon from the passport as the primary action color
    backgroundColor: '#3a9835ff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '15px',
    transition: 'all 0.2s ease-in-out',
    // Matching shadow color to the new button color
    boxShadow: '0 4px 15px rgba(140, 58, 58, 0.35)',
  },
  errorText: { color: '#F87171', fontSize: '0.9rem', marginBottom: '10px', minHeight: '1.2em', fontWeight: '500' },
  socialContainer: (isDarkMode) => ({ margin: '25px 0', width: '100%', color: isDarkMode ? '#D1C7C2' : '#4B5563' }),
  socialButtonsWrapper: { display: 'flex', justifyContent: 'center', gap: '15px' },
  socialButton: (isDarkMode) => ({
    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
    borderRadius: '50%',
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '45px',
    width: '45px',
    cursor: 'pointer',
    backgroundColor: isDarkMode ? 'rgba(60, 50, 45, 0.5)' : 'rgba(255, 255, 255, 0.4)',
    transition: 'all 0.3s ease',
    fontSize: '1.2rem',
    color: isDarkMode ? '#E5E7EB' : '#374151',
  }),
  infoText: (isDarkMode) => ({ color: isDarkMode ? '#CBD5E1' : '#555', fontSize: '0.9rem', marginBottom: '15px' }),
  linkButton: { 
    background: 'none', 
    border: 'none', 
    // Matching the link color to the primary button color
    color: '#8C3A3A', 
    cursor: 'pointer', 
    marginTop: '20px', 
    fontSize: '0.9rem', 
    fontWeight: '600' 
  },
  bgUploader: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 100,
  },
  bgUploaderLabel: (isDarkMode) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '50px',
    height: '50px',
    backgroundColor: isDarkMode ? 'rgba(40, 30, 25, 0.6)' : 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(15px)',
    borderRadius: '50%',
    border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.4)'}`,
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    cursor: 'pointer',
    color: isDarkMode ? '#E5E7EB' : '#374151',
    transition: 'all 0.3s ease',
  }),
};


function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const navigate = useNavigate(); // Defaulting to dark mode for aesthetics
  // const navigate = useNavigate(); // Requires Router context

  // State for background image
  const [backgroundImage, setBackgroundImage] = useState('https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop');
  const fileInputRef = useRef(null);
  
//  const saveUserLocally = async (user) => {
  const saveUserLocally = (user) => {
  try {
    // 1. Create the user data object you want to save
    const userData = {
      id: user.uid,
      name: user.displayName,
      email: user.email,
      avatarUrl: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`
    };

    // 2. Convert the object to a JSON string and save it to localStorage
    localStorage.setItem('currentUser', JSON.stringify(userData));
    console.log("User data saved to localStorage successfully! ✅");

  } catch (error) {
    console.error("Failed to save user to localStorage:", error);
  }
};
  const [authMode, setAuthMode] = useState('email'); 
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isOtpSent, setIsOtpSent] = useState(false);

  // Effect to check user's system preference for dark mode
  useEffect(() => {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);

  // Effect to listen for auth state changes
 useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        localStorage.setItem('userDisplayName', user.displayName);
        localStorage.setItem('userPhotoURL', user.photoURL);
        localStorage.setItem('userEmail', user.email);
        navigate('/home');
      }
    });
    return () => unsubscribe();
  }, [navigate]); // Add navigate back if you use it
  
  // Function to handle background image selection
  const handleImageChange = (e) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          // Create a URL for the local file to use in the background
          const newImageUrl = URL.createObjectURL(file);
          setBackgroundImage(newImageUrl);
      }
  };

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => console.log("reCAPTCHA verified"),
      });
    }
  }

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setError('');
    if (!name) {
        setError("Please enter your name.");
        return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      await saveUserLocally({ ...userCredential.user, displayName: name });
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    }
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      await saveUserLocally(userCredential.user);
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    }
  };

  const handlePhoneSignIn = async (e) => {
    e.preventDefault();
    setError('');
    if (!phone || phone.length < 10) {
        setError("Please enter a valid 10-digit phone number.");
        return;
    }
    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      // Assuming Indian phone numbers for this example
      const formattedPhone = `+91${phone}`; 
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setIsOtpSent(true);
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    }
  };
  
  const handleVerifyOtp = async (e) => {
      e.preventDefault();
      setError('');
      if (!otp || otp.length < 6) {
          setError("Please enter the 6-digit OTP.");
          return;
      }
      try {
          await confirmationResult.confirm(otp);
      } catch (err) {
          setError(err.message.replace('Firebase: ', ''));
      }
  }

  const clearForm = () => {
    setName(''); setEmail(''); setPassword(''); setPhone(''); setOtp(''); setError('');
    setConfirmationResult(null); setIsOtpSent(false);
  };

  const switchAuthMode = (mode) => {
    clearForm();
    if (mode === 'email') {
        setIsSignUp(false);
    }
    setAuthMode(mode);
  }

  const socialLogins = (
    <div style={styles.socialContainer(isDarkMode)}>
      <p>Or continue with</p>
      <div style={styles.socialButtonsWrapper}>
        <button type="button" onClick={handleGoogleSignIn} style={styles.socialButton(isDarkMode)} title="Continue with Google">
            <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{width: 20, height: 20}}><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.36 1.84-4.06 1.84-4.81 0-8.73-3.88-8.73-8.73s3.92-8.73 8.73-8.73c2.83 0 4.51 1.05 5.54 2.02l3.18-3.18C18.27 1.2 15.76 0 12.48 0 5.88 0 .02 5.88.02 12.48s5.86 12.48 12.46 12.48c3.37 0 6.01-1.12 7.99-3.1 2.1-2.1 2.83-5.18 2.83-7.78-.01-.65-.07-1.3-.18-1.92H12.48z" fill="currentColor"/></svg>
        </button>
        <button type="button" onClick={() => switchAuthMode('phone')} style={styles.socialButton(isDarkMode)} title="Continue with Phone">
            <Phone size={20} />
        </button>
      </div>
    </div>
  );

  const renderFormContent = () => {
    if (authMode === 'phone') {
      return (
        <form style={styles.formSection} onSubmit={isOtpSent ? handleVerifyOtp : handlePhoneSignIn}>
            <h2 style={styles.title(isDarkMode)}>Sign In with Phone</h2>
            {error && <p style={styles.errorText}>{error}</p>}
            {!isOtpSent ? (
                <>
                    <p style={styles.infoText(isDarkMode)}>Enter your phone number to receive an OTP.</p>
                    <div style={styles.inputContainer(isDarkMode)}><Phone size={20} color={isDarkMode ? '#A5B4FC' : '#4F46E5'} /><input type="tel" placeholder="10-digit number" style={styles.input(isDarkMode)} value={phone} onChange={(e) => setPhone(e.target.value)} required /></div>
                    <button type="submit" style={styles.submitButton}>Send OTP</button>
                </>
            ) : (
                <>
                    <p style={styles.infoText(isDarkMode)}>Enter the OTP sent to +91 {phone}.</p>
                    <div style={styles.inputContainer(isDarkMode)}><MessageSquare size={20} color={isDarkMode ? '#A5B4FC' : '#4F46E5'} /><input type="text" placeholder="6-Digit OTP" style={styles.input(isDarkMode)} value={otp} onChange={(e) => setOtp(e.target.value)} required /></div>
                    <button type="submit" style={styles.submitButton}>Verify OTP</button>
                </>
            )}
            <button type="button" onClick={() => switchAuthMode('email')} style={styles.linkButton}>Use Email Instead</button>
        </form>
      );
    }
    
    if (isSignUp) {
      return (
        <form style={styles.formSection} onSubmit={handleEmailSignUp}>
          <h2 style={styles.title(isDarkMode)}>Create Account</h2>
          {error && <p style={styles.errorText}>{error}</p>}
          <div style={styles.inputContainer(isDarkMode)}><User size={20} color={isDarkMode ? '#A5B4FC' : '#4F46E5'} /><input type="text" placeholder="Name" style={styles.input(isDarkMode)} value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <div style={styles.inputContainer(isDarkMode)}><Mail size={20} color={isDarkMode ? '#A5B4FC' : '#4F46E5'} /><input type="email" placeholder="Email" style={styles.input(isDarkMode)} value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div style={styles.inputContainer(isDarkMode)}><Lock size={20} color={isDarkMode ? '#A5B4FC' : '#4F46E5'} /><input type="password" placeholder="Password" style={styles.input(isDarkMode)} value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          <button type="submit" style={styles.submitButton}>Sign Up</button>
          {socialLogins}
        </form>
      );
    }

    return (
      <form style={styles.formSection} onSubmit={handleEmailSignIn}>
        <h2 style={styles.title(isDarkMode)}>Welcome Back!</h2>
        {error && <p style={styles.errorText}>{error}</p>}
        <div style={styles.inputContainer(isDarkMode)}><Mail size={20} color={isDarkMode ? '#A5B4FC' : '#4F46E5'} /><input type="email" placeholder="Email" style={styles.input(isDarkMode)} value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div style={styles.inputContainer(isDarkMode)}><Lock size={20} color={isDarkMode ? '#A5B4FC' : '#4F46E5'} /><input type="password" placeholder="Password" style={styles.input(isDarkMode)} value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        <button type="submit" style={styles.submitButton}>Sign In</button>
        {socialLogins}
      </form>
    );
  };

  return (
    <div style={styles.page(isDarkMode, backgroundImage)}>
      <div id="recaptcha-container" style={{ position: 'absolute' }}></div>
      <div style={styles.authContainer(isDarkMode)}>
        <div style={styles.toggleContainer(isDarkMode)}>
          <button onClick={() => { setIsSignUp(false); clearForm(); }} style={styles.toggleButton(!isSignUp, isDarkMode)}>Sign In</button>
          <button onClick={() => { setIsSignUp(true); clearForm(); }} style={styles.toggleButton(isSignUp, isDarkMode)}>Sign Up</button>
        </div>
        {renderFormContent()}
      </div>
      
      {/* Background Image Uploader */}
      <div style={styles.bgUploader}>
          <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: 'none' }} 
              id="bg-upload-input"
          />
          <label htmlFor="bg-upload-input" style={styles.bgUploaderLabel(isDarkMode)} title="Change Background Image">
              <ImageIcon size={24} />
          </label>
      </div>

    </div>
  );
}

export default AuthPage;
