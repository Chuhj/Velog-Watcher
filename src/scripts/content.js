const CURRENT_USER = 'CURRENT_USER';

function getUsername() {
  try {
    const user = JSON.parse(localStorage.getItem(CURRENT_USER));
    return user?.username;
  } catch (error) {
    console.error(`getUsername() error: ${error.message}`);
    throw error;
  }
}

async function getFollowingsPosts(username) {
  try {
    const response = await fetch('http://localhost:3000/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return await response.json();
  } catch (error) {
    console.error(`getFollowingsPosts() error: ${error.message}`);
    throw error;
  }
}

(async function () {
  try {
    const lastRequestTime = sessionStorage.getItem('lastRequestTime');
    const elapsedMinutes = (Date.now() - lastRequestTime) / (60 * 1000);
    if (elapsedMinutes <= 10) return;

    await chrome.storage.local.set({ loading: true });

    const username = getUsername();
    if (!username) throw new Error('Username is required.');

    const posts = await getFollowingsPosts(username);

    sessionStorage.setItem('lastRequestTime', Date.now());

    await chrome.storage.local.set({ posts, error: false });
    await chrome.storage.local.set({ loading: false });
  } catch (error) {
    console.error(error);
    await chrome.storage.local.set({ error: true });
  }
})();
