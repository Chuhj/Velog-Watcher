const VELOG_DOMAIN = 'velog.io';
const CURRENT_USER = 'CURRENT_USER';

function getUsernameFromLocalStorage() {
  try {
    const user = JSON.parse(localStorage.getItem(CURRENT_USER));
    return user?.username;
  } catch (error) {
    console.error(`getUsernameFromLocalStorage() error: ${error.message}`);
    return null;
  }
}

function waitForUsernameFromDOM() {
  return new Promise((resolve) => {
    let timeoutId;

    // 임시글, 읽기 목록, 글 읽는 페이지에서는 프로필 img에 querySelector로 접근 가능
    const userImg = document.querySelector('.sc-bkkeKt > img');
    if (userImg) {
      const { src } = userImg;
      const username = src.match(/\/images\/([^/]+)\/profile/)[1];
      resolve(username);
    }

    const observer = new MutationObserver((mutationsList, observer) => {
      mutationsList.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.tagName && node.tagName.toLowerCase() === 'header') {
              // 헤더 태그가 추가되었을 때 프로필 img를 찾음
              // img 태그에서 username 추출
              const userImg = node.innerHTML.match(/<img[^>]+>/)[0];
              const username = userImg.match(/\/images\/([^/]+)\/profile/)[1];

              if (username) {
                // username을 찾으면 resolve
                clearTimeout(timeoutId);
                resolve(username);
                observer.disconnect();
              }
            }
          });
        }
      });
    });

    timeoutId = setTimeout(() => {
      // 시간 내에 username을 못찾으면 null을 resolve
      observer.disconnect();
      resolve(null);
    }, 3000);

    observer.observe(document.body, { childList: true, subtree: true });
  });
}

(async () => {
  try {
    const { username: prevUsername } = await chrome.storage.local.get(
      'username'
    );

    if (location.hostname === VELOG_DOMAIN) {
      const usernameFromLocalStorage = getUsernameFromLocalStorage();
      const usernameFromDOM = await waitForUsernameFromDOM();

      if (!usernameFromLocalStorage && !usernameFromDOM)
        throw new Error('Username is required.');

      if (
        prevUsername &&
        prevUsername !== (usernameFromLocalStorage || usernameFromDOM)
      ) {
        // 찾은 username이 기존의 username과 달라졌다면 마지막 요청 시간 초기화
        await chrome.storage.local.set({ lastRequestTime: null });
      }

      await chrome.storage.local.set({
        username: usernameFromLocalStorage || usernameFromDOM,
      });
    }
    await chrome.runtime.sendMessage({ type: 'storeFetchedPosts' });
  } catch (error) {
    console.error(error);
    await chrome.storage.local.set({ error: true });
  }
})();
