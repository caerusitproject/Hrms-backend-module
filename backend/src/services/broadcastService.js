const Broadcast = require('../models/Broadcast.js');
const { Op } = require('sequelize');

const createBroadcast = async (title, content) => {
  return await Broadcast.create({ title, content });
};

const getAllBroadcastsOnly = async () => {
  try {
    return await Broadcast.findAll({
      order: [['id', 'ASC']],
      attributes: ['id', 'title', 'content', 'createdAt','updatedAt']
    });
  } catch (error) {
    throw new Error( error.message || 'Failed to fetch broadcasts');
  }
};

const getAllBroadcasts = async (filter) => {
  try {
    const today = new Date(); 
    let where = {};

    switch (filter) {
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        const yesterdayEnd = new Date(yesterday);
        yesterdayEnd.setHours(23, 59, 59, 999);
        where.createdAt = { [Op.between]: [yesterday, yesterdayEnd] };
        break;
      case 'today':
        const todayStart = new Date(today);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);
        where.createdAt = { [Op.between]: [todayStart, todayEnd] };
        break;
      case 'this-month':
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
        where.createdAt = { [Op.between]: [thisMonthStart, thisMonthEnd] };
        break;
      case 'last-month':
        const prevMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const prevMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
        where.createdAt = { [Op.between]: [prevMonthStart, prevMonthEnd] };
        break;
      default:
        throw new Error('Invalid filter parameter. Use yesterday, today, thismonth, or prevmonth');
    }

    return await Broadcast.findAll({
      where,
      order: [['id', 'ASC']],
      attributes: ['id', 'title', 'content', 'createdAt','updatedAt']
    });
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch broadcasts');
  }
};

const updateBroadcast = async (id, title, content) => {
  const broadcast = await Broadcast.findByPk(id);
  if (!broadcast) throw new Error('Broadcast not found');
  if (title) broadcast.title = title;
  if (content) broadcast.content = content;
  await broadcast.save();
  return broadcast;
};

module.exports = { createBroadcast, getAllBroadcastsOnly, getAllBroadcasts, updateBroadcast };