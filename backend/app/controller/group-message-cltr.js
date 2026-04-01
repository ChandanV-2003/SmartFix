const GroupMessage = require('../model/group-message-model');

const groupMessageCtrl = {};

groupMessageCtrl.create = async (req, res) => {
    try {
        const { message } = req.body;
        const senderId = req.userId;
        
        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message cannot be empty' });
        }

        const newMsg = new GroupMessage({
            senderId,
            message
        });
        await newMsg.save();
        
        const populatedMsg = await GroupMessage.findById(newMsg._id).populate('senderId', 'username email role');
        
        if (req.io) {
            req.io.to('admin-manager-group').emit('receiveMessage', populatedMsg);
        }

        res.status(201).json(populatedMsg);
    } catch (err) {

        res.status(500).json({ error: 'Failed to save group message' });
    }
};

groupMessageCtrl.getAll = async (req, res) => {
    try {
        const messages = await GroupMessage.find({ group: 'admin-manager' })
            .sort({ createdAt: 1 })
            .populate('senderId', 'username email role');
        res.json(messages);
    } catch (err) {

        res.status(500).json({ error: 'Failed to fetch group messages' });
    }
};

module.exports = groupMessageCtrl;
