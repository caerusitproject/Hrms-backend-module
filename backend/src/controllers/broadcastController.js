const { createBroadcast,getAllBroadcastsOnly, getAllBroadcasts, updateBroadcast } = require('../services/broadcastService.js');

const create = async (req, res) => {
  const { title, content } = req.body;
  const broadcast = await createBroadcast(title, content);
  res.json(broadcast);
};


const getAllOnly = async (req, res) => {
  try{
    const broadcasts = await getAllBroadcastsOnly();
    res.json(broadcasts);}catch(error){
      res.status(400).json({ error: error.message });
    }
};

const getAll = async (req, res) => {
  try{
    const { filter } = req.params;
    const broadcasts = await getAllBroadcasts(filter);
    res.json(broadcasts);}catch(error){
      res.status(400).json({ error: error.message });
    }
};

const update = async (req, res) => {
  const { title, content } = req.body;
  const broadcast = await updateBroadcast(req.params.id, title, content);
  res.json(broadcast);
};

module.exports = { create, getAllOnly, getAll, update };