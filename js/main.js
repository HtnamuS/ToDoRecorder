"use strict";


(function () {

	let todoList = document.getElementById(utils.todoTaskListId);
	let completedList = document.getElementById(utils.completedTaskListId);
	let todoInputField = document.getElementById(utils.newTodoInputId);
	let markAllTodoButton = document.getElementById(utils.markAllTodoId);
	let markAllCompletedButton = document.getElementById(utils.markAllCompletedId);
	let clearAllButton = document.getElementById(utils.clearAllId);
	let completedTasksListHead = document.getElementsByClassName(utils.completedTasksListHeadClass)[0];
	let dragDetails = {
		draggedElement: undefined,
		draggedElementIndex: undefined,
		draggedElementList: undefined,
		draggedPlaceHolderIndex: undefined,
		draggedPlaceHolderElement: undefined,
	};

	function checkListsForUpdates() {


		if (todoList.getElementsByClassName(utils.taskListElementClass).length === 0 && document.getElementById(utils.noTodoTasksMessageId).style.opacity === '0') {
			document.getElementById(utils.noTodoTasksMessageId).style.opacity = '1';
			markAllCompletedButton.disabled = true;
		} else if (todoList.getElementsByClassName(utils.taskListElementClass).length > 0) {
			if (document.getElementById(utils.noTodoTasksMessageId)) {
				document.getElementById(utils.noTodoTasksMessageId).style.opacity = '0';
			}
			markAllCompletedButton.disabled = false;
		}
		if (completedList.getElementsByClassName(utils.taskListElementClass).length === 0 && document.getElementById(utils.noCompletedTasksMessageId).style.opacity === '0') {
			document.getElementById(utils.noCompletedTasksMessageId).style.opacity = '1';
			markAllTodoButton.disabled = true;
		} else if (completedList.getElementsByClassName(utils.taskListElementClass).length > 0) {
			if (document.getElementById(utils.noCompletedTasksMessageId)) {
				document.getElementById(utils.noCompletedTasksMessageId).style.opacity = '0';
			}
			markAllTodoButton.disabled = false;
		}
		clearAllButton.disabled = markAllCompletedButton.disabled && markAllTodoButton.disabled;

		if (completedTasksListHead.classList.contains(utils.compressedListClass)) {
			for (let childNode of completedList.childNodes) {
				if (childNode.id !== utils.newTodoDivisionId && childNode.id !== utils.todoInitialPlaceholderId) {
					childNode.style.display = 'none';
				}
			}
			if (completedList.childNodes.length > 1) {
				console.log('1');
				completedTasksListHead.textContent = utils.arrowRight + ' Completed Tasks: ' + (completedList.childNodes.length - 1) / 2;
			} else {
				console.log('2');
				completedTasksListHead.textContent = utils.arrowRight + ' Completed Tasks';
			}
			document.getElementById(utils.noCompletedTasksMessageId).style.opacity = '0';
		} else if (completedList.childNodes.length > 1) {
			console.log('3');
			completedTasksListHead.textContent = utils.arrowDown + ' Completed Tasks: ' + (completedList.childNodes.length - 1) / 2;
		} else {
			completedTasksListHead.textContent = utils.arrowDown + ' Completed Tasks';
		}
	}

	function removeTODO(node, e) {
		if (e) {
			e.stopPropagation();
		}
		let list = node.parentElement;
		let originalPlaceHolderIndex = Array.from(list.childNodes).indexOf(node) - 1;
		let origPlaceHolder = Array.from(list.childNodes)[originalPlaceHolderIndex];
		// noinspection JSCheckFunctionSignatures
		list.removeChild(origPlaceHolder);
		list.removeChild(node);
		checkListsForUpdates();
	}

	function checkTodo(todoNode) {
		let todoTextElement = todoNode.getElementsByClassName(utils.todoTaskTextClass)[0];
		let elementIndex = Array.from(todoList.childNodes).indexOf(todoNode);
		let placeHolderElement = Array.from(todoList.childNodes)[elementIndex - 1];
		todoTextElement.className = utils.completedTaskTextClass;
		completedList.insertBefore(todoNode, completedList.childNodes[0]);
		completedList.insertBefore(placeHolderElement, todoNode);
		checkListsForUpdates();
	}

	function uncheckTodo(completedNode) {
		let todoTextElement = completedNode.getElementsByClassName(utils.completedTaskTextClass)[0];
		let elementIndex = Array.from(completedList.childNodes).indexOf(completedNode);
		let placeHolderElement = Array.from(completedList.childNodes)[elementIndex - 1];
		todoTextElement.className = utils.todoTaskTextClass;
		todoList.insertBefore(completedNode, todoList.childNodes[0]);
		todoList.insertBefore(placeHolderElement, completedNode);
		checkListsForUpdates();
	}

	let dragFunctions = {
		dragStart: function dragStart(e) {
			dragDetails.draggedElement = this;
			dragDetails.draggedElement.classList.add("FocusElement");
			dragDetails.draggedElementList = dragDetails.draggedElement.parentElement;
			dragDetails.draggedElementIndex = Array.from(dragDetails.draggedElementList.childNodes).indexOf(dragDetails.draggedElement);
			dragDetails.draggedPlaceHolderIndex = dragDetails.draggedElementIndex - 1;
			dragDetails.draggedPlaceHolderElement = dragDetails.draggedElementList.childNodes[dragDetails.draggedPlaceHolderIndex];
			this.classList.add('dragged');
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/html', this.innerHTML);
			this.style.opacity = '0.4';
		},
		dragEnter: function dragEnter() {
			let targetIndex = Array.from(this.parentElement.childNodes).indexOf(this);
			if (this.parentElement === dragDetails.draggedElementList) {
				if (Math.abs(targetIndex - dragDetails.draggedElementIndex) === 1) {
					return;
				}
			}
			this.classList.add('over');
		},
		dragLeave: function dragLeave(e) {
			e.stopPropagation();
			this.classList.remove('over');
		},
		dragOver: function dragOver(e) {
			e.preventDefault();
			e.dataTransfer.dropEffect = 'move';
			return false;
		},
		dragDrop: function dragDrop() {
			let targetList = this.parentElement;
			let targetIndex = Array.from(this.parentElement.childNodes).indexOf(this);
			if (this.parentElement === dragDetails.draggedElementList) {
				if (Math.abs(targetIndex - dragDetails.draggedElementIndex) === 1) {
					this.classList.remove('over');
					return false;
				}
			} else {
				if (targetList.id === utils.todoTaskListId) {
					uncheckTodo(dragDetails.draggedElement);
				} else if (targetList.id === utils.completedTaskListId) {
					checkTodo(dragDetails.draggedElement);
				}
			}
			this.classList.remove('over');
			// noinspection JSCheckFunctionSignatures
			targetList.insertBefore(dragDetails.draggedPlaceHolderElement, this);
			targetList.insertBefore(dragDetails.draggedElement, this);
			return false;
		},
		dragEnd: function dragEnd() {
			this.classList.remove("FocusElement");
			this.classList.remove('dragged');
			this.style.opacity = '1';
			let listItems = document.querySelectorAll('.draggable');
			[].forEach.call(listItems, function (item) {
				item.classList.remove('over');
			});
		}
	};

	function addEventsDragAndDrop(el) {
		el.addEventListener('dragenter', dragFunctions.dragEnter, false);
		el.addEventListener('dragover', dragFunctions.dragOver, false);
		el.addEventListener('dragleave', dragFunctions.dragLeave, false);
		el.addEventListener('drop', dragFunctions.dragDrop, false);
	}

	(function makePlaceHolderDroppable() {
		let todoPlaceHolder = todoList.getElementsByClassName(utils.tasksListPlaceholderClass)[0];
		addEventsDragAndDrop(todoPlaceHolder);
		let completedPlaceHolder = completedList.getElementsByClassName(utils.tasksListPlaceholderClass)[0];
		addEventsDragAndDrop(completedPlaceHolder);
	})();

	function makeDraggable(listElement) {
		listElement.draggable = true;
		listElement.addEventListener('dragstart', dragFunctions.dragStart, false);
		listElement.addEventListener('dragend', dragFunctions.dragEnd, false);
	}

	function addChildNodesToParentNode(parentNode, ...childNodes) {
		for (let childNode of childNodes) {
			parentNode.appendChild(childNode);
		}
	}

	let createElements = {
		createDragElement: function createDragElement() {
			let dragSpan = document.createElement('span');
			let dragText = document.createTextNode(String.fromCharCode(0x2630));
			dragSpan.className = "dragElement";
			dragSpan.appendChild(dragText);
			dragSpan.onclick = function (e) {
				e.stopPropagation();
			};
			return dragSpan;
		},
		createCloseButtonForNode: function createCloseButtonForNode(todoNode) {
			let crossElement = document.createTextNode(String.fromCharCode(0x2715));
			let closeButton = document.createElement('span');
			closeButton.appendChild(crossElement);
			closeButton.className = utils.closeButtonClass;
			closeButton.onclick = function (e) {
				removeTODO(todoNode, e);
			};
			return closeButton;
		},
		createTextTodoNode: function createTextTodoNode(text) {
			let todoDiv = document.createElement('span');
			todoDiv.className = utils.todoTaskTextClass;
			todoDiv.contentEditable = 'true';

			let textNode = document.createTextNode(text);
			todoDiv.appendChild(textNode);
			todoDiv.addEventListener("focusout", function () {
				todoDiv.contentEditable = 'false';
				if (todoDiv.textContent.trim() === '') {
					removeTODO(todoDiv.parentElement);
				}
				todoDiv.parentElement.classList.remove("FocusElement");
				todoInputField.focus();
				checkListsForUpdates();
			});
			todoDiv.addEventListener('keydown', function (event) {
				if (event.code === "Enter") {
					todoInputField.focus();
				}
			});
			return todoDiv;
		},
		createPlaceHolder: function createPlaceHolder() {
			let placeHolder = document.createElement('li');
			placeHolder.className = utils.tasksListPlaceholderClass;
			addEventsDragAndDrop(placeHolder);
			return placeHolder;
		},
		createNewNodeWithText: function createNewNodeWithText(todoText) {
			let newTodoNode = document.createElement("li");
			newTodoNode.className = utils.taskListElementClass;
			let newDragElement = this.createDragElement();
			let newTodoText = this.createTextTodoNode(todoText);
			let closeButton = this.createCloseButtonForNode(newTodoNode);
			addChildNodesToParentNode(newTodoNode, newDragElement, newTodoText, closeButton);
			let prevent = false;
			let delay = 150;
			let timer;
			newTodoNode.onclick = function () {
				timer = setTimeout(function () {
					if (!prevent) {
						if (newTodoNode.parentElement.id === utils.todoTaskListId) {
							checkTodo(newTodoNode);
						} else {
							uncheckTodo(newTodoNode);
						}

					}
					prevent = false;
				}, delay);
			};
			newTodoNode.ondblclick = function (e) {
				e.stopPropagation();
				clearTimeout(timer);
				prevent = true;
				newTodoText.contentEditable = 'true';
				newTodoNode.classList.add('FocusElement');
				utils.setEndOfContenteditable(newTodoText);
				newTodoText.focus();
			};
			let placeHolder = createElements.createPlaceHolder();
			todoList.insertBefore(placeHolder, todoList.childNodes[todoList.childNodes.length - 2]);
			todoList.insertBefore(newTodoNode, todoList.childNodes[todoList.childNodes.length - 2]);
			makeDraggable(newTodoNode);
			return {newTodoNode, newTodoText};
		},
	};

	function makeNewTodo() {
		let newElements = createElements.createNewNodeWithText(todoInputField.value);
		todoInputField.value = '';
		utils.setEndOfContenteditable(newElements.newTodoText);
		newElements.newTodoText.focus();
		newElements.newTodoNode.classList.add('FocusElement');
		checkListsForUpdates();
	}

	function markAllTodo() {
		if(completedTasksListHead.classList.contains(utils.compressedListClass)){
			expandList(completedList);
			while (completedList.getElementsByClassName(utils.taskListElementClass).length > 0) {
				uncheckTodo(completedList.childNodes[1]);
			}
			compressList(completedList);
		}
		else{
			while (completedList.getElementsByClassName(utils.taskListElementClass).length > 0) {
				uncheckTodo(completedList.childNodes[1]);
			}
		}

		checkListsForUpdates();
	}

	function markAllCompleted() {
		while (todoList.getElementsByClassName(utils.taskListElementClass).length > 0) {
			checkTodo(todoList.childNodes[1]);
		}
		checkListsForUpdates();
	}

	function clearAll() {
		while (todoList.getElementsByClassName(utils.taskListElementClass).length > 0) {
			removeTODO(todoList.childNodes[1]);
		}
		while (completedList.getElementsByClassName(utils.taskListElementClass).length > 0) {
			removeTODO(completedList.childNodes[1]);
		}
		checkListsForUpdates();
	}

	function compressList(list) {
		for (let childNode of list.childNodes) {
			if (childNode.id !== utils.newTodoDivisionId && childNode.id !== utils.todoInitialPlaceholderId) {
				childNode.style.display = 'none';
			}
		}
		completedTasksListHead.classList.add(utils.compressedListClass);
		checkListsForUpdates();
	}

	function expandList(list) {
		for (let childNode of list.childNodes) {
			childNode.style.display = 'block';
		}
		completedTasksListHead.classList.remove(utils.compressedListClass);
		checkListsForUpdates();
	}

	(function config() {
		(function submitTodoOnEnter() {
			let todoInputField = document.getElementById(utils.newTodoInputId);
			todoInputField.addEventListener('keyup', function () {
				if (todoInputField.value.length > 0) {
					makeNewTodo();
				}
			});
		})();

		(function markAllTodoButtonOnClick() {
			let markAllTodoButton = document.getElementById(utils.markAllTodoId);
			markAllTodoButton.onclick = markAllTodo;
		})();

		(function markAllCompletedButtonOnClick() {
			let markAllCompletedButton = document.getElementById(utils.markAllCompletedId);
			markAllCompletedButton.onclick = markAllCompleted;
		})();

		(function clearAllButtonOnClick() {
			let clearAllButton = document.getElementById(utils.clearAllId);
			clearAllButton.onclick = clearAll;
		})();

		(function completedTasksListHeadOnClick() {
			completedTasksListHead.onclick = function () {
				if (completedTasksListHead.classList.contains(utils.compressedListClass)) {
					expandList(completedList);
					completedTasksListHead.classList.remove(utils.compressedListClass);
					completedTasksListHead.textContent = utils.arrowDown + completedTasksListHead.textContent.substr(1);
				} else {
					compressList(completedList);
					completedTasksListHead.classList.add(utils.compressedListClass);
					console.log('5');

					completedTasksListHead.textContent = utils.arrowRight + completedTasksListHead.textContent.substr(1);
				}
			}
		})();

		(function displayNoTasksInitially() {
			checkListsForUpdates();
		})();
	})();
})();
