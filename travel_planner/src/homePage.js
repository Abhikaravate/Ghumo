// src/HomePage.js

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Menu, X, Sun, Moon, MapPin, Wand2, Compass, MessageSquare, SendHorizonal, UserPlus, LogIn, LogOut } from 'lucide-react';
import { getAuth, signOut , onAuthStateChanged } from "firebase/auth";
import { db } from './firebaseConfig'; // 👈 Adjust path to your firebase config
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { saveSearchToHistory, getUserHistory } from './historyService';
import { onHistoryUpdate , unsubscribe } from './historyService';
import {  query, where, onSnapshot, orderBy } from 'firebase/firestore';


// --- STYLES OBJECT (CSS-in-JS) ---
const theme = {
  colors: {
    accent: '#8B5CF6', // A slightly softer violet
    accentHover: '#7C3AED',
    light: {
      bg: '#FFFFFF',
      bgSecondary: '#F9FAFB',
      text: '#111827',
      textSecondary: '#4B5563',
      border: '#E5E7EB',
    },
    dark: {
      bg: '#0D1117', // A deep, modern dark background
      bgSecondary: '#161B22',
      text: '#E6EDF3',
      textSecondary: '#8B949E',
      border: '#30363D',
    }
  },
  fonts: {
    sans: 'Inter, sans-serif',
    display: 'Poppins, sans-serif',
  },
  shadows: {
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  }
};

