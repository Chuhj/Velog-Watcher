function getTimeAgoString(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;

  const minute = 60 * 1000;
  const hour = minute * 60;
  const day = hour * 24;

  if (diffMs < minute) {
    return '방금 전';
  } else if (diffMs < hour) {
    const minutes = Math.floor(diffMs / minute);
    return `${minutes}분 전`;
  } else if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return `${hours}시간 전`;
  } else {
    const days = Math.floor(diffMs / day);
    return `${days}일 전`;
  }
}

function showPosts(posts) {
  const $postList = document.querySelector('.post_list');
  $postList.replaceChildren();
  $postList.classList.remove('hidden');

  for (const post of posts) {
    const { feedTitle, isoDate, link, profileImage, title } = post;
    const $li = document.createElement('li');

    const $a = document.createElement('a');
    $a.href = link;
    $a.classList.add('post_item');

    const $img = document.createElement('img');
    $img.src = profileImage;
    $img.alt = '프로필 이미지';
    $img.classList.add('profile_image');

    const $postInfo = document.createElement('div');
    $postInfo.classList.add('post_info');

    const $postTitle = document.createElement('div');
    $postTitle.textContent = title;
    $postTitle.classList.add('post_title', 'line-clamp-2');

    const $postInfoBottom = document.createElement('div');
    $postInfoBottom.classList.add('post_info_bottom');

    const $postWriter = document.createElement('div');
    $postWriter.textContent = `by ${feedTitle}`;
    $postWriter.classList.add('post_writer', 'line-clamp-1');

    const $postTime = document.createElement('div');
    $postTime.textContent = getTimeAgoString(isoDate);
    $postTime.classList.add('post_time');

    $postInfoBottom.appendChild($postWriter);
    $postInfoBottom.appendChild($postTime);

    $postInfo.appendChild($postTitle);
    $postInfo.appendChild($postInfoBottom);

    $a.appendChild($img);
    $a.appendChild($postInfo);
    $a.addEventListener('click', () => {
      chrome.tabs.create({ url: link }).catch((error) => {
        console.error(error);
      });
    });

    $li.appendChild($a);
    $postList.appendChild($li);
  }
}

function hidePosts() {
  const $postList = document.querySelector('.post_list');
  $postList.classList.add('hidden');
}

function showErrorIcon() {
  const $error = document.querySelector('.error');
  $error.classList.remove('hidden');
}

function hideErrorIcon() {
  const $error = document.querySelector('.error');
  $error.classList.add('hidden');
}

function showSpinner() {
  const $spinner = document.querySelector('.dot-spinner');
  $spinner.classList.remove('hidden');
}

function hideSpinner() {
  const $spinner = document.querySelector('.dot-spinner');
  $spinner.classList.add('hidden');
}

function showNeedLoginMessage() {
  const $needLoginMessage = document.querySelector('.need_login_msg');
  $needLoginMessage.classList.remove('hidden');
}

function hideNeedLoginMessage() {
  const $needLoginMessage = document.querySelector('.need_login_msg');
  $needLoginMessage.classList.add('hidden');
}

function showNoPostMessage() {
  const $noPostMessage = document.querySelector('.no_post_msg');
  $noPostMessage.classList.remove('hidden');
}

function hideNoPostMessage() {
  const $noPostMessage = document.querySelector('.no_post_msg');
  $noPostMessage.classList.add('hidden');
}

chrome.storage.onChanged.addListener((changes) => {
  for (let [key, { newValue }] of Object.entries(changes)) {
    switch (key) {
      case 'username':
        if (!newValue) {
          hidePosts();
          hideNoPostMessage();
          showNeedLoginMessage();
        }
        break;
      case 'posts':
        if (newValue && newValue.length > 0) {
          hideNoPostMessage();
          hideNeedLoginMessage();
          showPosts(newValue);
        } else {
          hidePosts();
          hideNoPostMessage();
          hideNeedLoginMessage();
          showNoPostMessage();
        }
        break;
      case 'loading':
        if (newValue === true) {
          showSpinner();
        } else {
          hideSpinner();
        }
        break;
      case 'error':
        if (newValue === true) {
          showErrorIcon();
        } else {
          hideErrorIcon();
        }
        break;
    }
  }
});

chrome.action.setBadgeText({ text: '' });
document.querySelector('.velog_link').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://velog.io' }).catch((error) => {
    console.error(error);
  });
});

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const { username, posts, error, loading } = await chrome.storage.local.get([
      'username',
      'posts',
      'error',
      'loading',
    ]);

    if (!username) {
      hideNoPostMessage();
      showNeedLoginMessage();
    } else {
      if (posts && posts.length > 0) {
        hideNeedLoginMessage();
        hideNoPostMessage();
        showPosts(posts);
      } else {
        hideNeedLoginMessage();
        showNoPostMessage();
      }
      if (error) showErrorIcon();
      if (loading) showSpinner();
    }

    await chrome.storage.local.set({ lastPopupVisitTime: Date.now() });

    await chrome.runtime.sendMessage({
      type: 'storeFetchedPosts',
    });
  } catch (error) {
    console.error(error);
    chrome.storage.local.set({ error: true, loading: false });
  }
});
