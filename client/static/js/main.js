(() => {
  const app = {
    initialize () {
      moment.locale('nl-be');
      this.tinderApi = new TinderApi();

      this.users = null;
      this.receivedMessages = null;
      this.sentMessages = null;
      this.conversationBetweenUsers = null;
      this.matches = null;
      this.noMatchUsers = null;

      this.currentUserId = null;
      this.currentMessageId = null;
      this.currentFriendId = null;

      this.cacheElements();
      this.registerListeners();
      this.fetchUsers();
    },
    cacheElements () {
      this.$usersList = document.querySelector('.users__list');
      this.$inboxList = document.querySelector('.inbox__list');
      this.$outboxList = document.querySelector('.outbox__list');
      this.$conversationList = document.querySelector('.conversation__list');
      this.$interlocutor = document.querySelector('.interlocutor');
      this.$frmMessage = document.querySelector('#frmMessage');
      this.$matchesList = document.querySelector('.matches__list');
      this.$noMatchesList = document.querySelector('.no-matches__list');
      this.$deleteButton = document.querySelector('.delete-button');
    },
    registerListeners () {
      this.$usersList.addEventListener('click', (ev) => {
        const userId = ev.target.dataset.id || ev.target.parentNode.dataset.id || ev.target.parentNode.parentNode.dataset.id;
        this.setActiveUser(userId);
      });
      this.$inboxList.addEventListener('click', (ev) => {
        const messageId = ev.target.dataset.id || ev.target.parentNode.dataset.id || ev.target.parentNode.parentNode.dataset.id;
        this.setActiveMessage(messageId, 'inbox');
      });
      this.$outboxList.addEventListener('click', (ev) => {
        const messageId = ev.target.dataset.id || ev.target.parentNode.dataset.id || ev.target.parentNode.parentNode.dataset.id;
        this.setActiveMessage(messageId, 'outbox');
      });
      this.$frmMessage.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const messageToCreate = {
          senderId: this.currentUserId,
          receiverId: this.currentFriendId,
          message: ev.target.message.value,
        };
        // this.currentUserId, this.currentFriendId,
        const createdMessage = await this.tinderApi.addMessageBetweenUsers(messageToCreate);
        this.fetchConversationBetweenUsers();
        this.fetchSentMessagesFromUser(this.currentUserId);
      });
      this.$deleteButton.addEventListener('click', async (ev) => {
        const deleteActiveMessage = await this.tinderApi.deleteMessage(this.currentMessageId);
        this.fetchReceivedMessagesFromUser(this.currentUserId);
        this.fetchSentMessagesFromUser(this.currentUserId);
      });
    },
    registerListenerNoMatch () {
      this.$noMatchesList.querySelectorAll('.likeList__item').forEach((item) => {
        item.addEventListener('click', async (ev) => {
          const friendId = ev.target.dataset.friend || ev.target.parentNode.dataset.friend;
          const ratingId = ev.target.dataset.rating || ev.target.parentNode.dataset.rating;
          const matchToCreate = {
            userId: this.currentUserId,
            friendId,
            rating: ratingId,
          };
          const createdMatch = await this.tinderApi.addMatch(matchToCreate);
          this.fetchMatchesForUser(this.currentUserId);
        });
      });
    },
    async fetchUsers () {
      this.users = await this.tinderApi.getUsers();
      this.updateUsersList();
    },
    updateUsersList () {
      this.$usersList.innerHTML = this.users.map(user => `
        <li class="users__list__item">
          <a href="#" data-id=${user.id}>
            <img class="list__item__thumbnail" src="${user.picture.thumbnail}"> 
            <span class="list__item__name">${user.firstName} ${user.lastName}</span>
          </a> 
        </li>
        `).join('');

      const userId = this.users[0].id;
      this.setActiveUser(userId);
    },
    setActiveUser (userId) {
      this.currentUserId = userId;
      const $selectedUser = this.$usersList.querySelector(`.users__list__item.selected`);
      if ($selectedUser) {
        $selectedUser.classList.remove('selected');
      }
      this.$usersList.querySelector(`.users__list__item > a[data-id="${userId}"]`).parentNode.classList.add('selected');
      this.fetchReceivedMessagesFromUser(userId);
      this.fetchSentMessagesFromUser(userId);
      this.fetchMatchesForUser(userId);
    },
    async fetchReceivedMessagesFromUser (userId) {
      this.receivedMessages = await this.tinderApi.getReceivedMessagesFromUser(userId);
      this.updateReceivedMessagesList();
    },
    updateReceivedMessagesList () {
      this.$inboxList.innerHTML = this.receivedMessages.map(receivedMessage => `
        <li class="inbox__list__item">
          <a href="#" data-id=${receivedMessage.id} data-friend=${receivedMessage.senderId}>
            <div class="list__item__heading">
                <span class="list__item__sender">${this.users.find(user => user.id === receivedMessage.senderId).firstName} ${this.users.find(user => user.id === receivedMessage.senderId).lastName}</span>
                <span class="list__item__time">${this.generateDate(receivedMessage.createdAt)}</span>
            </div> 
            <span class="list__item__message">${receivedMessage.message}</span>
          </a> 
        </li>
        `).join('');

      document.querySelector('.inbox .amount').innerHTML = `<span class="">${this.receivedMessages.length}</span>`;

      const messageId = this.receivedMessages[0].id;
      this.setActiveMessage(messageId);
    },
    generateDate (time) {
      const date = new Date(time);
      return moment(date).format('MMM Do YY hh:mm');
    },
    async fetchSentMessagesFromUser (userId) {
      this.sentMessages = await this.tinderApi.getSentMessagesFromUser(userId);
      this.updateSentMessagesList();
    },
    updateSentMessagesList () {
      this.$outboxList.innerHTML = this.sentMessages.map(sentMessage => `
        <li class="outbox__list__item">
          <a href="#" data-id=${sentMessage.id} data-friend=${sentMessage.receiverId}>
            <div class="list__item__heading">
                <span class="list__item__receiver">${this.users.find(user => user.id === sentMessage.receiverId).firstName} ${this.users.find(user => user.id === sentMessage.receiverId).lastName}</span>
                <span class="list__item__time">${this.generateDate(sentMessage.createdAt)}</span>
            </div> 
            <span class="list__item__message">${sentMessage.message}</span>
          </a> 
        </li>
        `).join('');

      document.querySelector('.outbox .amount').innerHTML = `<span class="">${this.sentMessages.length}</span>`;
    },
    setActiveMessage (messageId, box = 'inbox') {
      this.currentMessageId = messageId;
      const $selectedInboxMessage = this.$outboxList.querySelector(`.outbox__list__item.selected`);
      const $selectedOutboxMessage = this.$inboxList.querySelector(`.inbox__list__item.selected`);
      if ($selectedInboxMessage) {
        $selectedInboxMessage.classList.remove('selected');
      }
      if ($selectedOutboxMessage) {
        $selectedOutboxMessage.classList.remove('selected');
      }
      if (box === 'outbox') {
        this.$outboxList.querySelector(`.outbox__list__item > a[data-id="${messageId}"]`).parentNode.classList.add('selected');
        this.currentFriendId = this.$outboxList.querySelector(`.outbox__list__item > a[data-id="${messageId}"]`).dataset.friend;
      } else {
        this.$inboxList.querySelector(`.inbox__list__item > a[data-id="${messageId}"]`).parentNode.classList.add('selected');
        this.currentFriendId = this.$inboxList.querySelector(`.inbox__list__item > a[data-id="${messageId}"]`).dataset.friend;
      }
      this.fetchConversationBetweenUsers();
    },
    async fetchConversationBetweenUsers () {
      this.conversationBetweenUsers = await this.tinderApi.getConversationBetweenUsers(this.currentUserId, this.currentFriendId);
      this.updateConversationList();
    },
    updateConversationList () {
      this.$conversationList.innerHTML = this.conversationBetweenUsers.map(message => `
        <li class="conversation__list__item">
          <a href="#" data-id=${message.id} class=${message.receiverId === this.currentUserId ? 'incoming' : 'outgoing'}>
            <span class="list__item__time--conversation">${this.generateDate(message.createdAt)}</span>
            <p class="list__item__message--conversation">${message.message}</p>
          </a>
        </li>
        `).join('');

      const friendUser = this.users.find(user => user.id === this.currentFriendId);
      this.$interlocutor.innerHTML = `
      <img src="${friendUser.picture.thumbnail}">
      <span>${friendUser.firstName} ${friendUser.lastName}</span>
      `;
    },
    async fetchMatchesForUser (userId) {
      this.matches = await this.tinderApi.getMatchesForUser(userId);
      this.updateMatchesList();
    },
    updateMatchesList () {
      this.$matchesList.innerHTML = this.users.map((user) => {
        const receivedMatch = this.matches.find(match => match.userId === user.id && this.currentUserId !== user.id);
        const sentMatch = this.matches.find(match => match.friendId === user.id && this.currentUserId !== user.id);
        if (receivedMatch !== undefined || sentMatch !== undefined) {
          return `
          <li class="matches__list__item" data-friendId=${user.id}>
            <div class="list__item__match-person">
              <img class="match-person__img"src="${user.picture.thumbnail}">
              <div class="match-person__right">
                <span class="match-person__name">${user.firstName} ${user.lastName}</span>
                <span class="match-person__age">${this.getAge(user.dayOfBirth)}</span><span class="match-person__gender">${this.getGender(user.gender)}</span>
                <span class="match-person__city">${user.location.city}</span>
                <span class="match-person__country">${user.location.country}</span>
              </div>
              <div class="list__item__matchesYou">${receivedMatch === undefined ? this.getNoAnswerForYou() : ''}</div>
            </div>
            <div class="list__item__matchesYou">${receivedMatch !== undefined ? this.getMatchesForYou(receivedMatch) : ''}</div>
            <div class="list__item__likesList">${sentMatch !== undefined ? this.getLikesList(user.id, sentMatch) : this.getLikesList(user.id)}</div>
          </li>
          `;
        }
      }).join('');
      this.getNoMatchesList();
    },
    getAge (dayOfBirth) {
      const today = new Date();
      dayOfBirth = new Date(dayOfBirth);
      const age = Math.floor((today - dayOfBirth) / (24 * 3600 * 365.25 * 1000));
      return age;
    },
    getGender (gender) {
      if (gender === 'male') {
        return '<svg viewBox="0 0 512 512"><path d="M276.956 0v57.674h136.589L312.156 159.063c-32.544-24.144-72.837-38.431-116.471-38.431C87.611 120.632 0 208.242 0 316.316 0 424.389 87.611 512 195.684 512s195.684-87.611 195.684-195.684c0-43.634-14.287-83.928-38.431-116.472L454.326 98.456v136.589H512V0zm-81.272 447.552c-72.48 0-131.237-58.757-131.237-131.237s58.757-131.237 131.237-131.237 131.237 58.757 131.237 131.237c0 72.481-58.757 131.237-131.237 131.237z"/></svg>';
      }
      return '<svg viewBox="0 0 512 512"><path d="M376.264 290.173c66.314-66.293 66.314-174.16 0-240.453-66.314-66.294-174.214-66.294-240.529 0-66.314 66.293-66.314 174.16 0 240.453 28.07 28.061 63.591 44.24 100.254 48.546v56.923h-40.018c-11.051 0-20.009 8.956-20.009 20.003s8.958 20.003 20.009 20.003h40.018v56.348c.001 11.047 8.959 20.003 20.011 20.003 11.051 0 20.009-8.956 20.009-20.003v-56.348h40.019c11.051 0 20.009-8.956 20.009-20.003s-8.958-20.003-20.009-20.003h-40.019V338.72c36.664-4.307 72.185-20.486 100.255-48.547zm-212.231-28.289c-50.711-50.695-50.711-133.181 0-183.876 50.71-50.693 133.221-50.696 183.934 0 50.711 50.695 50.711 133.181 0 183.876-50.711 50.694-133.223 50.694-183.934 0z"/></svg>';
    },
    getMatchesForYou (match) {
      return `<svg class="matchesYou__icon" viewBox="0 0 477.867 477.867"><path d="M409.6 153.6h-85.333c-9.426 0-17.067 7.641-17.067 17.067s7.641 17.067 17.067 17.067H409.6c9.426 0 17.067 7.641 17.067 17.067v221.867c0 9.426-7.641 17.067-17.067 17.067H68.267c-9.426 0-17.067-7.641-17.067-17.067V204.8c0-9.426 7.641-17.067 17.067-17.067H153.6c9.426 0 17.067-7.641 17.067-17.067S163.026 153.6 153.6 153.6H68.267c-28.277 0-51.2 22.923-51.2 51.2v221.867c0 28.277 22.923 51.2 51.2 51.2H409.6c28.277 0 51.2-22.923 51.2-51.2V204.8c0-28.277-22.923-51.2-51.2-51.2z"/><path d="M335.947 243.934c-6.614-6.387-17.099-6.387-23.712 0L256 300.134V17.067C256 7.641 248.359 0 238.933 0s-17.067 7.641-17.067 17.067v283.068l-56.201-56.201c-6.78-6.548-17.584-6.361-24.132.419-6.388 6.614-6.388 17.1 0 23.713l85.333 85.333c6.657 6.673 17.463 6.687 24.136.03l.031-.03 85.333-85.333c6.549-6.78 6.361-17.584-.419-24.132z"/></svg><span>${this.getIconRating(match.rating)}</span>`;
    },
    getNoAnswerForYou (match) {
      return `<svg class="matchesYou__icon" viewBox="0 0 477.867 477.867"><path d="M409.6 153.6h-85.333c-9.426 0-17.067 7.641-17.067 17.067s7.641 17.067 17.067 17.067H409.6c9.426 0 17.067 7.641 17.067 17.067v221.867c0 9.426-7.641 17.067-17.067 17.067H68.267c-9.426 0-17.067-7.641-17.067-17.067V204.8c0-9.426 7.641-17.067 17.067-17.067H153.6c9.426 0 17.067-7.641 17.067-17.067S163.026 153.6 153.6 153.6H68.267c-28.277 0-51.2 22.923-51.2 51.2v221.867c0 28.277 22.923 51.2 51.2 51.2H409.6c28.277 0 51.2-22.923 51.2-51.2V204.8c0-28.277-22.923-51.2-51.2-51.2z"/><path d="M335.947 243.934c-6.614-6.387-17.099-6.387-23.712 0L256 300.134V17.067C256 7.641 248.359 0 238.933 0s-17.067 7.641-17.067 17.067v283.068l-56.201-56.201c-6.78-6.548-17.584-6.361-24.132.419-6.388 6.614-6.388 17.1 0 23.713l85.333 85.333c6.657 6.673 17.463 6.687 24.136.03l.031-.03 85.333-85.333c6.549-6.78 6.361-17.584-.419-24.132z"/></svg><span class="big-orange-question">?</span>`;
    },
    getLikesList (userId, match = { rating: '' }) {
      return `
      <button class="likeList__item" data-friend="${userId}" data-rating="dislike"><svg class="dislike__icon ${match.rating === 'dislike' ? 'dislike__icon--active' : ''}" viewBox="0 0 475.2 475.2"><path d="M405.6 69.6C360.7 24.7 301.1 0 237.6 0s-123.1 24.7-168 69.6S0 174.1 0 237.6s24.7 123.1 69.6 168 104.5 69.6 168 69.6 123.1-24.7 168-69.6 69.6-104.5 69.6-168-24.7-123.1-69.6-168zm-19.1 316.9c-39.8 39.8-92.7 61.7-148.9 61.7s-109.1-21.9-148.9-61.7c-82.1-82.1-82.1-215.7 0-297.8C128.5 48.9 181.4 27 237.6 27s109.1 21.9 148.9 61.7c82.1 82.1 82.1 215.7 0 297.8z"/><path d="M342.3 132.9c-5.3-5.3-13.8-5.3-19.1 0l-85.6 85.6-85.6-85.6c-5.3-5.3-13.8-5.3-19.1 0-5.3 5.3-5.3 13.8 0 19.1l85.6 85.6-85.6 85.6c-5.3 5.3-5.3 13.8 0 19.1 2.6 2.6 6.1 4 9.5 4s6.9-1.3 9.5-4l85.6-85.6 85.6 85.6c2.6 2.6 6.1 4 9.5 4 3.5 0 6.9-1.3 9.5-4 5.3-5.3 5.3-13.8 0-19.1l-85.4-85.6 85.6-85.6c5.3-5.3 5.3-13.8 0-19.1z"/></svg></button>
      <button class="likeList__item" data-friend="${userId}" data-rating="like"><svg class="like__icon ${match.rating === 'like' ? 'like__icon--active' : ''}" viewBox="0 -28 512.001 512"><path d="M256 455.516c-7.29 0-14.316-2.641-19.793-7.438-20.684-18.086-40.625-35.082-58.219-50.074l-.09-.078c-51.582-43.957-96.125-81.918-127.117-119.313C16.137 236.81 0 197.172 0 153.871c0-42.07 14.426-80.883 40.617-109.293C67.121 15.832 103.488 0 143.031 0c29.555 0 56.621 9.344 80.446 27.77C235.5 37.07 246.398 48.453 256 61.73c9.605-13.277 20.5-24.66 32.527-33.96C312.352 9.344 339.418 0 368.973 0c39.539 0 75.91 15.832 102.414 44.578C497.578 72.988 512 111.801 512 153.871c0 43.3-16.133 82.938-50.777 124.738-30.993 37.399-75.532 75.356-127.106 119.309-17.625 15.016-37.597 32.039-58.328 50.168a30.046 30.046 0 01-19.789 7.43zM143.031 29.992c-31.066 0-59.605 12.399-80.367 34.914-21.07 22.856-32.676 54.45-32.676 88.965 0 36.418 13.535 68.988 43.883 105.606 29.332 35.394 72.961 72.574 123.477 115.625l.093.078c17.66 15.05 37.68 32.113 58.516 50.332 20.961-18.254 41.012-35.344 58.707-50.418 50.512-43.051 94.137-80.223 123.469-115.617 30.344-36.618 43.879-69.188 43.879-105.606 0-34.516-11.606-66.11-32.676-88.965-20.758-22.515-49.3-34.914-80.363-34.914-22.758 0-43.653 7.235-62.102 21.5-16.441 12.719-27.894 28.797-34.61 40.047-3.452 5.785-9.53 9.238-16.261 9.238s-12.809-3.453-16.262-9.238c-6.71-11.25-18.164-27.328-34.61-40.047-18.448-14.265-39.343-21.5-62.097-21.5zm0 0"/></svg></button>
      <button class="likeList__item" data-friend="${userId}" data-rating="superlike"><svg class="super-like__icon ${match.rating === 'superlike' ? 'super-like__icon--active' : ''}" viewBox="0 -10 511.987 511"><path d="M114.594 491.14c-5.61 0-11.18-1.75-15.934-5.187a27.223 27.223 0 01-10.582-28.094l32.938-145.09L9.312 214.81a27.188 27.188 0 01-7.976-28.907 27.208 27.208 0 0123.402-18.71l147.797-13.419L230.97 17.027C235.277 6.98 245.089.492 255.992.492s20.715 6.488 25.024 16.512l58.433 136.77 147.774 13.417c10.882.98 20.054 8.344 23.425 18.711 3.372 10.368.254 21.739-7.957 28.907L390.988 312.75l32.938 145.086c2.414 10.668-1.727 21.7-10.578 28.098-8.832 6.398-20.61 6.89-29.91 1.3l-127.446-76.16-127.445 76.203c-4.309 2.559-9.11 3.864-13.953 3.864zm141.398-112.874c4.844 0 9.64 1.3 13.953 3.859l120.278 71.938-31.086-136.942a27.21 27.21 0 018.62-26.516l105.473-92.5-139.543-12.671a27.18 27.18 0 01-22.613-16.493L255.992 39.895 200.844 168.96c-3.883 9.195-12.524 15.512-22.547 16.43L38.734 198.062l105.47 92.5c7.554 6.614 10.858 16.77 8.62 26.54l-31.062 136.937 120.277-71.914c4.309-2.559 9.11-3.86 13.953-3.86zm-84.586-221.848s0 .023-.023.043zm169.13-.063l.023.043c0-.023 0-.023-.024-.043zm0 0"/></svg></button>
      `;
    },
    getIconRating (rating) {
      if (rating === 'dislike') {
        return '<svg class="dislike__icon--active" viewBox="0 0 475.2 475.2"><path d="M405.6 69.6C360.7 24.7 301.1 0 237.6 0s-123.1 24.7-168 69.6S0 174.1 0 237.6s24.7 123.1 69.6 168 104.5 69.6 168 69.6 123.1-24.7 168-69.6 69.6-104.5 69.6-168-24.7-123.1-69.6-168zm-19.1 316.9c-39.8 39.8-92.7 61.7-148.9 61.7s-109.1-21.9-148.9-61.7c-82.1-82.1-82.1-215.7 0-297.8C128.5 48.9 181.4 27 237.6 27s109.1 21.9 148.9 61.7c82.1 82.1 82.1 215.7 0 297.8z"/><path d="M342.3 132.9c-5.3-5.3-13.8-5.3-19.1 0l-85.6 85.6-85.6-85.6c-5.3-5.3-13.8-5.3-19.1 0-5.3 5.3-5.3 13.8 0 19.1l85.6 85.6-85.6 85.6c-5.3 5.3-5.3 13.8 0 19.1 2.6 2.6 6.1 4 9.5 4s6.9-1.3 9.5-4l85.6-85.6 85.6 85.6c2.6 2.6 6.1 4 9.5 4 3.5 0 6.9-1.3 9.5-4 5.3-5.3 5.3-13.8 0-19.1l-85.4-85.6 85.6-85.6c5.3-5.3 5.3-13.8 0-19.1z"/></svg>';
      } if (rating === 'like') {
        return '<svg class="like__icon--active" viewBox="0 -28 512.001 512"><path d="M256 455.516c-7.29 0-14.316-2.641-19.793-7.438-20.684-18.086-40.625-35.082-58.219-50.074l-.09-.078c-51.582-43.957-96.125-81.918-127.117-119.313C16.137 236.81 0 197.172 0 153.871c0-42.07 14.426-80.883 40.617-109.293C67.121 15.832 103.488 0 143.031 0c29.555 0 56.621 9.344 80.446 27.77C235.5 37.07 246.398 48.453 256 61.73c9.605-13.277 20.5-24.66 32.527-33.96C312.352 9.344 339.418 0 368.973 0c39.539 0 75.91 15.832 102.414 44.578C497.578 72.988 512 111.801 512 153.871c0 43.3-16.133 82.938-50.777 124.738-30.993 37.399-75.532 75.356-127.106 119.309-17.625 15.016-37.597 32.039-58.328 50.168a30.046 30.046 0 01-19.789 7.43zM143.031 29.992c-31.066 0-59.605 12.399-80.367 34.914-21.07 22.856-32.676 54.45-32.676 88.965 0 36.418 13.535 68.988 43.883 105.606 29.332 35.394 72.961 72.574 123.477 115.625l.093.078c17.66 15.05 37.68 32.113 58.516 50.332 20.961-18.254 41.012-35.344 58.707-50.418 50.512-43.051 94.137-80.223 123.469-115.617 30.344-36.618 43.879-69.188 43.879-105.606 0-34.516-11.606-66.11-32.676-88.965-20.758-22.515-49.3-34.914-80.363-34.914-22.758 0-43.653 7.235-62.102 21.5-16.441 12.719-27.894 28.797-34.61 40.047-3.452 5.785-9.53 9.238-16.261 9.238s-12.809-3.453-16.262-9.238c-6.71-11.25-18.164-27.328-34.61-40.047-18.448-14.265-39.343-21.5-62.097-21.5zm0 0"/></svg>';
      }
      return '<svg class="super-like__icon--active" viewBox="0 -10 511.987 511"><path d="M114.594 491.14c-5.61 0-11.18-1.75-15.934-5.187a27.223 27.223 0 01-10.582-28.094l32.938-145.09L9.312 214.81a27.188 27.188 0 01-7.976-28.907 27.208 27.208 0 0123.402-18.71l147.797-13.419L230.97 17.027C235.277 6.98 245.089.492 255.992.492s20.715 6.488 25.024 16.512l58.433 136.77 147.774 13.417c10.882.98 20.054 8.344 23.425 18.711 3.372 10.368.254 21.739-7.957 28.907L390.988 312.75l32.938 145.086c2.414 10.668-1.727 21.7-10.578 28.098-8.832 6.398-20.61 6.89-29.91 1.3l-127.446-76.16-127.445 76.203c-4.309 2.559-9.11 3.864-13.953 3.864zm141.398-112.874c4.844 0 9.64 1.3 13.953 3.859l120.278 71.938-31.086-136.942a27.21 27.21 0 018.62-26.516l105.473-92.5-139.543-12.671a27.18 27.18 0 01-22.613-16.493L255.992 39.895 200.844 168.96c-3.883 9.195-12.524 15.512-22.547 16.43L38.734 198.062l105.47 92.5c7.554 6.614 10.858 16.77 8.62 26.54l-31.062 136.937 120.277-71.914c4.309-2.559 9.11-3.86 13.953-3.86zm-84.586-221.848s0 .023-.023.043zm169.13-.063l.023.043c0-.023 0-.023-.024-.043zm0 0"/></svg>';
    },
    getNoMatchesList () {
      const noMatchUsers = [];
      this.users.map((user) => {
        const found = this.matches.some(match => match.userId === user.id || match.friendId === user.id);
        if (!found) {
          noMatchUsers.push(user);
        }
      });
      this.noMatchUsers = noMatchUsers;
      this.updateNoMatchesList();
    },
    updateNoMatchesList () {
      this.$noMatchesList.innerHTML = this.noMatchUsers.map(user => `
        <li class="matches__list__item" data-friendId=${user.id}>
          <div class="list__item__match-person">
            <img class="match-person__img"src="${user.picture.thumbnail}">
            <div class="match-person__right">
              <span class="match-person__name">${user.firstName} ${user.lastName}</span>
              <span class="match-person__age">${this.getAge(user.dayOfBirth)}</span><span class="match-person__gender">${this.getGender(user.gender)}</span>
              <span class="match-person__city">${user.location.city}</span>
              <span class="match-person__country">${user.location.country}</span>
            </div>
          </div>
          <div class="list__item__likesList" data-friendId=${user.id}>${this.getLikesList(user.id)}</div>
        </li>
        `).join('');
      this.registerListenerNoMatch();
    },
  };
  app.initialize();
})();
