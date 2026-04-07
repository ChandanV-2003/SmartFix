import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from '../config/axios';
import './LandingPage.css';

const LandingPage = () => {
    const { token, user } = useSelector((state) => state.user);
    const [landingData, setLandingData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLandingData = async () => {
            try {
                const response = await axios.get('/landing');
                setLandingData(response.data);
            } catch (err) {
                console.error('Error fetching landing data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLandingData();
    }, []);

    // If user is already logged in, redirect to their dashboard
    if (token && user) {
        const dashboardPath = user.role === 'admin' ? '/admin/dashboard' :
                             user.role === 'manager' ? '/manager/dashboard' :
                             user.role === 'technician' ? '/technician/dashboard' : '/user/dashboard';
        return <Navigate to={dashboardPath} replace />;
    }

    if (loading) {
        return (
            <div className="landing-loading">
                <div className="spinner"></div>
                <p>Loading SmartFix Experience...</p>
            </div>
        );
    }

    const { hero, features, about, contact } = landingData || {};

    return (
        <div className="landing-page">
            {/* Navbar */}
            <nav className="landing-nav">
                <div className="landing-container nav-content">
                    <div className="landing-logo">
                        <Link to="/">SmartFix</Link>
                    </div>
                    <ul className="nav-links">
                        <li><a href="#home">Home</a></li>
                        <li><a href="#features">Features</a></li>
                        <li><a href="#about">About</a></li>
                        <li><Link to="/login" className="nav-link-item">Login</Link></li>
                        <li><Link to="/register" className="nav-link-item">Register</Link></li>
                    </ul>
                    <div className="nav-auth-mobile">
                         <Link to="/login" className="nav-btn-login">Login</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header id="home" className="hero-section">
                <div className="hero-background-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                </div>
                <div className="landing-container hero-content">
                    <div className="hero-text">
                        <div className="hero-badge">Smart Solutions for Smart Fixing</div>
                        <h1>{hero?.title || 'Expert Solutions for All Your Repair Needs'}</h1>
                        <p>{hero?.subtitle || 'SmartFix connects you with professional technicians to solve your maintenance issues quickly and reliably.'}</p>
                        <div className="hero-btns">
                            <Link to="/register" className="primary-cta">{hero?.buttonText || 'Get Started'}</Link>
                            <Link to="/login" className="secondary-cta">Sign In</Link>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="hero-card-stack">
                            <div className="floating-card c1">
                                <div className="card-icon">✅</div>
                                <div className="card-info">
                                    <span>Resolution Rate</span>
                                    <strong>98.5%</strong>
                                </div>
                            </div>
                            <div className="floating-card c2">
                                <div className="card-icon">👷</div>
                                <div className="card-info">
                                    <span>Verified Pros</span>
                                    <strong>500+</strong>
                                </div>
                            </div>
                            <div className="main-visual-circle">
                                 <div className="inner-visual">SmartFix</div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section id="features" className="features-section">
                <div className="landing-container">
                    <div className="section-header">
                        <span className="section-subtitle">Our Features</span>
                        <h2 className="section-title">Everything you need for seamless maintenance</h2>
                    </div>
                    <div className="features-grid">
                        {features?.map((feature, idx) => (
                            <div className="feature-card" key={feature._id || idx}>
                                <div className="feature-icon-wrapper">{feature.icon}</div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        ))}
                        {(!features || features.length === 0) && (
                             <p className="no-data">Features content is being updated...</p>
                        )}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="about-section">
                <div className="landing-container">
                    <div className="about-wrapper">
                        <div className="about-image-side">
                             <div className="about-img-box">
                                 <div className="experience-tag">
                                     <strong>5+</strong>
                                     <span>Years of Trust</span>
                                 </div>
                             </div>
                        </div>
                        <div className="about-text-side">
                            <span className="section-subtitle">About Our Mission</span>
                            <h2 className="section-title">{about?.title || 'Bridging the gap between service and satisfaction'}</h2>
                            <p>{about?.description || 'SmartFix was founded on the principle that maintenance shouldn’t be a headache.'}</p>
                            <div className="about-stats">
                                {about?.stats?.map((stat, idx) => (
                                    <div className="stat-item" key={stat._id || idx}>
                                        <h4>{stat.value}</h4>
                                        <span>{stat.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="landing-container footer-content">
                    <div className="footer-info">
                        <div className="landing-logo footer-logo">SmartFix</div>
                        <p>The most trusted platform for maintenance and repair management.</p>
                        <div className="social-links">
                            <span className="social-icon">f</span>
                            <span className="social-icon">t</span>
                            <span className="social-icon">i</span>
                            <span className="social-icon">l</span>
                        </div>
                    </div>
                    <div className="footer-nav">
                        <h4>Product</h4>
                        <ul>
                            <li><a href="#home">Home</a></li>
                            <li><a href="#features">Features</a></li>
                            <li><a href="#about">About</a></li>
                        </ul>
                    </div>
                    <div className="footer-nav">
                        <h4>Support</h4>
                        <ul>
                            <li><a href="/login">Help Center</a></li>
                            <li><a href="/login">Privacy Policy</a></li>
                            <li><a href="/login">Terms of Service</a></li>
                        </ul>
                    </div>
                    <div className="footer-nav">
                        <h4>Contact</h4>
                        <ul>
                            <li>{contact?.email || 'support@smartfix.com'}</li>
                            <li>{contact?.phone || '+1 (555) 000-FIXIT'}</li>
                            <li>{contact?.address || '123 Repair St, Tech City'}</li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} SmartFix. All rights reserved. Designed for excellence.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