const styles = {
  // --- Global & Layout Styles ---
  homePage: (isDarkMode) => ({
    backgroundColor: isDarkMode ? theme.colors.dark.bg : theme.colors.light.bg,
    color: isDarkMode ? theme.colors.dark.text : theme.colors.light.text,
    fontFamily: theme.fonts.sans,
    transition: 'background-color 0.3s, color 0.3s',
  }),
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 1.5rem',
  },
  // ENHANCEMENT: Adjusted padding for a more spacious feel.
  section: (isDarkMode, isSecondary = false) => ({
    padding: '5rem 0',
    backgroundColor: isSecondary ? (isDarkMode ? theme.colors.dark.bgSecondary : theme.colors.light.bgSecondary) : 'transparent',
    borderTop: isSecondary ? `1px solid ${isDarkMode ? theme.colors.dark.border : theme.colors.light.border}`: 'none',
  }),
  sectionTitle: (isDesktop) => ({
    fontFamily: theme.fonts.display,
    fontSize: isDesktop ? '2.5rem' : '2rem',
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: '1rem',
  }),
  sectionSubtitle: (isDarkMode) => ({
      marginTop: '1rem',
      fontSize: '1.125rem',
      textAlign: 'center',
      color: isDarkMode ? theme.colors.dark.textSecondary : theme.colors.light.textSecondary,
      maxWidth: '600px',
      margin: '0 auto 3rem auto',
  }),

  // --- Header Styles ---
  header: (isDarkMode) => ({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    // ENHANCEMENT: Increased z-index to ensure it's always above other page content.
    zIndex: 1050,
    transition: 'all 0.3s',
    backdropFilter: 'blur(12px)',
    backgroundColor: isDarkMode ? 'rgba(13, 17, 23, 0.8)' : 'rgba(255, 255, 255, 0.85)',
    borderBottom: `1px solid ${isDarkMode ? theme.colors.dark.border : theme.colors.light.border}`,
  }),
  headerContent: {
    display: 'flex',
    height: '5rem', // Navbar height is 80px
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navLink: (isDarkMode, isHovered) => ({
    fontWeight: 500,
    color: isHovered ? theme.colors.accent : (isDarkMode ? theme.colors.dark.textSecondary : theme.colors.light.textSecondary),
    transition: 'color 0.2s',
    textDecoration: 'none',
    // ENHANCEMENT: Added a subtle underline effect on hover.
    position: 'relative',
    paddingBottom: '4px',
    '::after': {
        content: '""',
        position: 'absolute',
        width: '100%',
        transform: isHovered ? 'scaleX(1)' : 'scaleX(0)',
        height: '2px',
        bottom: 0,
        left: 0,
        backgroundColor: theme.colors.accent,
        transformOrigin: 'bottom right',
        transition: 'transform 0.25s ease-out',
    }
  }),

  // --- Hero & Form Styles ---
  heroSection: {
    position: 'relative',
    // FIX: Adjusted padding to account for the page wrapper's top padding.
    padding: '4rem 0',
    minHeight: 'calc(100vh - 5rem)', // Adjust height based on navbar
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  animatedBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: -1,
    background: `linear-gradient(270deg, #8B5CF6, #EC4899, #F59E0B, #10B981)`,
    backgroundSize: '800% 800%',
    animation: 'gradientAnimation 30s ease infinite',
    opacity: 0.1,
  },
  heroTitle: (isDesktop) => ({
    fontFamily: theme.fonts.display,
    fontSize: isDesktop ? '3.75rem' : '2.5rem',
    fontWeight: 800,
    letterSpacing: '-0.025em',
  }),
  heroFormContainer: (isDarkMode) => ({
    marginTop: '3rem',
    maxWidth: '48rem',
    width: '100%',
    margin: '3rem auto 0 auto',
  }),
  inputWrapper: (isDarkMode, isFocused) => ({
    position: 'relative',
    backgroundColor: isDarkMode ? theme.colors.dark.bgSecondary : theme.colors.light.bg,
    borderRadius: '1.5rem',
    padding: '0.5rem 0.75rem',
    boxShadow: theme.shadows.lg,
    border: '2px solid transparent',
    backgroundImage: isFocused 
        ? `linear-gradient(to right, ${isDarkMode ? theme.colors.dark.bgSecondary : theme.colors.light.bg}, ${isDarkMode ? theme.colors.dark.bgSecondary : theme.colors.light.bg}), linear-gradient(to right, #8B5CF6, #EC4899)`
        : `linear-gradient(to right, ${isDarkMode ? theme.colors.dark.bgSecondary : theme.colors.light.bg}, ${isDarkMode ? theme.colors.dark.bgSecondary : theme.colors.light.bg}), linear-gradient(to right, ${isDarkMode ? theme.colors.dark.border : theme.colors.light.border}, ${isDarkMode ? theme.colors.dark.border : theme.colors.light.border})`,
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
    transition: 'all 0.3s ease-in-out',
  }),
  textarea: (isDarkMode) => ({
    width: 'calc(100% - 50px)',
    minHeight: '60px',
    padding: '1rem',
    fontFamily: theme.fonts.sans,
    fontSize: '1rem',
    color: isDarkMode ? theme.colors.dark.text : theme.colors.light.text,
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    resize: 'vertical',
  }),
  sendButton: (isHovered) => ({
    position: 'absolute',
    right: '1rem',
    bottom: '1rem',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: isHovered ? theme.colors.accentHover : theme.colors.accent,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
  }),
  suggestionTag: (isDarkMode, isHovered) => ({
    padding: '0.5rem 1rem',
    backgroundColor: isHovered ? (isDarkMode ? '#30363D' : '#F3F4F6') : (isDarkMode ? theme.colors.dark.bgSecondary : theme.colors.light.bgSecondary),
    border: `1px solid ${isDarkMode ? theme.colors.dark.border : theme.colors.light.border}`,
    borderRadius: '9999px',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: theme.fonts.display,
    color: isDarkMode ? theme.colors.dark.text : theme.colors.light.text,
  }),
  resultsContainer: (isDarkMode) => ({
    textAlign: 'left',
    backgroundColor: isDarkMode ? 'rgba(22, 27, 34, 0.8)' : 'rgba(255, 255, 255, 0.8)',
    padding: '2rem',
    borderRadius: '1.5rem',
    border: `1px solid ${isDarkMode ? theme.colors.dark.border : theme.colors.light.border}`,
    fontFamily: theme.fonts.sans,
    lineHeight: '1.7',
    backdropFilter: 'blur(10px)',
    boxShadow: theme.shadows['2xl'],
  }),
  resultsImage: {
      maxWidth: '100%',
      height: 'auto',
      borderRadius: '0.75rem',
      marginTop: '1rem',
      marginBottom: '1rem',
      boxShadow: theme.shadows.lg,
      border: `1px solid ${theme.colors.dark.border}`,
  },
  
  // --- HowItWorks Styles ---
  howItWorksCard: (isDarkMode, isHovered) => ({
    padding: '2rem',
    backgroundColor: isDarkMode ? theme.colors.dark.bg : theme.colors.light.bg,
    borderRadius: '1.5rem',
    boxShadow: theme.shadows.lg,
    textAlign: 'center',
    transition: 'transform 0.3s, box-shadow 0.3s',
    transform: isHovered ? 'scale(1.03)' : 'scale(1)',
  }),
  howItWorksIconContainer: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '4rem',
    height: '4rem',
    marginBottom: '1.5rem',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: '9999px',
  },
  howItWorksTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    fontFamily: theme.fonts.display,
  },

  // --- Button Styles ---
  button: (isHovered) => ({
    display: 'inline-block',
    padding: '0.625rem 1.5rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#FFFFFF',
    backgroundColor: isHovered ? theme.colors.accentHover : theme.colors.accent,
    borderRadius: '9999px',
    boxShadow: theme.shadows.lg,
    transition: 'all 0.3s',
    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'none',
  }),

  // --- Animation Styles ---
  animatedSection: (isVisible) => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
    transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
  }),
  
  // --- Login Prompt Styles ---
  loginPrompt: (isDarkMode, isVisible) => ({
    position: 'fixed',
    bottom: '2rem',
    left: '50%',
    transform: isVisible ? 'translate(-50%, 0)' : 'translate(-50%, 200%)',
    opacity: isVisible ? 1 : 0,
    transition: 'transform 0.6s ease-in-out, opacity 0.6s ease-in-out',
    maxWidth: '500px',
    width: 'calc(100% - 4rem)',
    padding: '1.5rem',
    backgroundColor: isDarkMode ? 'rgba(22, 27, 34, 0.8)' : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '1rem',
    boxShadow: theme.shadows['2xl'],
    border: `1px solid ${isDarkMode ? theme.colors.dark.border : theme.colors.light.border}`,
    zIndex: 1200, // Make sure it's on top
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
  }),
  loginPromptText: {
    fontFamily: theme.fonts.display,
    fontWeight: 600,
  },
  loginPromptButtons: {
    display: 'flex',
    gap: '0.75rem',
  },
  loginPromptButton: (isDarkMode, isPrimary) => ({
    padding: '0.5rem 1rem',
    borderRadius: '9999px',
    border: isPrimary ? 'none' : `1px solid ${isDarkMode ? theme.colors.dark.border : theme.colors.light.border}`,
    backgroundColor: isPrimary ? theme.colors.accent : 'transparent',
    color: isPrimary ? '#FFF' : (isDarkMode ? theme.colors.dark.text : theme.colors.light.text),
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: 600,
  }),
  
  // --- LAYOUT & SIDEBAR STYLES (ENHANCED) ---
  pageWrapper: {
    // FIX: This wrapper ensures all content starts below the fixed header.
    paddingTop: '5rem', 
  },
  mainContent: (isSidebarOpen) => ({
    // ENHANCEMENT: Added a smoother transition property.
    transition: 'padding-left 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
    // FIX: Padding is applied to push content when sidebar is open.
    paddingLeft: isSidebarOpen ? '280px' : '0px',
  }),
  sidebar: (isOpen) => ({
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    width: '280px',
    zIndex: 1000,
    // FIX: The internal content will be padded, not the container itself.
    paddingTop: '5rem', 
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    // ENHANCEMENT: Changed timing function for a more modern feel.
    transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
  }),
  toggleButton: (isDarkMode) => ({
    position: 'fixed',
    // FIX: Aligned button with the header's content area.
    top: '1.5rem',
    left: '1.5rem',
    zIndex: 1100,
    background: isDarkMode ? 'rgba(55, 65, 81, 0.7)' : 'rgba(243, 244, 246, 0.7)',
    backdropFilter: 'blur(8px)',
    color: isDarkMode ? '#F9FAFB' : '#1F2937',
    border: '1px solid',
    borderColor: isDarkMode ? '#4B5563' : '#D1D5DB',
    borderRadius: '50%',
    padding: '0.5rem',
    // FIX: Removed the incorrect large margin.
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s ease-in-out, background-color 0.2s',
    ':hover': {
        transform: 'scale(1.1)',
    }
  }),
  sidebarContainer: (isDarkMode, isOpen) => ({
    // This style is now just for the inner visual container, not positioning.
    height: '100%',
    width: '100%',
    background: isDarkMode ? theme.colors.dark.bgSecondary : theme.colors.light.bgSecondary,
    color: isDarkMode ? theme.colors.dark.text : theme.colors.light.text,
    display: 'flex',
    flexDirection: 'column',
    // The parent <aside> handles the positioning and transition.
  }),
  sidebarHeader: {
    padding: '1.5rem',
    borderBottom: `1px solid ${theme.colors.dark.border}`,
    flexShrink: 0,
    fontFamily: theme.fonts.display,
    fontWeight: 600,
    fontSize: '1.25rem',
  },
  historyItem: (isDarkMode, isHovered) => ({
    padding: '0.75rem 1.5rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    listStyle: 'none',
    backgroundColor: isHovered ? (isDarkMode ? '#30363D' : '#F3F4F6') : 'transparent',
    borderLeft: `4px solid ${isHovered ? theme.colors.accent : 'transparent'}`,
    transition: 'all 0.2s ease',
  }),
  message: (isDarkMode) => ({
    textAlign: 'center',
    color: isDarkMode ? '#9CA3AF' : '#6B7280',
    padding: '2rem 1rem',
    fontStyle: 'italic',
  }),
};

