/*
Import custom packages
*/
const dataService = require('../../services/dataService');
const { HTTPError, handleHTTPError } = require('../../utils');

/*
Get all messages
*/
const getMessages = (req, res, next) => {
  try {
    // Get users from dataService
    const messages = dataService.getMessages();
    // Send response
    res.status(200).json(messages);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Get a specific message
*/
const getMessageById = (req, res, next) => {
  try {
    // Get messageId parameter
    const { messageId } = req.params;
    // Get specific message
    const message = dataService.getMessageById(messageId);
    // Send response
    res.status(200).json(message);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Get messages from a specific user
*/
const getMessagesFromUserById = (req, res, next) => {
  try {
    // Get userId params from url
    const { userId } = req.params;
    const { type, friendId } = req.query;
    // Get messages from a specific user
    let messages;
    if (type === 'received') {
      messages = dataService.getReceivedMessagesFromUserById(userId);
    } else if (type === 'sent') {
      messages = dataService.getSentMessagesFromUserById(userId);
    } else if (type === 'conversation') {
      messages = dataService.getMessagesBetweenUsers(userId, friendId);
    } else {
      messages = dataService.getMessagesFromUserById(userId);
    }
    res.status(200).json(messages);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Create a new message
*/
const createMessage = (req, res, next) => {
  try {
    // Get body (message) from request
    const message = req.body;
    // Create a message
    const createdMessage = dataService.createMessage(message);
    // Send response
    res.status(201).json(createdMessage);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Update a specific message
*/
const updateMessage = (req, res, next) => {
  try {
    // Get messageId parameter
    const { messageId } = req.params;
    // get body (message) from request
    const message = req.body;
    // Update a specific message
    const updatedMessage = dataService.updateMessage(messageId, message);
    // Send response
    res.status(200).json(updatedMessage);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Delete a specific message
*/
const deleteMessage = (req, res, next) => {
  try {
    // Get messageId parameter
    const { messageId } = req.params;
    // Delete a message
    const message = dataService.deleteMessage(messageId);
    // Send response
    res.status(200).json(message);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

// Export the action methods = callbacks
module.exports = {
  createMessage,
  deleteMessage,
  getMessages,
  getMessageById,
  getMessagesFromUserById,
  updateMessage,
};
