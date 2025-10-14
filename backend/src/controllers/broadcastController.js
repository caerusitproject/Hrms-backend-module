const { createBroadcast, getAllBroadcasts, updateBroadcast } = require('../services/broadcastService.js');

const create = async (req, res) => {
  const { title, content } = req.body;
  const broadcast = await createBroadcast(title, content);
  res.json(broadcast);
};

const getAll = async (req, res) => {
  const broadcasts = await getAllBroadcasts();
  res.json(broadcasts);
};

const update = async (req, res) => {
  const { title, content } = req.body;
  const broadcast = await updateBroadcast(req.params.id, title, content);
  res.json(broadcast);
};

module.exports = { create, getAll, update };