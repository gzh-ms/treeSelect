(function (win, doc) {
	// 方法
	const $$ = {
		// 创造dom元素 param: string
		createEl(tag, className) {
			let el = doc.createElement(tag);
			el.className = className;
			return el;
		},
		// 触发自定义事件 param: string、{}
		_triggerCustomEvent(type, other) {
			let event = doc.createEvent('CustomEvent');
			event.initCustomEvent(type, true, true, other);
			other['dropdown'].dispatchEvent(event);
		}
	};

	// search
	const Search = function (options = {}) {
		this.data = options.data;
	};

	// 自动完成 param: string
	Search.prototype._autoComplete = function (value) {
		let res = [];
		if (!value) return res;
		this.data.forEach(({
			name,
			type
		}, i) => {
			if (name.toLowerCase().includes(value.toLowerCase())) {
				res.push({
					name: name,
					type: type
				});
			}
		});
		return res;
	};

	// select
	const Select = function (options) {

		this._init(options);
    
		Search.call(this, options);
	};

	Select.prototype = new Search();
	Select.prototype.constructor = Select;

	// init param: {}
	Select.prototype._init = function ({
		data,
		container
	}) {

		this.container = doc.querySelector(container); // 放置select的容器

		this.wrap = null; // 内部容器
		this.toggle = null; // 操作开关
		this.dropdown = null; // 下拉框
		this.searchBar = null; // 搜索条

		this._dataCategory(data);
		this._appendElems();
		this._bindEvent();
		this._show();
	};
	// 数据分类 param: []
	Select.prototype._dataCategory = function (data) {
		this.types = []; // 分类名
		this.items = []; // 各项目
		this.classified = {};

		let arr = [];
		data.forEach(({type, name, desc}) => {

			if (!this.types.includes(type)) {
				this.types.push(type);
			}

			if (!this.classified[type]) {
				this.classified[type] = [];
			}

			if (!arr.includes(name)) {
				arr.push(name);

				let item = `<li class="Sel_list-item" title="${desc}">${name}</li>`

				this.items.push(item);
				this.classified[type].push(this.items.length - 1);
			} else {
				this.classified[type].push(arr.findIndex(_name => _name === name));
			}
		});
		this.allName = arr; // 项目名
	};
	// 生成全部结构 param: 
	Select.prototype._appendElems = function () {
		this.wrap = $$.createEl('div', 'Sel_select-wrap');

		this._appendToggle();
		this._appendDropdown();
	};
	// 生成开关 param: 
	Select.prototype._appendToggle = function () {
		let _html = ` <p class="Sel_select-chosen" id="Sel_select-chosen">未选择</p>
                  <div class="Sel_select-btn">
                    <i class="Sel_select-arrow"></i>
                  </div>`;

		let toggle = $$.createEl('div', 'Sel_select-toggle');
		toggle.innerHTML = _html;
		this.wrap.appendChild(toggle);

		this.chosen = toggle.querySelector('#Sel_select-chosen');
		this.toggle = toggle;
	};
	// 生成下拉列表容器 param:
	Select.prototype._appendDropdown = function () {
		let dropdown = $$.createEl('div', 'Sel_select-dropdown');
		dropdown.innerHTML = `<div class="Sel_search-wrap">
                                    <input type="text" class="Sel_search-bar" id="Sel_search-bar" placeholder="搜索">
                                 </div>`;

		this.wrap.appendChild(dropdown);
		this.searchBar = dropdown.querySelector('#Sel_search-bar');
		this.dropdown = dropdown;

	};
	// 获取下拉列表每项 param: string
	Select.prototype._getDropdownItemByType = function (type) {
		return this.classified[type].map(i => this.items[i]).join('');
	};
	// 生成下拉内容 param:
	Select.prototype._appendDropdownItem = function () {
		if (this.itemLoaded) return; // 内容是否已加载

		this.types.forEach(type => {
			let list = $$.createEl('div', 'Sel_select-list-wrap');
			list.Sel_listType = type; // 把列表类型存储在dom上

			list.innerHTML = `<h4 class="Sel_list-type">${type}</h4>
                        <ul class="Sel_select-list">
                            ${this._getDropdownItemByType(type)}
                        </ul>`;
			this.dropdown.appendChild(list);
		});

		this.lists = [...this.dropdown.querySelectorAll('.Sel_select-list-wrap')];
		this.itemLoaded = true;
	};
	// 重新渲染下拉内容 param: []、string
	Select.prototype._updateDropdownItem = function (data, value) {
		let canReloadItem; // 内容能否重载
		if (!value) canReloadItem = true; // 文本框值为空
		if (!!data.length) { // 搜索到数据
			canReloadItem = true;
			this.lists.forEach(list => { // 列表的内容替换为搜索结果
				let html = ``;
				let _html = ``;
				let _type = list.Sel_listType; // 获取dom上存储列表类型
				list.innerHTML = '';
				// data结构：[{name,type},{name,type}...]
				data.forEach(({
					name,
					type
				}) => {
					if (_type === type) { // 只获得对应列表下的内容
						_html = `<h4 class="Sel_list-type">${type}</h4>`;
						let i = this.allName.findIndex(_name => _name === name);
						html += `<ul class="Sel_select-list">
                        ${this.items[i]}
                    </ul>`;
					}
				});
				list.innerHTML = _html + html;
			});
		} else { // 没有搜索到数据
			if (canReloadItem) {
				this.lists.forEach(list => {
					this.dropdown.removeChild(list);
				});

				this.itemLoaded = false;
				this._appendDropdownItem();
				canReloadItem = false;
			}
		}
	};
	// 绑定事件 param：
	Select.prototype._bindEvent = function () {
		let self = this;

		// 显示隐藏下拉列表
		let canShow = false;
		this.toggle.addEventListener('click', function () {
			canShow = !canShow;
			if (canShow) {
				self.dropdown.style.display = 'block';
				self._appendDropdownItem();
				setTimeout(() => {
					self.dropdown.style.height = '300px';
				});
			} else {
				self.dropdown.style.height = 0;
				setTimeout(() => {
					self.dropdown.style.display = 'none';
				}, 300);

			}
		});

		// 下拉列表点击事件
		this.dropdown.addEventListener('click', function (e) {
			let curTarget = e.target;
			if (curTarget.className === 'Sel_list-item') {

				$$._triggerCustomEvent('showInfo', { //发布消息
					dropdown: self.dropdown,
					curTarget: curTarget,
					chosen: self.chosen,
					allName: self.allName
				});
				self.chosen.innerHTML = curTarget.innerText;
				self.toggle.click();
			}
		});

		// 搜索框input事件   
		this.searchBar.addEventListener('input', function () {

			let res = self._autoComplete(this.value);
			self._updateDropdownItem(res, this.value);
		});

		// 搜索框onfocus事件
		this.searchBar.onfocus = function () {
			this.select();
		};
	};
	// 显示 param:
	Select.prototype._show = function () {
		this.container.appendChild(this.wrap);
	};

	win.$Select = Select;
})(window, document);
