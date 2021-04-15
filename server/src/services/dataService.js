/*
Import packages
*/
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/*
Import custom packages
*/
const { HTTPError, convertArrayToPagedObject } = require('../utils');

/*
File paths
*/
const filePathMessages = path.join(__dirname, '..', 'data', 'messages.json');
const filePathMatches = path.join(__dirname, '..', 'data', 'matches.json');
const filePathUsers = path.join(__dirname, '..', 'data', 'users.json');

/*
Write your methods from here
*/

/*
Read users.json
*/

const readDataFromUsersFile = () => {
  const data = fs.readFileSync(filePathUsers, { encoding: 'utf-8', flag: 'r' });
  const users = JSON.parse(data);

  return users;
};

/*
Get all users
*/

const getUsers = () => {
  try {
    const users = readDataFromUsersFile();
    users.sort((a, b) => {
      if (a.lastName > b.lastName) {
        return 1;
      } if (a.lastName < b.lastName) {
        return -1;
      }
      return 0;
    });
    return users;
  } catch (error) {
    throw new HTTPError('Can\'t get users!', 500);
  }
};


/*
Get a specific user
*/

const getUserById = (userId) => {
  try {
    const users = readDataFromUsersFile();
    const user = users.find(u => u.id === userId);
    if (!user) {
      throw new HTTPError(`can't find the user width id ${userId}`, 404);
    }
    return user;
  } catch (error) {
    throw error;
  }
};


/*
Create a new user
*/

const createUser = (user) => {
  try {
    // Get all users
    const users = readDataFromUsersFile();
    // Create user
    const userToCreate = {
      ...user,
      id: uuidv4(),
      createdAt: Date.now(),
    };
    users.push(userToCreate);
    // Write user array to the users.json file
    fs.writeFileSync(filePathUsers, JSON.stringify(users, null, 2));
    // Return the created post
    return userToCreate;
  } catch (error) {
    throw new HTTPError(`Can't create a new user!`, 501);
  }
};


/*
Update a specific user
*/
const updateUser = (userId, user) => {
  try {
    const userToUpdate = {
      ...user,
    };
    userToUpdate.modifiedAt = Date.now();

    // Read the users.json file
    const users = readDataFromUsersFile();
    // Find the index of the user we want to update
    const findIndex = users.findIndex(u => u.id === userId);
    if (findIndex === -1) {
      throw new HTTPError(`Cant't find the user with userId ${userId}!`, 404);
    }
    users[findIndex] = {
      ...users[findIndex],
      ...userToUpdate,
    };
    // Write users array to the users.json file
    fs.writeFileSync(filePathUsers, JSON.stringify(users, null, 2));
    // Send response
    return users[findIndex];
  } catch (error) {
    throw error;
  }
};


/*
Delete a specific user
*/
const deleteUser = (userId) => {
  try {
    // Read the users.json file
    const users = readDataFromUsersFile();
    // Find the index of the user we want to remove
    const findIndex = users.findIndex(u => u.id === userId);
    if (findIndex === -1) {
      throw new HTTPError(`Cant't find the user with id ${userId}!`, 404);
    }
    users.splice(findIndex, 1);
    // Write users array to the users.json file
    fs.writeFileSync(filePathUsers, JSON.stringify(users, null, 2));
    // Send response
    return {
      message: `Successful deleted the user with id ${userId}!`,
    };
  } catch (error) {
    throw error;
  }
};


/*
Read messages.json
*/

const readDataFromMessagesFile = () => {
  const data = fs.readFileSync(filePathMessages, { encoding: 'utf-8', flag: 'r' });
  const messages = JSON.parse(data);

  return messages;
};

/*
Get all messages
*/

const getMessages = () => {
  try {
    const messages = readDataFromMessagesFile();
    return messages;
  } catch (error) {
    throw new HTTPError('Can\'t get messages!', 500);
  }
};


/*
Get a specific message
*/

const getMessageById = (messageId) => {
  try {
    const messages = readDataFromMessagesFile();
    const message = messages.find(m => m.id === messageId);
    if (!message) {
      throw new HTTPError(`can't find the message width id ${messageId}`, 404);
    }
    return message;
  } catch (error) {
    throw error;
  }
};


/*
Get all messages from a specific user
*/

