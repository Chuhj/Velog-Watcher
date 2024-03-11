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
