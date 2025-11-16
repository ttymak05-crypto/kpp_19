// Запрошення користувача в поточну кімнату
async function inviteUserToRoom() {
  if (!this.inviteUser.trim() || !this.roomId) return;

  try {
    const res = await fetch(`https://matrix.org/_matrix/client/r0/rooms/${this.roomId}/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`
      },
      body: JSON.stringify({ user_id: this.inviteUser.trim() })
    });

    const data = await res.json();

    if (data.errcode) {
      alert('Invite failed: ' + (data.error || 'Unknown error'));
    } else {
      this.inviteUser = '';
      await this.fetchRoomMembers();
      alert('User invited!');
    }
  } catch (e) {
    alert('Invite error: ' + e.message);
  }
}

// Приєднання до кімнати
// Може працювати у двох режимах:
// 1) joinRoom()          -> бере this.joinRoomId (з input'а)
// 2) joinRoom(roomIdStr) -> використовується з fetchMessages() при інвайті
async function joinRoom(roomIdParam) {
  const value = (typeof roomIdParam === 'string' && roomIdParam.trim())
    ? roomIdParam.trim()
    : this.joinRoomId.trim();

  if (!value) return;

  try {
    const res = await fetch(
      `https://matrix.org/_matrix/client/r0/join/${encodeURIComponent(value)}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      }
    );

    const data = await res.json();

    if (data.room_id) {
      this.roomId = value;
      this.joinRoomId = '';
      this.messages = [];
      this.lastSyncToken = '';

      await this.fetchRoomsWithNames();
      this.fetchMessages();
      this.fetchRoomMembers();
    } else {
      alert('Join failed: ' + (data.error || 'Unknown error'));
    }
  } catch (e) {
    alert('Join room error: ' + e.message);
  }
}

async function fetchRoomMembers() {
  if (!this.accessToken || !this.roomId) return;

  try {
    const res = await fetch(
      `https://matrix.org/_matrix/client/r0/rooms/${encodeURIComponent(this.roomId)}/joined_members`,
      {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      }
    );

    const data = await res.json();

    this.roomMembers = Object.entries(data.joined || {}).map(([userId, info]) => ({
      userId,
      displayName: info.display_name || userId.split(':')[0].substring(1),
      avatarUrl: info.avatar_url
    }));
  } catch (e) {
    console.error('Error fetching room members:', e);
  }
}
