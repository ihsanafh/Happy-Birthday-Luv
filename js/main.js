onload = () => {
  const c = setTimeout(() => {
    document.body.classList.remove("not-loaded");

    const titles = 'Happy Birthday Sayang<3'.split('');
    const titleElement = document.getElementById('title');
    let index = 0;

    function appendTitle() {
      if (index < titles.length) {
        titleElement.innerHTML += titles[index];
        index++;
        setTimeout(appendTitle, 300); // 300ms delay
      } else {
        setTimeout(changeToLoveMessage, 3000); // Change after 3 seconds
      }
    }

    function changeToLoveMessage() {
      titleElement.innerHTML = '';
      const loveMessage = 'I love You<3'.split('');
      index = 0;

      function appendLoveMessage() {
        if (index < loveMessage.length) {
          titleElement.innerHTML += loveMessage[index];
          index++;
          setTimeout(appendLoveMessage, 300); // 300ms delay
        } else {
          setTimeout(redirectToLovePage, 3000); // Redirect after 3 seconds
        }
      }

      appendLoveMessage();
    }

    function redirectToLovePage() {
      window.location.href = 'love.html';
    }

    appendTitle();

    clearTimeout(c);
  }, 1000);
};
