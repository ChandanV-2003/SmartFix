import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import './LandingEditor.css';

const LandingEditor = () => {
    const { token } = useSelector(state => state.user);
    const [landingData, setLandingData] = useState({
        hero: { title: '', subtitle: '', buttonText: '' },
        features: [],
        about: { title: '', description: '', stats: [] },
        contact: { email: '', phone: '', address: '' }
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        console.log('LandingEditor component mounted');
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            console.log('Fetching landing page data from API...');
            try {
                const res = await axios.get('/landing');
                console.log('Fetched Landing Data:', res.data);
                setLandingData(res.data);
            } catch (err) {
                console.error('Error fetching data:', err);
                setMessage({ type: 'error', text: 'Error fetching current landing page data' });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleHeroChange = (e) => {
        const { name, value } = e.target;
        setLandingData(prev => ({
            ...prev,
            hero: { ...prev.hero, [name]: value }
        }));
    };

    const handleAboutChange = (e) => {
        const { name, value } = e.target;
        setLandingData(prev => ({
            ...prev,
            about: { ...prev.about, [name]: value }
        }));
    };

    const handleContactChange = (e) => {
        const { name, value } = e.target;
        setLandingData(prev => ({
            ...prev,
            contact: { ...prev.contact, [name]: value }
        }));
    };

    const handleFeatureChange = (index, field, value) => {
        const newFeatures = [...landingData.features];
        newFeatures[index] = { ...newFeatures[index], [field]: value };
        setLandingData(prev => ({ ...prev, features: newFeatures }));
    };

    const addFeature = () => {
        setLandingData(prev => ({
            ...prev,
            features: [...prev.features, { title: '', description: '', icon: '✨' }]
        }));
    };

    const removeFeature = (index) => {
        const newFeatures = landingData.features.filter((_, i) => i !== index);
        setLandingData(prev => ({ ...prev, features: newFeatures }));
    };

    const handleStatChange = (index, field, value) => {
        const newStats = [...landingData.about.stats];
        newStats[index] = { ...newStats[index], [field]: value };
        setLandingDataUnnested(newStats);
    };

    const setLandingDataUnnested = (newStats) => {
        setLandingData(prev => ({
            ...prev,
            about: { ...prev.about, stats: newStats }
        }));
    };

    const addStat = () => {
        setLandingData(prev => ({
            ...prev,
            about: { ...prev.about, stats: [...prev.about.stats, { label: '', value: '' }] }
        }));
    };

    const removeStat = (index) => {
        const newStats = landingData.about.stats.filter((_, i) => i !== index);
        setLandingDataUnnested(newStats);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            await axios.put('/landing', landingData, {
                headers: { Authorization: token }
            });
            setMessage({ type: 'success', text: 'Landing page updated successfully! Visit home to see changes.' });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update landing page' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="editor-loading">
            <div className="editor-spinner"></div>
            <p>Loading editor platform...</p>
        </div>
    );

    return (
        <div className="landing-editor-container">
            <div className="editor-header">
                <div className="header-top">
                    <h2>Landing Page CMS</h2>
                    <Link to="/" className="view-live-btn" target="_blank">View Live Page ↗</Link>
                </div>
                <p>Manage your public identity and landing page content in real-time.</p>
            </div>

            {message.text && (
                <div className={`editor-alert ${message.type}`}>
                    {message.type === 'success' ? '✅' : '❌'} {message.text}
                </div>
            )}
            
            <form onSubmit={handleSave} className="editor-form">
                <div className="editor-grid">
                    {/* Hero Section */}
                    <section className="editor-section-card">
                        <div className="section-title-wrap">
                            <span className="section-icon">🔥</span>
                            <h3>Hero Section</h3>
                        </div>
                        <div className="editor-form-group">
                            <label>Headline Title</label>
                            <input type="text" name="title" value={landingData.hero?.title} onChange={handleHeroChange} placeholder="Main headline" />
                        </div>
                        <div className="editor-form-group">
                            <label>Subtitle / Description</label>
                            <textarea name="subtitle" value={landingData.hero?.subtitle} onChange={handleHeroChange} placeholder="Enter a brief sub-headline" rows="4" />
                        </div>
                        <div className="editor-form-group">
                            <label>CTA Button Text</label>
                            <input type="text" name="buttonText" value={landingData.hero?.buttonText} onChange={handleHeroChange} placeholder="Button label" />
                        </div>
                    </section>

                    {/* About Section */}
                    <section className="editor-section-card">
                        <div className="section-title-wrap">
                            <span className="section-icon">📜</span>
                            <h3>About Section</h3>
                        </div>
                        <div className="editor-form-group">
                            <label>About Heading</label>
                            <input type="text" name="title" value={landingData.about?.title} onChange={handleAboutChange} placeholder="Section title" />
                        </div>
                        <div className="editor-form-group">
                            <label>Detailed Description</label>
                            <textarea name="description" value={landingData.about?.description} onChange={handleAboutChange} placeholder="Describe your mission" rows="4" />
                        </div>
                        
                        <div className="stats-editor-wrap">
                            <div className="row-header">
                                <h4>Engagement Stats</h4>
                                <button type="button" onClick={addStat} className="editor-add-btn">Add Stat</button>
                            </div>
                            <div className="stats-list">
                                {landingData.about?.stats?.map((stat, idx) => (
                                    <div key={idx} className="stat-input-row">
                                        <input placeholder="Value (10k+)" value={stat.value} onChange={(e) => handleStatChange(idx, 'value', e.target.value)} />
                                        <input placeholder="Label (Fixed)" value={stat.label} onChange={(e) => handleStatChange(idx, 'label', e.target.value)} />
                                        <button type="button" onClick={() => removeStat(idx)} className="editor-remove-btn">×</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Contact details Section */}
                    <section className="editor-section-card">
                        <div className="section-title-wrap">
                            <span className="section-icon">📞</span>
                            <h3>Contact Details</h3>
                        </div>
                        <div className="editor-form-group">
                            <label>Support Email</label>
                            <input type="email" name="email" value={landingData.contact?.email} onChange={handleContactChange} placeholder="support@example.com" />
                        </div>
                        <div className="editor-form-group">
                            <label>Phone Number</label>
                            <input type="text" name="phone" value={landingData.contact?.phone} onChange={handleContactChange} placeholder="+1 (555) 000-0000" />
                        </div>
                        <div className="editor-form-group">
                            <label>Office Address</label>
                            <input type="text" name="address" value={landingData.contact?.address} onChange={handleContactChange} placeholder="City, Country" />
                        </div>
                    </section>
                </div>

                {/* Features Section - Full Width */}
                <section className="editor-section-card full-width">
                    <div className="section-title-wrap">
                        <span className="section-icon">🚀</span>
                        <div className="row-header">
                            <h3>Features & Benefits</h3>
                            <button type="button" onClick={addFeature} className="editor-add-btn">Add New Feature Card</button>
                        </div>
                    </div>
                    <div className="features-editor-grid">
                        {landingData.features?.map((feature, idx) => (
                            <div key={idx} className="feature-editor-item">
                                <div className="item-header">
                                    <input className="icon-input" placeholder="Icon" value={feature.icon} onChange={(e) => handleFeatureChange(idx, 'icon', e.target.value)} />
                                    <button type="button" onClick={() => removeFeature(idx)} className="editor-remove-btn">Remove</button>
                                </div>
                                <input className="title-input" placeholder="Feature Title" value={feature.title} onChange={(e) => handleFeatureChange(idx, 'title', e.target.value)} />
                                <textarea placeholder="Describe this feature..." value={feature.description} onChange={(e) => handleFeatureChange(idx, 'description', e.target.value)} rows="3" />
                            </div>
                        ))}
                    </div>
                </section>

                <div className="editor-actions">
                    <button type="submit" disabled={saving} className="editor-save-button">
                        {saving ? (
                            <>
                                <span className="small-spinner"></span>
                                Saving Changes...
                            </>
                        ) : 'Publish Updates to Landing Page'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LandingEditor;
