"use strict";

const todoRecorderView = (function () {
	function createTaskElement(taskText, handlers, taskTextClass, taskTextHoverClass) {
		function addChildNodesToParentNode(parentNode, ...childNodes) {
			for (let childNode of childNodes) {
				parentNode.appendChild(childNode);
			}
		}

		let createTextNode = function createTextNode() {
			let taskTextSpan = document.createElement('span');
			taskTextSpan.className = taskTextClass;
			taskTextSpan.appendChild(document.createTextNode(taskText));
			let currentElementView = this;
			taskTextSpan.addEventListener("focusout", function () {
				currentElementView.makeTaskTextElementContentEditableFalse();
				if (taskTextSpan.textContent.trim() === '') {
					handlers.removeTask();
				} else {
					handlers.updateTaskText(taskTextSpan.textContent);
				}
				todoRecorderView.todoInputFieldView.focus();
			});
			taskTextSpan.onkeydown = function (event) {
				if (event.code === "Enter") {
					todoRecorderView.todoInputFieldView.focus();
				}
			};
			taskTextSpan.onmouseenter = function () {
				taskTextSpan.classList.add(taskTextHoverClass);
			};
			taskTextSpan.onmouseleave = function () {
				taskTextSpan.classList.remove(taskTextHoverClass);
			};
			taskTextSpan.onclick = handlers.taskTextClickHandler;
			taskTextSpan.ondblclick = handlers.taskTextDoubleClickHandler;
			return taskTextSpan;
		};

		function createCloseButtonForNode() {
			let crossElement = document.createTextNode(String.fromCharCode(0x2715));
			let closeButton = document.createElement('span');
			closeButton.appendChild(crossElement);
			closeButton.className = utils.closeButtonClass;
			closeButton.onclick = handlers.removeTask;
			return closeButton;
		}

		function createPlaceHolder() {
			let placeHolder = document.createElement('li');
			placeHolder.className = utils.tasksListPlaceholderClass;
			// makeElementDroppable(placeHolder); TODO
			return placeHolder;
		}

		function createDragElement() {
			let dragSpan = document.createElement('span');
			let dragText = document.createTextNode(String.fromCharCode(0x2630));
			dragSpan.className = "dragElement";
			dragSpan.appendChild(dragText);
			dragSpan.onclick = function (e) {
				e.stopPropagation();
			};
			return dragSpan;
		}

		let newTodoNode = document.createElement("li");
		newTodoNode.className = utils.taskListElementClass;
		let newTodoText = createTextNode.call(this,taskText);
		let closeButton = createCloseButtonForNode();
		let placeHolder = createPlaceHolder();
		let newDragElement = createDragElement();
		addChildNodesToParentNode(newTodoNode, newDragElement, newTodoText, closeButton);
		// makeElementDraggable(newTodoNode); TODO
		return {
			taskNode: newTodoNode,
			placeHolder
		};
	}

	const tasksListView = (function () {
		return {
			removeTaskView : function (taskView) {
				let taskElements = taskView.getElements();
				this.tasksList.removeChild(taskElements.taskNode);
				this.tasksList.removeChild(taskElements.placeHolder);
			},
			unshiftTaskView: function(taskView){
				let domElements = taskView.getElements();
				this.tasksList.insertBefore(domElements.taskNode, this.tasksList.firstChild);
				this.tasksList.insertBefore(domElements.placeHolder, this.tasksList.firstChild);
				this.noTasksMessage.style.opacity = '0';
			},
			checkIfEmpty: function(){
				let numberOfTasks = this.tasksList.getElementsByClassName(utils.taskListElementClass).length;
				if(numberOfTasks === 0){
					this.noTasksMessage.style.opacity = '1';
					return true;
				}
				return false;
			}
		};
	})();
	const taskElementView = (function () {
		function setEndOfContentEditable(contentEditableElement) {
			let range,selection;
			range = document.createRange();//Create a range (a range is a like the selection but invisible)
			range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
			range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
			selection = window.getSelection();//get the selection object (allows you to change selection)
			selection.removeAllRanges();//remove any selections already made
			selection.addRange(range);//make the range you have just created the visible selection
		}
		function getTextNode(taskNode){
			let textNode;
			let completedTextNodes = taskNode.getElementsByClassName(utils.completedTaskTextClass);
			let todoTextNodes = taskNode.getElementsByClassName(utils.todoTaskTextClass);
			if(todoTextNodes.length === 1){
				textNode = todoTextNodes[0];
			}
			else if(completedTextNodes.length === 1){
				textNode = completedTextNodes[0];
			}
			else{
				throw{
					name: "Wrong Number Of TextNodes"
				}
			}
			return textNode;
		}
		return {
			makeTaskTextElementContentEditableTrue: function () {
				let taskNode = this.getElements().taskNode;
				let textNode = getTextNode(taskNode);
				taskNode.classList.add('FocusElement');
				textNode.contentEditable = 'true';
				textNode.classList.add(utils.contentEditingClassName);
				textNode.focus();
				setEndOfContentEditable(textNode);
			},
			makeTaskTextElementContentEditableFalse: function () {
				let taskNode = this.getElements().taskNode;
				let textNode = getTextNode(taskNode);
				taskNode.classList.remove('FocusElement');
				textNode.contentEditable = 'false';
				textNode.classList.remove(utils.contentEditingClassName);
				textNode.focus();
				setEndOfContentEditable(textNode);
			},
			isTaskTextElementContentEditable: function () {
				let taskNode = this.getElements().taskNode;
				let textNode = getTextNode(taskNode);
				return textNode.contentEditable === 'true';
			},
			getElements : function () {
				return this.taskElements;
			}

			// drag Functions
			// clear task
			//task editable
			//placeholder view
			// getElementType
		};
	})();

	let TodoTaskElementView = function (todoText, handlers) {
		this.taskElements = createTaskElement.call(this,todoText, handlers, utils.todoTaskTextClass, utils.todoTaskTextHoverClassName);
		// .markCompleted
	};
	const CompletedTaskElementView = function (todoText, handlers) {
		this.taskElements = createTaskElement.call(this,todoText,handlers, utils.completedTaskTextClass, utils.completedTaskTextHoverClassName);
		// .markTodo
	};

	TodoTaskElementView.prototype = taskElementView;
	CompletedTaskElementView.prototype = taskElementView;

	return {
		actionBarView: (function () {
			let markAllCompletedButton = document.getElementByNodeId(utils.markAllCompletedButtonNodeID);
			let clearAllButton = document.getElementByNodeId(utils.clearAllButtonNodeID);
			return {
				bindHandlerToMarkAllCompletedButton: function (handler) {
					markAllCompletedButton.onclick = handler;
				},
				bindHandlerToClearAllButton: function (handler) {
					clearAllButton.onclick = handler;
				},
				deactivateClearAllButton : function () {
					clearAllButton.disabled = true;
				},
				activateClearAllButton : function () {
					clearAllButton.disabled = false;
				},
				activateMarkAllCompletedButton : function () {
					markAllCompletedButton.disabled = false;
				},
				deactivateMarkAllCompletedButton: function () {
					markAllCompletedButton.disabled = true;
				}
			};
		})(),
		todoTasksListView: (function () {
			let todoTaskListViewObj = Object.create(tasksListView);

			todoTaskListViewObj.tasksList = document.getElementByNodeId(utils.todoListNodeID);
			todoTaskListViewObj.noTasksMessage = document.getElementByNodeId(utils.noTodoTasksMessageNodeID);
			todoTaskListViewObj.listType = utils.todoConstant;

			todoTaskListViewObj.createTodoTaskElementView = function (todoText, handlers) {
				return new TodoTaskElementView(todoText, handlers);
			};
			todoTaskListViewObj.pushTaskView = function (taskView) {
				let domElements = taskView.getElements();
				let listChildNodes = this.tasksList.getElementsByTagName('li');

				let targetIndex = listChildNodes.length - 2;
				this.tasksList.insertBefore(domElements.taskNode, listChildNodes[targetIndex]);
				this.tasksList.insertBefore(domElements.placeHolder, domElements.taskNode);
				this.noTasksMessage.style.opacity = '0';
			};
			//.markAllCompleted
			return todoTaskListViewObj;
		})(),
		completedTasksListView: (function () {
			let completedTaskListViewObj = Object.create(tasksListView);
			let markAllTodoButton = document.getElementByNodeId(utils.markAllTodoButtonNodeID);
			completedTaskListViewObj.tasksList = document.getElementByNodeId(utils.completedListNodeId);
			completedTaskListViewObj.noTasksMessage = document.getElementByNodeId(utils.noCompletedTasksMessageNodeId);
			completedTaskListViewObj.listType = utils.completedConstant;

			completedTaskListViewObj.createCompletedTaskElementView = function (todoText, handlers) {
				let completedElementView = new CompletedTaskElementView(todoText, handlers);
				let newDomElements = completedElementView.getElements();
				let completedListChildNodes = completedTaskListViewObj.tasksList.getElementsByTagName('li');
				let targetIndex = completedListChildNodes.length - 2;

				completedTaskListViewObj.tasksList.insertBefore(newDomElements.taskNode, completedListChildNodes[targetIndex]);
				completedTaskListViewObj.tasksList.insertBefore(newDomElements.placeHolder, newDomElements.taskNode);

				return completedElementView;
			};
			completedTaskListViewObj.pushTaskView = function (taskView) {
				let domElements = taskView.getElements();

				this.tasksList.append(domElements.placeHolder);
				this.tasksList.append(domElements.taskNode);
				this.noTasksMessage.style.opacity = '0';
			};
			completedTaskListViewObj.bindHandlerToMarkAllTodoButton = function (handler) {
				markAllTodoButton.onclick = handler;
			};
			completedTaskListViewObj.deactivateMarkAllTodoButton = function () {
				markAllTodoButton.disabled = true;
			};
			completedTaskListViewObj.activateMarkAllTodoButton = function () {
				markAllTodoButton.disabled = false;
			};
			return completedTaskListViewObj;
		})(),
		todoInputFieldView: (function () {
			const todoInputField = document.getElementByNodeId(utils.newTodoInputFieldNodeId);
			let todoInputFieldViewObj = {};
			todoInputFieldViewObj.bindKeyUpHandler = function (handler) {
				todoInputField.onkeyup = function () {
					if (todoInputField.value.length > 0) {
						handler(todoInputField.value);
						todoInputField.value = '';
					}

				}
			};
			todoInputFieldViewObj.focus = function () {
				todoInputField.focus();
			};
			return todoInputFieldViewObj;
		})(),
	};
})();