const express = require('express');
const { create, getAllOnly, getAll, update, deleteId } = require('../controllers/broadcastController.js');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleWare.js');
const { validateId } = require('../middleware/validation.js');

const router = express.Router();

/**
 * @swagger
 * /broadcast/create:
 *   post:
 *     summary: Create a new broadcast
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Created broadcast
 */
router.post('/create', authenticate, authorizeRoles('HR','ADMIN'), create);

/**
 * @swagger
 * /broadcast/all:
 *   get:
 *     summary: Get all broadcasts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of broadcasts
 */
router.get('/all', authenticate, getAllOnly);  
router.get('/all/:filter', authenticate, getAll);


/**
 * @swagger
 * /broadcast/update/{id}:
 *   put:
 *     summary: Update a broadcast
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated broadcast
 */
router.patch('/update/:id', authenticate, authorizeRoles('HR','ADMIN'), validateId, update);
router.delete('/delete/:id', authenticate, authorizeRoles('HR','ADMIN'), validateId, deleteId);

module.exports = router;