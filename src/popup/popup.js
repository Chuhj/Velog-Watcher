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
