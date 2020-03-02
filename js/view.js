"use strict";
const view = {
	init: function () {},
	render: function () {},
	delete: function () {}
};

function ActionBarView() {
	let markAllCompletedButton = document.getElementByNodeId(utils.markAllCompletedButtonNodeID);
	let clearAllButton = document.getElementByNodeId(utils.clearAllButtonNodeID);
	this.init = function (callbacks) {
		markAllCompletedButton.disabled = true;
		clearAllButton.disabled = true;
		markAllCompletedButton.onclick = callbacks.markAllCompletedHandler;
		clearAllButton.onclick = callbacks.clearAllHandler;
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
		this.elementHandlers = {
			taskTextUpdatedHandler: function (taskIndex, taskType, newText) {
				todoRecorderViewCallbacks.taskTextUpdatedHandler(taskIndex, taskType, newText);
			}.bind(this),
			removeTask: this.removeTask.bind(this),
		};
	};
	this.removeAll = function () {
		let tasksData = [];
		for(let taskElementView of this.taskElementViewCollection){
			let taskDomElements = taskElementView.getDomElements();
			let taskData = {
				text: taskElementView.getTaskText(),
			};
			this.tasksList.removeChild(taskDomElements.taskNode);
			this.tasksList.removeChild(taskDomElements.placeHolder);
			tasksData.push(taskData);
		}
		this.taskElementViewCollection.splice(0,this.taskElementViewCollection.length);
		if (this.checkIfEmpty()) {
			this.noTasksMessage.style.opacity = '1';
		}
		todoRecorderViewCallbacks.updateButtonActiveness();
		return tasksData;
	};
	this.checkIfEmpty = function () {
		let numberOfTasks = this.tasksList.getElementsByClassName(utils.taskListElementClass).length;
		if (numberOfTasks === 0) {
			this.noTasksMessage.style.opacity = '1';
			return true;
		}
		return false;
	};
	this.removeTask = function (taskDomElements, taskIndex,taskType) {
		todoRecorderViewCallbacks.removeTaskFromModel(taskIndex,taskType);
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
	
	this.init = function (savedTodoTasks, callbacks) {
		Object.getPrototypeOf(this).init.call(this, callbacks);
		this.tasksList = document.getElementByNodeId(utils.todoListNodeID);
		this.noTasksMessage = document.getElementByNodeId(utils.noTodoTasksMessageNodeID);
		todoRecorderViewCallbacks = callbacks;
		this.elementHandlers.addElementToList = function (taskDomElements) {
			let listChildNodes = this.tasksList.getElementsByTagName('li');
			let targetIndex = listChildNodes.length - 2;
			
			this.tasksList.insertBefore(taskDomElements.taskNode, listChildNodes[targetIndex]);
			this.tasksList.insertBefore(taskDomElements.placeHolder, taskDomElements.taskNode);
			this.noTasksMessage.style.opacity = '0';
			todoRecorderViewCallbacks.updateButtonActiveness();
		}.bind(this);
		this.elementHandlers.markAsCompleted = function (taskDomElements, taskIndex, taskText) {
			todoRecorderViewCallbacks.createCompletedTask(taskText);
			this.removeTask(taskDomElements,taskIndex ,utils.todoConstant);
		}.bind(this);
		for(let todoTask of savedTodoTasks){
			let savedTaskElementView = new TodoTaskElementView();
			savedTaskElementView.init(todoTask.text, this.elementHandlers);
			this.taskElementViewCollection.push(savedTaskElementView);
		}
	};
	this.render = function () {
		for(let taskElementView of this.taskElementViewCollection){
			taskElementView.render();
		}
	};
	this.createAndRenderTodoTaskElement = function (todoText, flag) {
		let newTaskElementView = new TodoTaskElementView();
		
		newTaskElementView.init(todoText, this.elementHandlers);
		newTaskElementView.render();
		if (flag === utils.newFlag) {
			newTaskElementView.makeTaskTextContentEditableTrue();
		}
		this.taskElementViewCollection.push(newTaskElementView);
	};
	this.createAndRenderMultipleTodoTasks = function(todoTasks){
		for(let todoTask of todoTasks){
			let savedTaskElementView = new TodoTaskElementView();
			savedTaskElementView.init(todoTask.text, this.elementHandlers);
			this.taskElementViewCollection.push(savedTaskElementView);
			savedTaskElementView.render();
		}
	}
}

function CompletedTasksListView() {
	let todoRecorderViewCallbacks;
	let markAllTodoButton;
	
	this.init = function (savedCompletedTasks, callbacks) {
		Object.getPrototypeOf(this).init.call(this, callbacks);
		this.tasksList = document.getElementByNodeId(utils.completedListNodeId);
		this.noTasksMessage = document.getElementByNodeId(utils.noCompletedTasksMessageNodeId);
		todoRecorderViewCallbacks = callbacks;
		this.elementHandlers.addElementToList = function (taskDomElements) {
			this.tasksList.appendChild(taskDomElements.placeHolder);
			this.tasksList.appendChild(taskDomElements.taskNode);
			this.noTasksMessage.style.opacity = '0';
			todoRecorderViewCallbacks.updateButtonActiveness();
		}.bind(this);
		this.elementHandlers.markAsTodo = function (taskDomElements, taskIndex, taskText) {
			todoRecorderViewCallbacks.createTodoTask(taskText);
			this.removeTask(taskDomElements, taskIndex, utils.completedConstant);
		}.bind(this);
		markAllTodoButton = document.getElementByNodeId(utils.markAllTodoButtonNodeID);
		markAllTodoButton.onclick = callbacks.markAllTodoHandler;
		markAllTodoButton.disabled = true;
		for(let completedTask of savedCompletedTasks){
			let savedTaskElementView = new CompletedTaskElementView();
			savedTaskElementView.init(completedTask.text, this.elementHandlers);
			this.taskElementViewCollection.push(savedTaskElementView);
		}
	};
	this.render = function () {
		for(let taskElementView of this.taskElementViewCollection){
			taskElementView.render();
		}
	};
	this.createAndRenderCompletedTaskElement = function (taskText) {
		let newTaskElementView = new CompletedTaskElementView();
		
		newTaskElementView.init(taskText, this.elementHandlers);
		newTaskElementView.render();
		this.taskElementViewCollection.push(newTaskElementView);
	};
	this.createAndRenderMultipleCompletedTasks = function(completedTasks){
		for(let completedTask of completedTasks){
			let savedTaskElementView = new CompletedTaskElementView();
			savedTaskElementView.init(completedTask.text, this.elementHandlers);
			this.taskElementViewCollection.push(savedTaskElementView);
			savedTaskElementView.render();
		}
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
	
	this.init = function () {
		this.elementEventHandlers = {
			onFocusOutHandler: function (event) {
				let taskTextSpan = event.target;
				this.makeTaskTextContentEditableFalse();
				if (taskTextSpan.textContent.trim() === '') {
					this.elementEventHandlers.removeTask(event);
				} else {
					//Manage Model
					let taskIndex = this.getActualIndex();
					this.taskListCallBacks.taskTextUpdatedHandler(taskIndex, this.elementType, taskTextSpan.textContent);
				}
			}.bind(this),
			taskTextClickHandler: function (event) {
				let element = event.target;
				if (!this.isTaskTextContentEditable(element)) {
					this.timer = setTimeout(function () {
						if (!this.prevent) {
							if(this.elementType === utils.todoConstant){
								let domElements = this.getDomElements();
								this.taskListCallBacks.markAsCompleted(domElements, this.getActualIndex(),this.getTaskText());
							}
							else if(this.elementType === utils.completedConstant){
								let domElements = this.getDomElements();
								this.taskListCallBacks.markAsTodo(domElements, this.getActualIndex(), this.getTaskText());
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
		let taskNode = this.getDomElements().taskNode;
		let peerNodes = taskNode.closest(".taskList").getElementsByClassName(utils.taskListElementClass);
		return Array.from(peerNodes).indexOf(taskNode);
	};
	this.getTaskText = function() {
		let taskNode = this.getDomElements().taskNode;
		let textNode = getTextNode(taskNode);
		return textNode.textContent;
	};
	this.render = function () {
		this.taskListCallBacks.addElementToList(this.getDomElements());
	};
	this.delete = function () {
		this.taskListCallBacks.removeTask(this.getDomElements(),this.getActualIndex(),this.elementType);
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
	
	let actionBarHandlers = {
		markAllCompletedHandler: function () {
			todoRecorderModel.deleteAllTodoTasks();
			let todoTasksData = todoTasksListView.removeAll();
			todoRecorderModel.addMultipleCompletedTasks(todoTasksData);
			completedTasksListView.createAndRenderMultipleCompletedTasks(todoTasksData);
		},
		clearAllHandler: function () {
			todoRecorderModel.deleteAllTodoTasks();
			todoRecorderModel.deleteAllCompletedTasks();
			todoTasksListView.removeAll();
			completedTasksListView.removeAll();
		}
	};
	let inputFieldHandlers = {
		inputFieldTextEnterHandler: function (inputText) {
			todoRecorderModel.addTodoTask(inputText);
			todoTasksListView.createAndRenderTodoTaskElement(inputText, utils.newFlag);
		},
	};
	let listHandlers = {
		taskTextUpdatedHandler: function (taskIndex, taskType, newText) {
			if(taskType === utils.todoConstant){
				todoRecorderModel.editTodoTask(taskIndex,newText);
			}
			else if(taskType === utils.completedConstant){
				todoRecorderModel.editCompletedTask(taskIndex,newText);
			}
			else{
				throw{
					name: "ElementTypeResolutionError",
					message: "No such element type",
				}
			}
			todoInputFieldView.focus();
		},
		removeTaskFromModel: function(taskIndex, taskType){
			if(taskType === utils.todoConstant){
				todoRecorderModel.deleteTodoTask(taskIndex);
			}
			else if(taskType === utils.completedConstant){
				todoRecorderModel.deleteCompletedTask(taskIndex);
			}
			else{
				throw{
					name: "ElementTypeResolutionError",
					message: "No such element type",
				}
			}
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
			todoRecorderModel.addCompletedTask(taskText);
			completedTasksListView.createAndRenderCompletedTaskElement(taskText, utils.transferFlag);
		}
	};
	let completedListHandlers = {
		createTodoTask: function (taskText) {
			todoRecorderModel.addTodoTask(taskText);
			todoTasksListView.createAndRenderTodoTaskElement(taskText, utils.transferFlag);
		},
		markAllTodoHandler: function () {
			todoRecorderModel.deleteAllCompletedTasks();
			let completedTasksData = completedTasksListView.removeAll();
			todoRecorderModel.addMultipleTodoTasks(completedTasksData);
			todoTasksListView.createAndRenderMultipleTodoTasks(completedTasksData);
		}
	};
	Object.setPrototypeOf(todoListHandlers, listHandlers);
	Object.setPrototypeOf(completedListHandlers, listHandlers);
	
	
	this.init = function () {
		actionBarView.init(actionBarHandlers);
		todoTasksListView.init(todoRecorderModel.getSavedTodoTasksData(), todoListHandlers);
		completedTasksListView.init(todoRecorderModel.getSavedCompletedTasksData(), completedListHandlers);
		todoInputFieldView.init(inputFieldHandlers);
	};
	this.render = function () {
		todoTasksListView.render();
		completedTasksListView.render();
	}
};
TodoRecorderView.prototype = view;