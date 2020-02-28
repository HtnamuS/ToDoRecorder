"use strict";
const view = {
	init: function () {},
	render: function () {},
	delete: function () {}
};

function ActionBarView() {
	let markAllCompletedButton = document.getElementByNodeId(utils.markAllCompletedButtonNodeID);
	let clearAllButton = document.getElementByNodeId(utils.clearAllButtonNodeID);
	this.init = function () {
		markAllCompletedButton.disabled = true;
		clearAllButton.disabled = true;
	};
	this.bindHandlerToMarkAllCompletedButton = function (handler) {
		markAllCompletedButton.onclick = handler;
	};
	this.bindHandlerToClearAllButton = function (handler) {
		clearAllButton.onclick = handler;
	};
	this.deactivateClearAllButton = function () {
		clearAllButton.disabled = true;
	};
	this.activateClearAllButton = function () {
		clearAllButton.disabled = false;
	};
	this.activateMarkAllCompletedButton = function () {
		markAllCompletedButton.disabled = false;
	};
	this.deactivateMarkAllCompletedButton = function () {
		markAllCompletedButton.disabled = true;
	};
}

ActionBarView.prototype = view;

function TasksListView() {
	let todoRecorderViewCallbacks;
	
	this.init = function (callbacks) {
		this.taskElementViewCollection = [];
		todoRecorderViewCallbacks = callbacks;
	};
	this.checkIfEmpty = function () {
		let numberOfTasks = this.tasksList.getElementsByClassName(utils.taskListElementClass).length;
		if (numberOfTasks === 0) {
			this.noTasksMessage.style.opacity = '1';
			return true;
		}
		return false;
	};
	this.removeTask = function (taskDomElements) {
		this.tasksList.removeChild(taskDomElements.taskNode);
		this.tasksList.removeChild(taskDomElements.placeHolder);
		if (this.checkIfEmpty()) {
			this.noTasksMessage.style.opacity = '1';
		}
		todoRecorderViewCallbacks.updateButtonActiveness();
	};
}

TasksListView.prototype = view;

function TodoTasksListView() {
	let todoRecorderViewCallbacks;
	
	let todoElementHandlers = {
		addElementToList: function (taskDomElements) {
			let listChildNodes = this.tasksList.getElementsByTagName('li');
			let targetIndex = listChildNodes.length - 2;
			
			this.tasksList.insertBefore(taskDomElements.taskNode, listChildNodes[targetIndex]);
			this.tasksList.insertBefore(taskDomElements.placeHolder, taskDomElements.taskNode);
			this.noTasksMessage.style.opacity = '0';
			todoRecorderViewCallbacks.updateButtonActiveness();
		}.bind(this),
		taskTextUpdatedHandler: function () {
			todoRecorderViewCallbacks.taskTextUpdatedHandler();
		}.bind(this),
		removeTask: this.removeTask.bind(this),
		markAsCompleted: function (taskDomElements, taskText) {
			todoRecorderViewCallbacks.createCompletedTask(taskText);
			this.removeTask.call(this, taskDomElements);
		}.bind(this),
	};
	this.init = function (callbacks) {
		Object.getPrototypeOf(this).init.call(this, callbacks);
		this.tasksList = document.getElementByNodeId(utils.todoListNodeID);
		this.noTasksMessage = document.getElementByNodeId(utils.noTodoTasksMessageNodeID);
		todoRecorderViewCallbacks = callbacks;
	};
	this.createTodoTaskElement = function (todoText, flag) {
		let newTaskElementView = new TodoTaskElementView();
		
		newTaskElementView.init(todoText, todoElementHandlers);
		newTaskElementView.render();
		if (flag === utils.newFlag) {
			newTaskElementView.makeTaskTextContentEditableTrue();
		}
		this.taskElementViewCollection.push(newTaskElementView);
	};
}

function CompletedTasksListView() {
	let todoRecorderViewCallbacks;
	let markAllTodoButton;
	let completedElementHandlers = {
		addElementToList: function (taskDomElements) {
			this.tasksList.appendChild(taskDomElements.placeHolder);
			this.tasksList.appendChild(taskDomElements.taskNode);
			this.noTasksMessage.style.opacity = '0';
			todoRecorderViewCallbacks.updateButtonActiveness();
		}.bind(this),
		taskTextUpdatedHandler: function () {
			todoRecorderViewCallbacks.taskTextUpdatedHandler();
		}.bind(this),
		removeTask: this.removeTask.bind(this),
		markAsTodo: function (taskDomElements, taskText) {
			todoRecorderViewCallbacks.createTodoTask(taskText);
			this.removeTask.call(this, taskDomElements);
		}.bind(this),
	};
	this.init = function (callbacks) {
		Object.getPrototypeOf(this).init.call(this, callbacks);
		this.tasksList = document.getElementByNodeId(utils.completedListNodeId);
		this.noTasksMessage = document.getElementByNodeId(utils.noCompletedTasksMessageNodeId);
		todoRecorderViewCallbacks = callbacks;
		markAllTodoButton = document.getElementByNodeId(utils.markAllTodoButtonNodeID);
		markAllTodoButton.disabled = true;
	};
	this.createCompletedTaskElement = function (todoText) {
		let newTaskElementView = new CompletedTaskElementView();
		
		newTaskElementView.init(todoText, completedElementHandlers);
		newTaskElementView.render();
		this.taskElementViewCollection.push(newTaskElementView);
	};
	this.deactivateMarkAllTodoButton = function () {
		markAllTodoButton.disabled = true;
	};
	this.activateMarkAllTodoButton = function () {
		markAllTodoButton.disabled = false;
	};
}

