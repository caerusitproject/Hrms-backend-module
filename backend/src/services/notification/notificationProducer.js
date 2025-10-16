const { producer, connectProducer } = require('../../config/kafka/kafkaConfig');

exports.sendNotificationEvent = async (notificationData) => {
 
  try {
    await connectProducer();
    await producer.send({
      topic: 'NOTIFICATION_EVENT',
      messages: [
        {
          value: JSON.stringify(notificationData),
        },
      ],
    });

    console.log('📩 Notification event sent:', notificationData);
  } catch (error) {
    console.error('❌ Failed to send notification event:', error.message);
  }
};