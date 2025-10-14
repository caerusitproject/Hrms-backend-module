const Broadcast = require('../models/Broadcast.js');

const createBroadcast = async (title, content) => {
  return await Broadcast.create({ title, content });
};

const getAllBroadcasts = async () => {
  return await Broadcast.findAll({
    order: [['id', 'ASC']]
  });
};

const updateBroadcast = async (id, title, content) => {
  const broadcast = await Broadcast.findByPk(id);
  if (!broadcast) throw new Error('Broadcast not found');
  if (title) broadcast.title = title;
  if (content) broadcast.content = content;
  await broadcast.save();
  return broadcast;
};

module.exports = { createBroadcast, getAllBroadcasts, updateBroadcast };