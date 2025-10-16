// src/consumer/notificationConsumer.js
const { Kafka } = require('kafkajs');
const { sendEmail } = require('./notificationHandler');

const kafka = new Kafka({
  clientId: 'notification-service',
  brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'notification-group' });

// In-memory queue for buffering messages before processing
let messageBuffer = [];

/**
 * Connect and subscribe the consumer (but do not run continuously)
 */
const initializeConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'hrms_notifications', fromBeginning: false });

  console.log('✅ Kafka Consumer initialized (scheduled mode)');
};

/**
 * Fetch messages manually and push into buffer
 */
const fetchMessages = async () => {
  console.log('🕒 Checking for new Kafka messages...');

  try {
    // Poll messages for this interval
    await consumer.run({
      eachMessage: async ({ message }) => {
        const payload = JSON.parse(message.value.toString());
        messageBuffer.push(payload);
      },
    });

    console.log(`📦 ${messageBuffer.length} messages queued for processing.`);
  } catch (err) {
    console.error('❌ Error fetching Kafka messages:', err);
  }
};

/**
 * Process all buffered messages (send emails)
 */
const processMessages = async () => {
  if (messageBuffer.length === 0) {
    console.log('📭 No messages to process this cycle.');
    return;
  }

  console.log(`🚀 Processing ${messageBuffer.length} messages...`);
  for (const msg of messageBuffer) {
    try {
      if (msg.type === 'EMPLOYEE_REGISTRATION') {
        const { email, subject, message } = msg.data;
        await sendEmail(email, subject, message);
        console.log(`✅ Email sent to ${email}`);
      }
    } catch (err) {
      console.error('❌ Error processing message:', err);
    }
  }

  // Clear buffer after processing
  messageBuffer = [];
};

/**
 * Schedule job to wake up every 1 hour
 */
const startScheduler = () => {
  console.log('🕐 Scheduler started: will process messages every 1 hour.');

  // Run immediately once
  runCycle();

  // Schedule subsequent runs every 1 hour
  setInterval(runCycle, 60 * 60 * 1000);
};

/**
 * Combined cycle: fetch and process messages
 */
const runCycle = async () => {
  console.log('⏰ Starting scheduled Kafka consumption cycle...');
  await fetchMessages();
  await processMessages();
  console.log('✅ Cycle complete, sleeping until next hour.');
};

/**
 * Exported function to start the consumer + scheduler
 */
const startConsumerScheduler = async () => {
  await initializeConsumer();
  startScheduler();
};

module.exports = { startConsumerScheduler };