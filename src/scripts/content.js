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

(async function () {
  try {
    const username = getUsername();
    if (!username) throw new Error('Username is required.');
  } catch (error) {
    console.error(error);
    await chrome.storage.local.set({ error: true });
  }
})();
