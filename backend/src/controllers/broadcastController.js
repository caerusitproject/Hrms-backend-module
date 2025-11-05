const broadcastService = require('../services/broadcastService.js');

const create = async (req, res) => {
  try {
    const { title, content } = req.body;
    const broadcast = await broadcastService.createBroadcast(title, content);
    res.json(broadcast);
  }catch (error) {
    if(error.message === 'Title and content are required to create a broadcast'){
      return res.status(400).json({ error: 400, message: error.message });
    }
    return res.status(500).json({ error: 500, message: 'Internal Server Error' });
  }
};


const getAllOnly = async (req, res) => {
  try {
    const broadcasts = await broadcastService.getAllBroadcastsOnly();
    res.json(broadcasts);
  } catch (error) {
    return res.status(400).json({ error:400, message: 'Failed' });
  }
};

const getAll = async (req, res) => {
  try {
    const { filter } = req.params;
    const broadcasts = await broadcastService.getAllBroadcasts(filter);
    res.json(broadcasts);
  } catch (error) {
    return res.status(400).json({ error: 400, message: 'Invalid' });
  }
};

const update = async (req, res) => {
  try {
    const { title, content } = req.body;
    const broadcast = await broadcastService.updateBroadcast(req.params.id, title, content);
    res.json(broadcast);
  } catch (error) {
    return res.status(404).json({ error: 404, message: error.message });
  }
};
const deleteId = async (req, res) => {
  try {
    const { id } = req.params;
    const broadcast = await deleteBroadcast(id);
    return res.status(200).json({ message: "Deleted successfully", broadcast });
  } catch (error) {
    return res.status(404).json({ error: 404, message: error.message });
  }
};

module.exports = { create, getAllOnly, getAll, update, deleteId };