const BACKEND_URL = 'https://blogwatcher.dev';
const BADGE_COLOR = '#D04848';

async function fetchFollowingsPosts(username) {
  try {
    const response = await fetch(`${BACKEND_URL}/posts`, {
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

chrome.action.setBadgeBackgroundColor({ color: BADGE_COLOR });

chrome.runtime.onMessage.addListener((message) => {
  if (message.type !== 'storeFetchedPosts') return;
  (async () => {
    try {
      const { lastRequestTime, lastPopupVisitTime, username, loading } =
        await chrome.storage.local.get([
          'lastRequestTime',
          'lastPopupVisitTime',
          'username',
          'loading',
        ]);

      if (!username || loading) return;

      if (!lastRequestTime || hasTenMinutesPassed(lastRequestTime)) {
        // 첫 요청이거나 10분이 지났을 때
        await chrome.storage.local.set({
          loading: true,
        });

        const posts = await fetchFollowingsPosts(username);

        if (Array.isArray(posts) && posts.length > 0) {
          // 새로운 글의 개수를 뱃지로 표시
          const newPostsLength = posts.filter((post) => {
            const postTime = Date.parse(post.isoDate);
            return lastPopupVisitTime < postTime;
          }).length;

          if (newPostsLength > 0) {
            chrome.action.setBadgeText({ text: newPostsLength.toString() });
          }
        }

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