const useWindowSize = () => {
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 768);
        window.addEventListener('resize', handleResize);
        // Corrected function name
        return () => window.removeEventListener('resize', handleResize); 
    }, []);
    return { isDesktop };
};

const useIntersectionObserver = (options) => {
    const [entry, setEntry] = useState(null);
    const [node, setNode] = useState(null);
    const observer = useRef(null);

    useEffect(() => {
        if (observer.current) observer.current.disconnect();
        observer.current = new window.IntersectionObserver(([entry]) => setEntry(entry), options);
        if (node) observer.current.observe(node);
        return () => observer.current.disconnect();
    }, [node, options]);

    return [setNode, entry];
};

// --- Reusable Components ---
const Logo = ({ isDarkMode }) => (
    <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: '0.5rem' }}>
        <span style={{ fontFamily: theme.fonts.display, fontSize: '1.5rem', fontWeight: 'bold', color: isDarkMode ? theme.colors.dark.text : theme.colors.light.text }}>Ghumo</span>
        <MapPin style={{ color: theme.colors.accent, height: '1.5rem', width: '1.5rem' }} />
    </a>
);

const HistorySidebar = ({ isDarkMode, onHistoryClick }) => {
    // 2. --- NEW STATE MANAGEMENT ---
    const [isOpen, setIsOpen] = useState(false); // Controls sidebar visibility
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hoveredId, setHoveredId] = useState(null);

    // 3. --- REAL-TIME DATA FETCHING ---
    useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser?.id) {
            setIsLoading(false);
            setHistory([]); // Clear history if no user is logged in
            return;
        }

        setIsLoading(true);
        const historyQuery = query(
            collection(db, 'searchHistory'),
            where('userId', '==', currentUser.id),
            orderBy('createdAt', 'desc') // Show most recent searches first
        );

        const unsubscribe = onSnapshot(historyQuery, (querySnapshot) => {
        const updatedHistory = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setHistory(updatedHistory);
        setIsLoading(false);
    });

        // Cleanup listener on component unmount
        return () => unsubscribe();
    }, []); // Empty dependency array means this runs once on mount

    return (
        <>
            {/* 4. --- TOGGLE BUTTON --- */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={styles.toggleButton(isDarkMode)}
                aria-label="Toggle search history"
            >
                <Menu size={24} />
            </button>

            {/* 5. --- SLIDING SIDEBAR CONTAINER --- */}
            <div style={styles.sidebarContainer(isDarkMode, isOpen)}>
                <div style={styles.sidebarHeader}>
                    <h2 style={{ fontSize: '1.125rem' }}>Search History</h2>
                </div>
                {isLoading && <p style={styles.message(isDarkMode)}>Loading...</p>}
                {error && <p style={styles.message(isDarkMode)}>{error}</p>}
                {!isLoading && !error && (
                    history.length > 0 ? (
                        <ul style={{ padding: 0, margin: 0, overflowY: 'auto' }}>
                            {history.map(item => (
                                <li key={item.id}
                                    style={styles.historyItem(isDarkMode, hoveredId === item.id)}
                                    onMouseEnter={() => setHoveredId(item.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                    onClick={() => {
                                        onHistoryClick(item.prompt);
                                        setIsOpen(false); // Close sidebar on click
                                    }}
                                    title={item.prompt}
                                >
                                    {item.prompt}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={styles.message(isDarkMode)}>
                            No history yet. Start a new search!
                        </p>
                    )
                )}
            </div>
        </>
    );
};


const Header = ({ isDarkMode, toggleDarkMode, isDesktop, currentUser, onLogout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const NavLink = ({ href, children }) => {
        const [isHovered, setIsHovered] = useState(false);
        return <a href={href} style={styles.navLink(isDarkMode, isHovered)} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>{children}</a>
    };
    return (
        <header style={styles.header(isDarkMode)}>
            <div style={styles.container}>
                <div style={styles.headerContent}>
                    
                    <Logo isDarkMode={isDarkMode} />
                    {isDesktop && (
                        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                            <NavLink href="#how-it-works">How It Works</NavLink>
                        </nav>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={toggleDarkMode} style={{ padding: '0.5rem', borderRadius: '9999px', border: 'none', background: 'transparent', cursor: 'pointer', color: isDarkMode ? theme.colors.dark.textSecondary : theme.colors.light.textSecondary }}>
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        {isDesktop && (
                            currentUser ? (
                                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                                    <span style={{fontWeight: 500}}>{currentUser.displayName || currentUser.email}</span>
                                    <button onClick={onLogout} title="Logout" style={{...styles.button(false), backgroundColor: '#EF4444', padding: '0.5rem'}}>
                                        <LogOut size={16} />
                                    </button>
                                </div>
                            ) : (
                                <Link to="/" style={styles.button(false)}>Login / Sign Up</Link>
                            )
                        )}
                        {!isDesktop && (
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ padding: '0.5rem', border: 'none', background: 'transparent', cursor: 'pointer', color: isDarkMode ? theme.colors.dark.textSecondary : theme.colors.light.textSecondary }}>
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {isMenuOpen && !isDesktop && (
                <div style={{ backgroundColor: isDarkMode ? theme.colors.dark.bg : theme.colors.light.bg, padding: '1rem' }}>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                        <NavLink href="#how-it-works">How It Works</NavLink>
                        {currentUser ? (
                            <button onClick={onLogout} style={{...styles.button(false), width: '100%', textAlign: 'center', marginTop: '1rem', backgroundColor: '#EF4444'}}>Logout</button>
                        ) : (
                            <Link to="/" style={{...styles.button(false), width: '100%', textAlign: 'center', marginTop: '1rem'}}>Login / Sign Up</Link>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
};

const CarLoader = ({ isDarkMode }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="150" height="100" viewBox="0 0 150 100" xmlns="http://www.w3.org/2000/svg">
            <style>{`
                .car-loader-car { animation: car-loader-drive 4s ease-in-out infinite; }
                .car-loader-road { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: car-loader-draw-road 4s linear infinite; }
                @keyframes car-loader-drive { 0% { motion-offset: 0%; } 100% { motion-offset: 100%; } }
                @keyframes car-loader-draw-road { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }
                .loading-text-breath { animation: breath 2s ease-in-out infinite; }
                @keyframes breath { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }
            `}</style>
            <path id="car-loader-route" d="M 10 50 C 30 20, 60 80, 90 50 S 130 20, 140 50" stroke={isDarkMode ? theme.colors.dark.border : theme.colors.light.border} strokeWidth="2" fill="none" className="car-loader-road" />
            <path d="M -10 -8 L -10 0 L -8 4 L 8 4 L 10 0 L 10 -8 Z M -6 -12 L 6 -12 L 8 -8 L -8 -8 Z" fill={theme.colors.accent} className="car-loader-car" transform="scale(1.2)">
                <animateMotion dur="4s" repeatCount="indefinite" rotate="auto">
                    <mpath href="#car-loader-route"/>
                </animateMotion>
            </path>
        </svg>
        <p className="loading-text-breath" style={{fontFamily: theme.fonts.display, color: isDarkMode ? theme.colors.dark.textSecondary : theme.colors.light.textSecondary, marginTop: '0.5rem'}}>
            Crafting your adventure...
        </p>
    </div>
);

const AnimatedSection = ({ children }) => {
    const [ref, entry] = useIntersectionObserver({ threshold: 0.1 });
    const isVisible = entry?.isIntersecting;
    return <div ref={ref} style={styles.animatedSection(isVisible)}>{children}</div>;
};

const LoginPrompt = ({ isDarkMode, isVisible, onClose }) => {
    return (
        <div style={styles.loginPrompt(isDarkMode, isVisible)}>
            <button onClick={onClose} style={{position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: isDarkMode ? theme.colors.dark.textSecondary : theme.colors.light.textSecondary}}>
                <X size={20} />
            </button>
            <p style={styles.loginPromptText}>Ready to start your journey?</p>
            <div style={styles.loginPromptButtons}>
                <Link to="/" style={styles.loginPromptButton(isDarkMode, false)}>
                    <LogIn size={16} /> Login
                </Link>
                <Link to="/" style={styles.loginPromptButton(isDarkMode, true)}>
                    <UserPlus size={16} /> Sign Up
                </Link>
            </div>
        </div>
    );
};
const getCurrentUser = () => {
    try {
        const userString = localStorage.getItem('currentUser');
        return userString ? JSON.parse(userString) : null;
    } catch (error) {
        console.error("Error parsing user data from localStorage", error);
        return null;
    }
};


const Hero = ({ isDarkMode, isDesktop, onFormSubmit, isLoading, itinerary, error }) => {
    const [prompt, setPrompt] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [isSendHovered, setIsSendHovered] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmedPrompt = prompt.trim();
         if (!trimmedPrompt || isLoading) return;

        // --- Logic to save search history to Firebase ---
        const currentUser = getCurrentUser();

        // Only save to history if a user is logged in
        if (currentUser && currentUser.id) {
            try {
                // Create a reference to your 'searchHistory' collection
                const historyCollectionRef = collection(db, "searchHistory");

                // Add a new document with the prompt and user info
                await addDoc(historyCollectionRef, {
                    userId: currentUser.id, // Save the user's ID
                    prompt: trimmedPrompt,  // Save the search text
                    createdAt: serverTimestamp() // Add a timestamp
                });

                console.log("Search prompt saved to history! 📝");
                 console.log("Data stored in Firebase with document ID:");

            } catch (err) {
                console.error("Error saving search history to Firebase:", err);
            }
        }
        onFormSubmit(trimmedPrompt);
    };

    const handleSuggestionClick = (suggestionText) => setPrompt(suggestionText);

    const Suggestion = ({ children, text }) => {
        const [isHovered, setIsHovered] = useState(false);
        return <button type="button" onClick={() => handleSuggestionClick(text)} style={styles.suggestionTag(isDarkMode, isHovered)} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>{children}</button>
    };

    return (
        <section style={styles.heroSection}>
            <div style={styles.animatedBg}></div>
            <div style={{...styles.container, position: 'relative' }}>
                <div style={{ maxWidth: '48rem', margin: '0 auto', textAlign: 'center', minHeight: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    {!itinerary && !isLoading && !error && (
                        <div>
                            <h1 style={{...styles.heroTitle(isDesktop), color: isDarkMode ? theme.colors.dark.text : theme.colors.light.text }}>Your Authentic Indian Adventure, Crafted in Seconds.</h1>
                            <p style={{ marginTop: '1.5rem', fontSize: '1.125rem', lineHeight: '1.75', color: isDarkMode ? theme.colors.dark.textSecondary : theme.colors.light.textSecondary }}>Tell us your travel dream. We'll handle the rest.</p>
                        </div>
                    )}
                    {isLoading && <CarLoader isDarkMode={isDarkMode} />}
                    {error && <div style={styles.resultsContainer(isDarkMode)}><p style={{color: '#F87171'}}>Error: {error}</p></div>}
                    {itinerary && (
                        <div style={styles.resultsContainer(isDarkMode)}>
                            <ReactMarkdown
                                components={{
                                    img: ({node, ...props}) => <img style={styles.resultsImage} {...props} alt={props.alt || ''} />,
                                    h2: ({node, ...props}) => <h2 style={{fontFamily: theme.fonts.display, fontSize: '1.5rem', marginTop: '1.5rem', borderBottom: `1px solid ${isDarkMode ? theme.colors.dark.border : theme.colors.light.border}`, paddingBottom: '0.5rem'}} {...props} />,
                                    p: ({node, ...props}) => <p style={{marginBottom: '1rem', color: isDarkMode ? theme.colors.dark.textSecondary : theme.colors.light.textSecondary}} {...props} />,
                                    ul: ({node, ...props}) => <ul style={{listStylePosition: 'inside', paddingLeft: '1rem'}} {...props} />,
                                    li: ({node, ...props}) => <li style={{marginBottom: '0.5rem'}} {...props} />,
                                    a: ({node, ...props}) => <a style={{color: theme.colors.accent, textDecoration: 'underline'}} target="_blank" rel="noopener noreferrer" {...props} />,
                                }}
                            >
                                {itinerary}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>
                <div style={styles.heroFormContainer(isDarkMode)}>
                    <form onSubmit={handleSubmit}>
                        <div style={styles.inputWrapper(isDarkMode, isFocused)}>
                            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} placeholder="A 5-day spiritual trip to Varanasi for a solo traveler..." required style={styles.textarea(isDarkMode)}/>
                            <button type="submit" disabled={isLoading} style={styles.sendButton(isSendHovered)} onMouseEnter={() => setIsSendHovered(true)} onMouseLeave={() => setIsSendHovered(false)}>
                                <SendHorizonal style={{ color: '#FFFFFF' }} size={20} />
                            </button>
                        </div>
                    </form>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem'}}>
                        <Suggestion text="A 7-day family trip to Kerala">Kerala Family Trip</Suggestion>
                        <Suggestion text="A 5-day trekking adventure in Himachal">Himachal Trek</Suggestion>
                        <Suggestion text="A 3-day cultural tour of Jaipur">Jaipur Culture Tour</Suggestion>
                    </div>
                </div>
            </div>
        </section>
    );
};

const HowItWorks = ({ isDarkMode, isDesktop }) => {
    const steps = [
        { icon: MessageSquare, title: 'Tell Us Your Vibe', description: 'Share your destination, budget, and unique interests.' },
        { icon: Wand2, title: 'AI Crafts Your Plan', description: 'Our AI instantly builds a unique, day-by-day plan with sights and local food.' },
        { icon: Compass, title: 'Explore With Confidence', description: 'Receive your personalized itinerary and start your journey like a local.' },
    ];
    
    const Card = ({ step }) => {
        const [isHovered, setIsHovered] = useState(false);
        return (
            <div style={styles.howItWorksCard(isDarkMode, isHovered)} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                <div style={styles.howItWorksIconContainer}><step.icon style={{ height: '2rem', width: '2rem', color: theme.colors.accent }} /></div>
                <h3 style={{...styles.howItWorksTitle, color: isDarkMode ? theme.colors.dark.text : theme.colors.light.text}}>{step.title}</h3>
                <p style={{ marginTop: '0.5rem', color: isDarkMode ? theme.colors.dark.textSecondary : theme.colors.light.textSecondary }}>{step.description}</p>
            </div>
        );
    };

    return (
        <section id="how-it-works" style={styles.section(isDarkMode, true)}>
            <AnimatedSection>
                <div style={styles.container}>
                    <h2 style={{...styles.sectionTitle(isDesktop), color: isDarkMode ? theme.colors.dark.text : theme.colors.light.text}}>Planning in 3 Simple Steps</h2>
                    <p style={styles.sectionSubtitle(isDarkMode)}>Effortless travel is just a few clicks away.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr', gap: '2rem' }}>
                        {steps.map((step, index) => <Card key={index} step={step} />)}
                    </div>
                </div>
            </AnimatedSection>
        </section>
    );
};

const Footer = ({ isDarkMode }) => (
    <footer style={{...styles.section(isDarkMode, true), padding: '3rem 0' }}>
        <div style={{...styles.container, textAlign: 'center' }}>
            <Logo isDarkMode={isDarkMode} />
            <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: isDarkMode ? theme.colors.dark.textSecondary : theme.colors.light.textSecondary }}>
                &copy; {new Date().getFullYear()} Ghumo. All rights reserved.
            </p>
        </div>
    </footer>
);

// --- Main HomePage Component ---
export default function HomePage() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const { isDesktop } = useWindowSize();
    const [isLoading, setIsLoading] = useState(false);
    const [itinerary, setItinerary] = useState(null);
    const [error, setError] = useState(null);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

        // --- NEW STATE FOR HISTORY AND SIDEBAR ---
    const [history, setHistory] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(isDesktop);

      // --- UPDATED useEffect for Auth and History ---
    // --- REFACTORED useEffect for Auth and Real-time History ---
useEffect(() => {
    const auth = getAuth();
    let historyUnsubscribe = () => {}; // A placeholder function for cleanup

    // 'authUnsubscribe' is now used in the return statement below.
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            setCurrentUser({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
            });
            
            // Call onHistoryUpdate and store its return value (the unsubscribe function)
            historyUnsubscribe = onHistoryUpdate(user.uid, (userHistory) => {
                setHistory(userHistory);
            });
        } else {
            // User is signed out
            setCurrentUser(null);
            setHistory([]); 
            historyUnsubscribe(); // Clean up the previous user's history listener
        }
    });

    // --- Other setup logic (timers, dark mode, etc.) ---
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
    
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `@keyframes gradientAnimation { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }`;
    document.head.appendChild(styleSheet);
    
    const timer = setTimeout(() => {
        if (!getAuth().currentUser) {
            setShowLoginPrompt(true);
        }
    }, 10000);

    // --- Cleanup function ---
    // This function runs when the component is removed from the screen.
    return () => {
        clearTimeout(timer);
        authUnsubscribe();      // This is where 'authUnsubscribe' is used.
        historyUnsubscribe();   // This cleans up the history listener.
    };
}, []); // The empty array [] means this effect runs only once when the component first loads.
    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    const handleLogout = () => {
        const auth = getAuth();
        signOut(auth).then(() => {
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userDisplayName');
            localStorage.removeItem('userPhotoURL');
            setCurrentUser(null);
            window.location.reload();
        }).catch((error) => {
            console.error("Logout Error:", error);
        });
    };

    const handleFormSubmit = async (prompt) => {
        setIsLoading(true);
        setItinerary(null);
        setError(null);
        
        try {
            const response = await fetch("http://localhost:5001/api/generate-itinerary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: prompt }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "An unknown error occurred.");
            }

            const data = await response.json();
            setItinerary(data.itinerary);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
   
        // --- NEW: Function to handle clicking a history item ---
    const handleHistoryClick = (prompt) => {
        // Re-run the search with the selected prompt
        handleFormSubmit(prompt);
        // Optional: close sidebar on mobile after selection
        if (!isDesktop) {
            setIsSidebarOpen(false);
        }
    };
    return (
        <div style={styles.homePage(isDarkMode)}>
            <Header 
                isDarkMode={isDarkMode} 
                toggleDarkMode={toggleDarkMode} 
                isDesktop={isDesktop}
                currentUser={currentUser}
                onLogout={handleLogout}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} // Pass toggle function
            />
            {/* --- NEW: Main page wrapper for sidebar layout --- */}
            <div style={styles.pageWrapper}>
                {currentUser && (
                    <aside style={styles.sidebar(isDarkMode, isSidebarOpen)}>
                        <HistorySidebar 
                            isDarkMode={isDarkMode}
                            history={history}
                            onHistoryClick={handleHistoryClick}
                        />
                    </aside>
                )}
                <div style={styles.mainContent(isSidebarOpen)}>
                    <main>
                        <Hero 
                            isDarkMode={isDarkMode} 
                            isDesktop={isDesktop}
                            onFormSubmit={handleFormSubmit}
                            isLoading={isLoading}
                            itinerary={itinerary}
                            error={error}
                        />
                        <HowItWorks isDarkMode={isDarkMode} isDesktop={isDesktop} />
                    </main>
                    <Footer isDarkMode={isDarkMode} />
                </div>
            </div>
            
            <LoginPrompt 
                isDarkMode={isDarkMode} 
                isVisible={showLoginPrompt && !currentUser} 
                onClose={() => setShowLoginPrompt(false)} 
            />
        </div>
    );
}