const getMessagesFromUserById = (userId) => {
  try {
    const messages = readDataFromMessagesFile();
    // Filter the array where obj.receiverId or obj.senderId equals userId
    const selectedMessages = messages.filter(message => message.receiverId === userId || message.senderId === userId);
    if (!selectedMessages) {
      throw new HTTPError(`Can't find messages form the user with id ${userId}`, 404);
    }
    selectedMessages.sort((a, b) => {
      if (a.createdAt < b.createdAt) {
        return -1;
      } if (a.createdAt > b.createdAt) {
        return 1;
      }
      return 0;
    });
    return selectedMessages;
  } catch (error) {
    throw error;
  }
};

/*
Get all received messages from a specific user
*/

const getReceivedMessagesFromUserById = (userId) => {
  try {
    const messages = readDataFromMessagesFile();
    // Filter the array where obj.receiverId equals userId
    const selectedMessages = messages.filter(message => message.receiverId === userId);
    if (!selectedMessages) {
      throw new HTTPError(`Can't find received messages form the user with id ${userId}`, 404);
    }
    selectedMessages.sort((a, b) => {
      if (a.createdAt < b.createdAt) {
        return 1;
      } if (a.createdAt > b.createdAt) {
        return -1;
      }
      return 0;
    });
    return selectedMessages;
  } catch (error) {
    throw error;
  }
};


/*
Get all sent messages from a specific user
*/

const getSentMessagesFromUserById = (userId) => {
  try {
    const messages = readDataFromMessagesFile();
    // Filter the array where obj.sederId equals userId
    const selectedMessages = messages.filter(message => message.senderId === userId);
    if (!selectedMessages) {
      throw new HTTPError(`Can't find sent messages form the user with id ${userId}`, 404);
    }
    selectedMessages.sort((a, b) => {
      if (a.createdAt < b.createdAt) {
        return 1;
      } if (a.createdAt > b.createdAt) {
        return -1;
      }
      return 0;
    });
    return selectedMessages;
  } catch (error) {
    throw error;
  }
};


/*
Get all messages from a specific user between users
*/

const getMessagesBetweenUsers = (userId, friendId) => {
  try {
    const messages = readDataFromMessagesFile();
    /* Filter the array where the userId equals obj.receiverId or obj.senderId and
    where the friendId equals the obj.receiverId or obj.senderId */
    const selectedMessages = messages.filter(message => (message.receiverId === userId && message.senderId === friendId)
     || (message.senderId === userId && message.receiverId === friendId));
    if (!selectedMessages) {
      throw new HTTPError(`Can't find the conversation messages form the user with userId ${userId} and the friend with friendId ${friendId}`, 404);
    }
    selectedMessages.sort((a, b) => {
      if (a.createdAt < b.createdAt) {
        return -1;
      } if (a.createdAt > b.createdAt) {
        return 1;
      }
      return 0;
    });
    return selectedMessages;
  } catch (error) {
    throw error;
  }
};


/*
Create a new message
*/

const createMessage = (message) => {
  try {
    // Get all messages
    const messages = readDataFromMessagesFile();
    // Create message
    const messageToCreate = {
      ...message,
      id: uuidv4(),
      createdAt: Date.now(),
    };
    messages.push(messageToCreate);
    // Write messages array to the messages.json file
    fs.writeFileSync(filePathMessages, JSON.stringify(messages, null, 2));
    // Return the created message
    return messageToCreate;
  } catch (error) {
    throw new HTTPError(`Can't create a new message!`, 501);
  }
};


/*
Update a specific message
*/
const updateMessage = (messageId, message) => {
  try {
    const messageToUpdate = {
      ...message,
    };
    messageToUpdate.modifiedAt = Date.now();

    // Read the message.json file
    const messages = readDataFromMessagesFile();
    // Find the index of the message we want to update
    const findIndex = messages.findIndex(m => m.id === messageId);
    if (findIndex === -1) {
      throw new HTTPError(`Cant't find the message with id ${messageId}!`, 404);
    }
    messages[findIndex] = {
      ...messages[findIndex],
      ...messageToUpdate,
    };
    // Write messages array to the messages.json file
    fs.writeFileSync(filePathMessages, JSON.stringify(messages, null, 2));
    // Send response
    return messages[findIndex];
  } catch (error) {
    throw error;
  }
};

/*
Delete a specific message
*/

