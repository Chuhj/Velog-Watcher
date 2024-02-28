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
