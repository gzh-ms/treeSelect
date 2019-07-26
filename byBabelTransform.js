'use strict';

function _toConsumableArray(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  } else {
    return Array.from(arr);
  }
}

(function (win, doc) {
  var $$ = {
    createEl: function createEl(tag, className) {
      var el = doc.createElement(tag);
      el.className = className;
      return el;
    },
    _triggerCustomEvent: function _triggerCustomEvent(type, other) {
      var event = doc.createEvent('CustomEvent');
      event.initCustomEvent(type, true, true, other);
      other['dropdown'].dispatchEvent(event);
    }
  };
  var Search = function Search() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    this.data = options.data;
  };
  Search.prototype._autoComplete = function (value) {
    var res = [];
    if (!value) return res;
    this.data.forEach(function (_ref, i) {
      var name = _ref.name,
        type = _ref.type;

      if (name.toLowerCase().includes(value.toLowerCase())) {
        res.push({
          name: name,
          type: type
        });
      }
    });
    return res;
  };
  var Select = function Select(options) {
    this._init(options);
    Search.call(this, options);
  };
  Select.prototype = new Search();
  Select.prototype.constructor = Select;
  Select.prototype._init = function (_ref2) {
    var data = _ref2.data,
      container = _ref2.container;

    this.container = doc.querySelector(container);
    this.wrap = null;
    this.toggle = null;
    this.dropdown = null;
    this.searchBar = null;
    this._dataCategory(data);
    this._appendElems();
    this._bindEvent();
    this._show();
  };
  Select.prototype._dataCategory = function (data) {
    var _this = this;

    this.types = [];
    this.items = [];
    this.classified = {};
    var arr = [];
    data.forEach(function (_ref3) {
      var type = _ref3.type,
        name = _ref3.name,
        desc = _ref3.desc;

      if (!_this.types.includes(type)) {
        _this.types.push(type);
      }
      if (!_this.classified[type]) {
        _this.classified[type] = [];
      }
      if (!arr.includes(name)) {
        arr.push(name);
        var item = '<li class="Sel_list-item"title="' + desc + '">' + name + '</li>';
        _this.items.push(item);
        _this.classified[type].push(_this.items.length - 1);
      } else {
        _this.classified[type].push(arr.findIndex(function (_name) {
          return _name === name;
        }));
      }
    });
    this.allName = arr;
  };
  Select.prototype._appendElems = function () {
    this.wrap = $$.createEl('div', 'Sel_select-wrap');
    this._appendToggle();
    this._appendDropdown();
  };
  Select.prototype._appendToggle = function () {
    var _html = '<p class="Sel_select-chosen"id="Sel_select-chosen">\u672A\u9009\u62E9</p><div class="Sel_select-btn"><i class="Sel_select-arrow"></i></div>';
    var toggle = $$.createEl('div', 'Sel_select-toggle');
    toggle.innerHTML = _html;
    this.wrap.appendChild(toggle);
    this.chosen = toggle.querySelector('#Sel_select-chosen');
    this.toggle = toggle;
  };
  Select.prototype._appendDropdown = function () {
    var dropdown = $$.createEl('div', 'Sel_select-dropdown');
    dropdown.innerHTML = '<div class="Sel_search-wrap"><input type="text"class="Sel_search-bar"id="Sel_search-bar"placeholder="\u641C\u7D22"></div>';
    this.wrap.appendChild(dropdown);
    this.searchBar = dropdown.querySelector('#Sel_search-bar');
    this.dropdown = dropdown;
  };
  Select.prototype._getDropdownItemByType = function (type) {
    var _this2 = this;

    return this.classified[type].map(function (i) {
      return _this2.items[i];
    }).join('');
  };
  Select.prototype._appendDropdownItem = function () {
    var _this3 = this;

    if (this.itemLoaded) return;
    this.types.forEach(function (type) {
      var list = $$.createEl('div', 'Sel_select-list-wrap');
      list.Sel_listType = type;
      list.innerHTML = '<h4 class="Sel_list-type">' + type + '</h4><ul class="Sel_select-list">' + _this3._getDropdownItemByType(type) + '</ul>';
      _this3.dropdown.appendChild(list);
    });
    this.lists = [].concat(_toConsumableArray(this.dropdown.querySelectorAll('.Sel_select-list-wrap')));
    this.itemLoaded = true;
  };
  Select.prototype._updateDropdownItem = function (data, value) {
    var _this4 = this;

    var canReloadItem = void 0;
    if (!value) canReloadItem = true;
    if (!!data.length) {
      canReloadItem = true;
      this.lists.forEach(function (list) {
        var html = '';
        var _html = '';
        var _type = list.Sel_listType;
        list.innerHTML = '';
        data.forEach(function (_ref4) {
          var name = _ref4.name,
            type = _ref4.type;

          if (_type === type) {
            _html = '<h4 class="Sel_list-type">' + type + '</h4>';
            var i = _this4.allName.findIndex(function (_name) {
              return _name === name;
            });
            html += '<ul class="Sel_select-list">' + _this4.items[i] + '</ul>';
          }
        });
        list.innerHTML = _html + html;
      });
    } else {
      if (canReloadItem) {
        this.lists.forEach(function (list) {
          _this4.dropdown.removeChild(list);
        });
        this.itemLoaded = false;
        this._appendDropdownItem();
        canReloadItem = false;
      }
    }
  };
  Select.prototype._bindEvent = function () {
    var self = this;
    var canShow = false;
    this.toggle.addEventListener('click', function () {
      canShow = !canShow;
      if (canShow) {
        self.dropdown.style.display = 'block';
        self._appendDropdownItem();
        setTimeout(function () {
          self.dropdown.style.height = '300px';
        });
      } else {
        self.dropdown.style.height = 0;
        setTimeout(function () {
          self.dropdown.style.display = 'none';
        }, 300);
      }
    });
    this.dropdown.addEventListener('click', function (e) {
      var curTarget = e.target;
      if (curTarget.className === 'Sel_list-item') {
        $$._triggerCustomEvent('showInfo', {
          dropdown: self.dropdown,
          curTarget: curTarget,
          chosen: self.chosen,
          allName: self.allName
        });
        self.chosen.innerHTML = curTarget.innerText;
        self.toggle.click();
      }
    });
    this.searchBar.addEventListener('input', function () {
      var res = self._autoComplete(this.value);
      self._updateDropdownItem(res, this.value);
    });
    this.searchBar.onfocus = function () {
      this.select();
    };
  };
  Select.prototype._show = function () {
    this.container.appendChild(this.wrap);
  };
  win.$Select = Select;
})(window, document);

(function () {
  function getJSON(url, callback) {
    var xhr = new XMLHttpRequest();
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
  getJSON('./json/select.json', function (data) {
    var select = new $Select({
      container: '#wrap',
      data: data
    });
    var prevInfo = document.querySelector('.prev-info'),
      curInfo = document.querySelector('.current-info'),
      tips = document.querySelector('#tips');
    select.dropdown.addEventListener('showInfo', function (e) {
      tips.style.display = 'block';
      var _e$detail = e.detail,
        chosen = _e$detail.chosen,
        curTarget = _e$detail.curTarget,
        allName = _e$detail.allName;

      var _innerText = chosen.innerText;
      prevInfo.innerHTML = _innerText === '未选择' ? ' - undefined' : _innerText + ('-' + allName.findIndex(function (name) {
        return name === _innerText;
      }));
      curInfo.innerHTML = curTarget.innerHTML + ('-' + allName.findIndex(function (name) {
        return name === curTarget.innerHTML;
      }));
    });
  });
})();