TodoTasksListView.prototype = new TasksListView();
CompletedTasksListView.prototype = new TasksListView();

function TaskElementView() {
	function setEndOfContentEditable(contentEditableElement) {
		let range, selection;
		range = document.createRange();//Create a range (a range is a like the selection but invisible)
		range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the
		                                                 // range
		range.collapse(false);//collapse the range to the end point. false means collapse to end rather than
		                      // the start
		selection = window.getSelection();//get the selection object (allows you to change selection)
		selection.removeAllRanges();//remove any selections already made
		selection.addRange(range);//make the range you have just created the visible selection
	}
	
	function getTextNode(taskNode) {
		let textNode;
		let completedTextNodes = taskNode.getElementsByClassName(utils.completedTaskTextClass);
		let todoTextNodes = taskNode.getElementsByClassName(utils.todoTaskTextClass);
		if (todoTextNodes.length === 1) {
			textNode = todoTextNodes[0];
		} else if (completedTextNodes.length === 1) {
			textNode = completedTextNodes[0];
		} else {
			throw{
				name: "Wrong Number Of TextNodes"
			}
		}
		return textNode;
	}
	
	function getTaskText(taskNode) {
		let textNode = getTextNode(taskNode);
		return textNode.textContent;
	}
	
	this.init = function () {
		this.elementEventHandlers = {
			onFocusOutHandler: function (event) {
				let taskTextSpan = event.target;
				this.makeTaskTextContentEditableFalse();
				if (taskTextSpan.textContent.trim() === '') {
					this.elementEventHandlers.removeTask(event);
				} else {
					//Manage Model
					this.taskListCallBacks.taskTextUpdatedHandler();
				}
			}.bind(this),
			taskTextClickHandler: function (event) {
				let element = event.target;
				if (!this.isTaskTextContentEditable(element)) {
					this.timer = setTimeout(function () {
						if (!this.prevent) {
							if(this.elementType === utils.todoConstant){
								let domElements = this.getDomElements();
								this.taskListCallBacks.markAsCompleted(domElements, getTaskText(domElements.taskNode));
							}
							else if(this.elementType === utils.completedConstant){
								let domElements = this.getDomElements();
								this.taskListCallBacks.markAsTodo(domElements, getTaskText(domElements.taskNode));
							}
							else{
								throw{
									name: "ElementTypeResolutionError",
									message: "No such element type",
								}
							}
						}
					}.bind(this), utils.singleClickDelay);
					this.prevent = false;
				}
			}.bind(this),
			taskTextDoubleClickHandler: function (event) {
				event.stopPropagation();
				clearTimeout(this.timer);
				this.prevent = true;
				this.makeTaskTextContentEditableTrue();
			}.bind(this),
			removeTask: function () {
				this.delete();
			}.bind(this),
		};
	};
	this.createTaskElement = function (taskText, elementViewCallbacks, taskTextClass, taskTextHoverClass) {
		function addChildNodesToParentNode(parentNode, ...childNodes) {
			for (let childNode of childNodes) {
				parentNode.appendChild(childNode);
			}
		}
		
		let createTextNode = function createTextNode() {
			let taskTextSpan = document.createElement('span');
			taskTextSpan.className = taskTextClass;
			taskTextSpan.appendChild(document.createTextNode(taskText));
			taskTextSpan.addEventListener("focusout", elementViewCallbacks.onFocusOutHandler);
			taskTextSpan.onkeydown = function (event) {
				if (event.code === "Enter") {
					// noinspection JSUnresolvedFunction
					event.target.blur();
				}
			};
			taskTextSpan.onmouseenter = function () {
				taskTextSpan.classList.add(taskTextHoverClass);
			};
			taskTextSpan.onmouseleave = function () {
				taskTextSpan.classList.remove(taskTextHoverClass);
			};
			taskTextSpan.onclick = elementViewCallbacks.taskTextClickHandler;
			taskTextSpan.ondblclick = elementViewCallbacks.taskTextDoubleClickHandler;
			return taskTextSpan;
		};
		
		function createCloseButtonForNode() {
			let crossElement = document.createTextNode(String.fromCharCode(0x2715));
			let closeButton = document.createElement('span');
			closeButton.appendChild(crossElement);
			closeButton.className = utils.closeButtonClass;
			closeButton.onclick = elementViewCallbacks.removeTask;
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
			return dragSpan;
		}
		
		let newTodoNode = document.createElement("li");
		newTodoNode.className = utils.taskListElementClass;
		let newTodoText = createTextNode.call(this, taskText);
		let closeButton = createCloseButtonForNode();
		let placeHolder = createPlaceHolder();
		let newDragElement = createDragElement();
		addChildNodesToParentNode(newTodoNode, newDragElement, newTodoText, closeButton);
		// makeElementDraggable(newTodoNode); TODO
		this.taskElements = {
			taskNode: newTodoNode,
			placeHolder: placeHolder,
		};
	};
	this.makeTaskTextContentEditableTrue = function () {
		let taskNode = this.getDomElements().taskNode;
		let textNode = getTextNode(taskNode);
		taskNode.classList.add('FocusElement');
		textNode.contentEditable = 'true';
		textNode.classList.add(utils.contentEditingClassName);
		textNode.focus();
		setEndOfContentEditable(textNode);
	};
	this.makeTaskTextContentEditableFalse = function () {
		let taskNode = this.getDomElements().taskNode;
		let textNode = getTextNode(taskNode);
		taskNode.classList.remove('FocusElement');
		textNode.contentEditable = 'false';
		textNode.classList.remove(utils.contentEditingClassName);
		textNode.focus();
		setEndOfContentEditable(textNode);
	};
	this.isTaskTextContentEditable = function () {
		let taskNode = this.getDomElements().taskNode;
		let textNode = getTextNode(taskNode);
		return textNode.contentEditable === 'true';
	};
	this.getDomElements = function () {
		return this.taskElements;
	};
	this.getActualIndex = function () {
	
	};
	
	this.render = function () {
		this.taskListCallBacks.addElementToList(this.getDomElements());
	};
	this.delete = function () {
		// Handle Model
		this.taskListCallBacks.removeTask(this.getDomElements());
	}
}
TaskElementView.prototype = view;

