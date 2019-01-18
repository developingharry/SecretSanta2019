var secretMessage = document.querySelectorAll('.secretMessage');

secretMessage.forEach(function (message) {
  message.addEventListener('click', function () {
    var selection = window.getSelection();
    var range = document.createRange();
    range.selectNodeContents(message);
    selection.removeAllRanges();
    selection.addRange(range);

    try {
      document.execCommand('copy');
      selection.removeAllRanges();

      var original = message.textContent;
      message.textContent = 'Copied!';
      message.classList.add('success');

      setTimeout(function () {
        message.textContent = original;
        message.classList.remove('success');
      }, 1200);
    } catch (e) {
      var errorMsg = document.querySelector('.error-msg');
      errorMsg.classList.add('show');

      setTimeout(function () {
        errorMsg.classList.remove('show');
      }, 1200);
    }
  });
});

// based on a copy function written by the good people at https://alligator.io/js/copying-to-clipboard/