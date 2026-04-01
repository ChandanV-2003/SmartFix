const Complaint = require('../model/complaint-model');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const complaintCtrl = {};

// Create a new complaint
complaintCtrl.create = async (req, res) => {
    try {
        const { address, issueTitle, issueDescription } = req.body;
        const userId = req.userId;
        const userEmail = req.userEmail;

        // Validate required fields
        if (!address || !issueTitle || !issueDescription) {
            return res.status(400).json({ error: 'Address, issue title, and description are required' });
        }

        // Get user details from token or fetch from database if needed
        const userName = req.userName || userEmail?.split('@')[0] || 'User';

        const complaint = new Complaint({
            userId,
            userName,
            userEmail,
            address,
            issueTitle,
            issueDescription
        });

        await complaint.save();
        
        // Populate user details before sending response
        const savedComplaint = await Complaint.findById(complaint._id);
        res.status(201).json(savedComplaint);
    } catch (err) {

        res.status(500).json({ error: 'Something went wrong while creating complaint' });
    }
};

// Get all complaints (for admin and manager)
complaintCtrl.getAll = async (req, res) => {
    try {
        const complaints = await Complaint.find().sort({ createdAt: -1 }).populate('assignedTechnicians', 'username email');
        res.json(complaints);
    } catch (err) {

        res.status(500).json({ error: 'Something went wrong while fetching complaints' });
    }
};

// Get complaints by user ID (for regular users to see their own complaints)
complaintCtrl.getByUserId = async (req, res) => {
    try {
        const userId = req.userId;
        const complaints = await Complaint.find({ userId })
            .sort({ createdAt: -1 })
            .populate('assignedTechnicians', 'username email phone');
        res.json(complaints);
    } catch (err) {

        res.status(500).json({ error: 'Something went wrong while fetching your complaints' });
    }
};

// Get complaints assigned to a specific technician
complaintCtrl.getAssigned = async (req, res) => {
    try {
        const technicianId = req.userId;
        const complaints = await Complaint.find({ assignedTechnicians: technicianId }).sort({ createdAt: -1 }).populate('assignedTechnicians', 'username email');
        res.json(complaints);
    } catch (err) {

        res.status(500).json({ error: 'Something went wrong while fetching assigned complaints' });
    }
};

// Assign technician to a complaint
complaintCtrl.assignTechnician = async (req, res) => {
    try {
        const complaintId = req.params.id;
        const { assignedTechnicians } = req.body;

        if (!assignedTechnicians || !Array.isArray(assignedTechnicians)) {
            return res.status(400).json({ error: 'Technicians array is required' });
        }

        const complaint = await Complaint.findByIdAndUpdate(
            complaintId,
            { assignedTechnicians, status: 'assigned' },
            { new: true }
        ).populate('assignedTechnicians', 'username email');

        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        res.json(complaint);
    } catch (err) {

        res.status(500).json({ error: 'Something went wrong while assigning technician' });
    }
};

// Update complaint status (for admin and manager only)
complaintCtrl.updateStatus = async (req, res) => {
    try {
        const complaintId = req.params.id;
        const { status } = req.body;

        const validStatuses = ['pending', 'assigned', 'in-progress', 'resolved', 'rejected'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        const complaint = await Complaint.findByIdAndUpdate(
            complaintId,
            { status },
            { new: true }
        ).populate('assignedTechnicians', 'username email');

        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        res.json(complaint);
    } catch (err) {

        res.status(500).json({ error: 'Something went wrong while updating complaint' });
    }
};

// Delete a complaint (for admin only)
complaintCtrl.delete = async (req, res) => {
    try {
        const complaintId = req.params.id;
        const complaint = await Complaint.findByIdAndDelete(complaintId);

        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        res.json({ message: 'Complaint deleted successfully' });
    } catch (err) {

        res.status(500).json({ error: 'Something went wrong while deleting complaint' });
    }
};

// Analyze complaint using AI
complaintCtrl.analyzeComplaint = async (req, res) => {
    try {
        const { description } = req.body;
        
        if (!description) {
            return res.status(400).json({ error: 'Complaint description is required for analysis' });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-flash-latest"
        });

        const prompt = `
        Analyze the following complaint description and provide structured data JSON.
        Required fields: 
        - "numberOfTechniciansRequired" (number)
        - "technicianType" (string)
        - "estimatedTime" (string, e.g. "2 hours")
        - "spareParts" (array of strings)

        Complaint Description: "${description}"
        `;

        const result = await model.generateContent(prompt);
        let text = result.response.text();
        text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        const aiData = JSON.parse(text);

        res.json(aiData);
    } catch (err) {
        // Fallback response if AI is unavailable (e.g. timeout, quota, or parsing error)
        res.json({
            technicianType: "General Assessment Required",
            numberOfTechniciansRequired: 1,
            estimatedTime: "TBD upon inspection",
            spareParts: ["Pending inspection"]
        });
    }
};

module.exports = complaintCtrl;
