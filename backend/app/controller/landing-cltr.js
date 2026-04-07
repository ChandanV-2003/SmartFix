const Landing = require('../model/landing-model');
const landingCltr = {};

landingCltr.get = async (req, res) => {
    try {
        let landing = await Landing.findOne();
        if (!landing) {
            // Seed default data if none exists
            landing = new Landing({
                hero: {
                    title: 'Expert Solutions for All Your Repair Needs',
                    subtitle: 'SmartFix connects you with professional technicians to solve your maintenance issues quickly and reliably. Streamlined complaint management at your fingertips.',
                    buttonText: 'Get Started'
                },
                features: [
                     { title: 'Fast Response', description: 'Get your issues addressed quickly with our automated ticketing and assignment system.', icon: '🚀' },
                     { title: 'Expert Technicians', description: 'Our pool of verified professionals ensures high-quality repairs with specialized skills.', icon: '🛠️' },
                     { title: 'Real-time Tracking', description: 'Monitor the status of your complaints and communicate directly with your assigned technician.', icon: '📊' },
                     { title: 'Responsive UI', description: 'Access SmartFix from anywhere, on any device, with a clean and intuitive user interface.', icon: '📱' },
                     { title: 'Live Chat', description: 'Instant communication with managers and technicians to keep everyone in the loop.', icon: '💬' },
                     { title: 'Secure Platform', description: 'Your data and service history are protected with industry-standard security measures.', icon: '🔒' }
                ],
                about: {
                    title: 'Bridging the gap between service and satisfaction',
                    description: 'SmartFix was founded on the principle that maintenance shouldn’t be a headache. We’ve built a platform that brings transparency and efficiency to every repair task.',
                    stats: [
                        { label: 'Fixed Issues', value: '10k+' },
                        { label: 'Support', value: '24/7' }
                    ]
                },
                contact: {
                    email: 'support@smartfix.com',
                    phone: '+1 (555) 000-FIXIT',
                    address: '123 Repair St, Tech City'
                }
            });
            await landing.save();
        }
        res.json(landing);
    } catch (err) {
        console.error('Error fetching landing page data:', err);
        res.status(500).json({ error: 'Failed to fetch landing page data' });
    }
};

landingCltr.update = async (req, res) => {
    try {
        const body = req.body;
        // Logic: Find first (only) landing doc or create one
        let landing = await Landing.findOne();
        if (landing) {
            landing = await Landing.findOneAndUpdate({}, body, { new: true, runValidators: true });
        } else {
            landing = new Landing(body);
            await landing.save();
        }
        res.json(landing);
    } catch (err) {
        console.error('Error updating landing page data:', err);
        res.status(500).json({ error: 'Failed to update landing page data' });
    }
};

module.exports = landingCltr;
