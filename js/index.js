(function () {
  //
  function getJSON(url, callback) {
    let xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304) {
          callback && callback(JSON.parse(xhr.responseText));
        } else {
          console.log('request failed');
        }
      }
    };

    xhr.open('get', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(null);
  }

  //
  getJSON('./json/select.json', data => {
    select = new $Select({
      container: '#wrap',
      data: data
    });

    var prevInfo = document.querySelector('.prev-info'),
      curInfo = document.querySelector('.current-info'),
      tips = document.querySelector('#tips');

    select.dropdown.addEventListener('showInfo', function (e) { //接收信息，显示tips
      tips.style.display = 'block';

      const {
        chosen,
        curTarget,
        allName
      } = e.detail;
      let _innerText = chosen.innerText;

      prevInfo.innerHTML = _innerText === '未选择' ? ' - undefined' : _innerText + ` - ${allName.findIndex(name => name === _innerText)}`;
      curInfo.innerHTML = curTarget.innerHTML + ` - ${allName.findIndex(name => name === curTarget.innerHTML)}`;
    });
  });
})();