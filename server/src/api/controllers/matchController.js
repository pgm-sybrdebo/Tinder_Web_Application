/*
Import custom packages
*/
const dataService = require('../../services/dataService');
const { HTTPError, handleHTTPError } = require('../../utils');

/*
Get all matches
*/
const getMatches = (req, res, next) => {
  try {
    // Get matches from dataService
    const matches = dataService.getMatches();
    // Send response
    res.status(200).json(matches);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Get a specific match
*/
const getMatchByIds = (req, res, next) => {
  try {
    // Get matchId parameter (2 separate id's)
    const { senderId, receiverId } = req.params;
    // Get specific match
    const match = dataService.getMatchByIds(senderId, receiverId);
    // Send response
    res.status(200).json(match);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Get matches from a specific user
*/
const getMatchesFromUserById = (req, res, next) => {
  try {
    // Get userId params from url
    const { userId } = req.params;
    // Get matches from a specific user
    const matchesFromUserById = dataService.getMatchesFromUserById(userId);
    res.status(200).json(matchesFromUserById);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Create a new match
*/
const createMatch = (req, res, next) => {
  try {
    // Get body (match) from request
    const match = req.body;
    // Create a match
    const createdMatch = dataService.createMatch(match);
    // Send response 
    res.status(201).json(createdMatch);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Update a specific match
*/
const updateMatch = (req, res, next) => {
  try {
    // Get senderId and receiverId parameter
    const { senderId, receiverId } = req.params;
    // get body (match) from request
    const match = req.body;
    // Update a specific match
    const updatedMatch = dataService.updateMatch(senderId, receiverId, match);
    // Send response
    res.status(200).json(updatedMatch);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Delete a specific match
*/
const deleteMatch = (req, res, next) => {
  try {
    // Get senderId and receiverId parameter
    const { senderId, receiverId } = req.params;
    // Delete a match
    const match = dataService.deleteMatch(senderId, receiverId);
    // Send response
    res.status(200).json(match);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

// Export the action methods = callbacks
module.exports = {
  createMatch,
  deleteMatch,
  getMatches,
  getMatchByIds,
  getMatchesFromUserById,
  updateMatch,
};
