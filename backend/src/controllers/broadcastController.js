const { createBroadcast, getAllBroadcastsOnly, getAllBroadcasts, updateBroadcast } = require('../services/broadcastService.js');

const create = async (req, res) => {
  try {
    const { title, content } = req.body;
    const broadcast = await createBroadcast(title, content);
    res.json(broadcast);
  }catch (error) {
    if(error.message === 'Title and content are required to create a broadcast'){
      return res.status(400).json({ error: 400, message: error.message });
    }
    res.status(500).json({ error: 500, message: 'Internal Server Error' });
  }
};


const getAllOnly = async (req, res) => {
  try {
    const broadcasts = await getAllBroadcastsOnly();
    res.json(broadcasts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const { filter } = req.params;
    const broadcasts = await getAllBroadcasts(filter);
    res.json(broadcasts);
  } catch (error) {
    res.status(400).json({ error: 400, error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { title, content } = req.body;
    const broadcast = await updateBroadcast(req.params.id, title, content);
    res.json(broadcast);
  } catch (error) {
    res.status(404).json({ error: 404, message: error.message });
  }
};

module.exports = { create, getAllOnly, getAll, update };