const deleteMessage = (messageId) => {
  try {
    // Read the messages.json file
    const messages = readDataFromMessagesFile();
    // Find the index of the Message we want to remove
    const findIndex = messages.findIndex(m => m.id === messageId);
    if (findIndex === -1) {
      throw new HTTPError(`Can't find the message with id ${messageId}!`, 404);
    }
    messages.splice(findIndex, 1);
    // Write message array to the messages.json file
    fs.writeFileSync(filePathMessages, JSON.stringify(messages, null, 2));
    // Send response
    return {
      message: `Successful deleted the message with id ${messageId}!`,
    };
  } catch (error) {
    throw error;
  }
};

/*
Read matches.json
*/

const readDataFromMatchesFile = () => {
  const data = fs.readFileSync(filePathMatches, { encoding: 'utf-8', flag: 'r' });
  const matches = JSON.parse(data);

  return matches;
};


/*
Get all matches
*/

const getMatches = () => {
  try {
    const matches = readDataFromMatchesFile();
    return matches;
  } catch (error) {
    throw new HTTPError('Can\'t get messages!', 500);
  }
};


/*
Get a specific match
*/

const getMatchByIds = (senderId, receiverId) => {
  try {
    const matches = readDataFromMatchesFile();
    const match = matches.find(m => m.userId === senderId && m.friendId === receiverId);
    console.log(match);
    if (!match) {
      throw new HTTPError(`can't find the match width senderId ${senderId} and receiverId ${receiverId}`, 404);
    }
    return match;
  } catch (error) {
    throw error;
  }
};

/*
Get all matches from a specific user
*/

const getMatchesFromUserById = (userId) => {
  try {
    const matches = readDataFromMatchesFile();
    // Filter the array where obj.receiverId or obj.senderId equals userId
    const selectedMatches = matches.filter(match => match.userId === userId || match.friendId === userId);
    if (!selectedMatches) {
      throw new HTTPError(`Can't find matches form the user with id ${userId}`, 404);
    }
    return selectedMatches;
  } catch (error) {
    throw error;
  }
};


/*
Create a new match
*/

const createMatch = (match) => {
  try {
    // Get all matches
    const matches = readDataFromMatchesFile();
    // Create match
    const matchToCreate = {
      ...match,
      createdAt: Date.now(),
    };
    matches.push(matchToCreate);
    // Write match array to the matches.json file
    fs.writeFileSync(filePathMatches, JSON.stringify(matches, null, 2));
    // Return the created match
    return matchToCreate;
  } catch (error) {
    throw new HTTPError(`Can't create a new match!`, 501);
  }
};


/*
Update a specific match
*/
const updateMatch = (senderId, receiverId, match) => {
  try {
    const matchToUpdate = {
      ...match,
    };
    matchToUpdate.modifiedAt = Date.now();

    // Read the matches.json file
    const matches = readDataFromMatchesFile();
    // Find the index of the match we want to update
    const findIndex = matches.findIndex(m => m.userId === senderId && m.friendId === receiverId);
    if (findIndex === -1) {
      throw new HTTPError(`Cant't find the match with senderId ${senderId} and receiverId ${receiverId}!`, 404);
    }
    matches[findIndex] = {
      ...matches[findIndex],
      ...matchToUpdate,
    };
    // Write matches array to the matches.json file
    fs.writeFileSync(filePathMatches, JSON.stringify(matches, null, 2));
    // Send response
    return matches[findIndex];
  } catch (error) {
    throw error;
  }
};

/*
Delete a specific match
*/

const deleteMatch = (senderId, receiverId) => {
  try {
    // Read the matches.json file
    const matches = readDataFromMatchesFile();
    // Find the index of the Match we want to remove
    const findIndex = matches.findIndex(m => m.userId === senderId && m.friendId === receiverId);
    if (findIndex === -1) {
      throw new HTTPError(`Cant't find the match with senderId ${senderId} and receiverId ${receiverId}!`, 404);
    }
    matches.splice(findIndex, 1);
    // Write matches array to the matches.json file
    fs.writeFileSync(filePathMatches, JSON.stringify(matches, null, 2));
    // Send response
    return {
      message: `Successful deleted the message with senderId ${senderId} and receiverId ${receiverId}!`,
    };
  } catch (error) {
    throw error;
  }
};


// Export all the methods of the data service
module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getMessages,
  getMessageById,
  getMessagesFromUserById,
  getReceivedMessagesFromUserById,
  getSentMessagesFromUserById,
  getMessagesBetweenUsers,
  createMessage,
  updateMessage,
  deleteMessage,
  getMatches,
  getMatchByIds,
  getMatchesFromUserById,
  createMatch,
  updateMatch,
  deleteMatch,
};
