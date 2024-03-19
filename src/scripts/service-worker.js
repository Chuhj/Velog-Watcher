async function fetchFollowingsPosts(username) {
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
    console.error(`fetchFollowingsPosts() error: ${error.message}`);
    throw error;
  }
}

function hasTenMinutesPassed(lastRequestTime) {
  const elapsedMinutes = (Date.now() - lastRequestTime) / (60 * 1000);
  return elapsedMinutes > 10;
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type !== 'storeFetchedPosts') return;
  (async () => {
    try {
      const { lastRequestTime, username } = await chrome.storage.local.get([
        'lastRequestTime',
        'username',
      ]);
      if (!lastRequestTime || hasTenMinutesPassed(lastRequestTime)) {
        // 첫 요청이거나 10분이 지났을 때
        await chrome.storage.local.set({
          loading: true,
        });

        const posts = await fetchFollowingsPosts(username);

        await chrome.storage.local.set({
          lastRequestTime: Date.now(),
          posts,
          error: false,
          loading: false,
        });
      }
    } catch (error) {
      console.error(error);
      await chrome.storage.local.set({
        error: true,
        loading: false,
      });
    }
  })();
});