function TodoTaskElementView() {
	this.init = function (todoText, todoListCallbacks) {
		this.taskListCallBacks = todoListCallbacks;
		Object.getPrototypeOf(this).init.call(this);
		this.createTaskElement(todoText, this.elementEventHandlers, utils.todoTaskTextClass, utils.todoTaskTextHoverClassName);
		this.elementType = utils.todoConstant;
	};
}

function CompletedTaskElementView() {
	this.init = function (completedText, completedListCallbacks) {
		
		this.taskListCallBacks = completedListCallbacks;
		Object.getPrototypeOf(this).init.call(this);
		this.createTaskElement(completedText, this.elementEventHandlers, utils.completedTaskTextClass, utils.completedTaskTextHoverClassName);
		this.elementType = utils.completedConstant;
	};
}

TodoTaskElementView.prototype = new TaskElementView();
CompletedTaskElementView.prototype = new TaskElementView();

function TodoInputFieldView() {
	const todoInputField = document.getElementByNodeId(utils.newTodoInputFieldNodeId);
	this.init = function (handlers) {
		todoInputField.onkeyup = function () {
			if (todoInputField.value.length > 0) {
				handlers.inputFieldTextEnterHandler(todoInputField.value);
				todoInputField.value = '';
			}
			
		}
	};
	this.focus = function () {
		todoInputField.focus();
	};
}

TodoInputFieldView.prototype = view;

const TodoRecorderView = function (todoRecorderModel) {
	let actionBarView = new ActionBarView();
	let todoTasksListView = new TodoTasksListView();
	let completedTasksListView = new CompletedTasksListView();
	let todoInputFieldView = new TodoInputFieldView();
	
	let inputFieldHandlers = {
		inputFieldTextEnterHandler: function (inputText) {
			// todoRecorderModel TODO: Handle Model
			todoTasksListView.createTodoTaskElement(inputText, utils.newFlag);
		},
	};
	let listHandlers = {
		taskTextUpdatedHandler: function () {
			todoInputFieldView.focus();
		},
		updateButtonActiveness: function () {
			let emptyCount = 0;
			if (completedTasksListView.checkIfEmpty()) {
				completedTasksListView.deactivateMarkAllTodoButton();
				emptyCount++;
			} else {
				completedTasksListView.activateMarkAllTodoButton();
			}
			if (todoTasksListView.checkIfEmpty()) {
				actionBarView.deactivateMarkAllCompletedButton();
				emptyCount++;
			} else {
				actionBarView.activateMarkAllCompletedButton();
			}
			if (emptyCount === 2) {
				actionBarView.deactivateClearAllButton();
			} else {
				actionBarView.activateClearAllButton();
			}
		},
	};
	let todoListHandlers = {
		createCompletedTask: function (taskText) {
			completedTasksListView.createCompletedTaskElement(taskText, utils.transferFlag);
		}
	};
	let completedListHandlers = {
		createTodoTask: function (taskText) {
			todoTasksListView.createTodoTaskElement(taskText, utils.transferFlag);
		}
	};
	Object.setPrototypeOf(todoListHandlers, listHandlers);
	Object.setPrototypeOf(completedListHandlers, listHandlers);
	
	
	this.init = function () {
		actionBarView.init();
		todoTasksListView.init(todoListHandlers);
		completedTasksListView.init(completedListHandlers);
		todoInputFieldView.init(inputFieldHandlers);
	};
};
TodoRecorderView.prototype = view;