const TINDER_BASE_PATH = 'http://localhost:8080/api';

function TinderApi () {
  this.getUsers = async () => {
    try {
      const response = await fetch(`${TINDER_BASE_PATH}/users`);
      const data = await response.json();

      return data;
    } catch (error) {
      console.log('An error occured!', error);
    }
  };

  this.getReceivedMessagesFromUser = async (userId) => {
    try {
      const response = await fetch(`${TINDER_BASE_PATH}/users/${userId}/messages?type=received`);
      const data = await response.json();

      return data;
    } catch (error) {
      console.log('An error occured!', error);
    }
  };

  this.getSentMessagesFromUser = async (userId) => {
    try {
      const response = await fetch(`${TINDER_BASE_PATH}/users/${userId}/messages?type=sent`);
      const data = await response.json();

      return data;
    } catch (error) {
      console.log('An error occured!', error);
    }
  };

  this.getConversationBetweenUsers = async (userId, friendId) => {
    try {
      const response = await fetch(`${TINDER_BASE_PATH}/users/${userId}/messages?type=conversation&friendId=${friendId}`);
      const data = await response.json();

      return data;
    } catch (error) {
      console.log('An error occured!', error);
    }
  };

  this.addMessageBetweenUsers = async (messageToCreate) => {
    try {
      const response = await fetch(`${TINDER_BASE_PATH}/messages`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageToCreate),
      });
      const data = await response.json();

      return data;
    } catch (error) {
      console.log('An error occured!', error);
    }
  };

  this.getMatchesForUser = async (userId) => {
    try {
      const response = await fetch(`${TINDER_BASE_PATH}/users/${userId}/matches`);
      const data = await response.json();

      return data;
    } catch (error) {
      console.log('An error occured!', error);
    }
  };

  this.addMatch = async (matchToCreate) => {
    try {
      const response = await fetch(`${TINDER_BASE_PATH}/matches`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(matchToCreate),
      });
      const data = await response.json();

      return data;
    } catch (error) {
      console.log('An error occured!', error);
    }
  };
  this.deleteMessage = async (currentMessageId) => {
    try {
      const response = await fetch(`${TINDER_BASE_PATH}/messages/${currentMessageId}`, {
        method: 'DELETE',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      return data;
    } catch (error) {
      console.log('An error occured!', error);
    }
  };
}
