"use strict";
const view = {
	init: function () {},
	render: function () {},
	delete: function () {}
};

function TasksDivisionView() {
	
	function addActionBarHandlers(){
		this.actionBarHandlers.addActionBarDomElementToTaskDivision = function (actionBarDomElement) {
			this.domElement.appendChild(actionBarDomElement);
		}.bind(this);
		this.actionBarHandlers.isListEmpty = function () {
			return this.tasksListView.checkIfEmpty();
		}.bind(this);
		this.actionBarHandlers.clearAllHandler = function () {
			this.tasksListView.removeAll();
			this.todoRecorderViewCallbacks.clearAllHandler();
			this.actionBarView.updateActionBar(utils.emptyFlag);
		}.bind(this);
	}
	function addTaskListHandlers() {
		this.taskListHandlers.addTaskListDomElementToTaskDivision = function (taskListDomElement) {
			this.domElement.appendChild(taskListDomElement);
		}.bind(this);
		this.taskListHandlers.removeTaskFromModel = function(taskIndex, taskType){
			this.todoRecorderViewCallbacks.removeTaskFromModel(taskIndex, taskType);
			
		}.bind(this);
		this.taskListHandlers.removedTaskFromView = function () {
			this.actionBarView.updateActionBar();
		}.bind(this);
		this.taskListHandlers.taskTextUpdatedHandler = function(taskIndex, taskType, newText){
			this.todoRecorderViewCallbacks.taskTextUpdatedHandler(taskIndex, taskType, newText);
		}.bind(this);
	}
	this.init = function (savedTasksData) {
		this.domElement = document.createElement('div');
		this.domElement.className = this.taskDivisionClassName;
		addActionBarHandlers.apply(this);
		addTaskListHandlers.apply(this);
		this.actionBarView.init(this.actionBarHandlers);
		this.tasksListView.init(savedTasksData, this.taskListHandlers);
	};
	this.render = function () {
		this.actionBarView.render();
		this.tasksListView.render();
		this.actionBarView.updateActionBar();
		this.todoRecorderViewCallbacks.addTaskDivisionDomElementToTodoRecorderView(this.domElement);
	};
}

function TodoTasksDivisionView(){
	this.actionBarView = new TodoActionBarView();
	this.tasksListView = new TodoTasksListView();
	this.actionBarHandlers = {
		markAllHandler: function () {
			let todoTasksData = this.tasksListView.removeAll();
			this.todoRecorderViewCallbacks.markAllCompletedHandler(todoTasksData);
			this.actionBarView.updateActionBar(utils.emptyFlag);
		}.bind(this),
	};
	this.taskListHandlers = {
		createCompletedTask : function (newText) {
			this.todoRecorderViewCallbacks.createCompletedTask(newText);
		}.bind(this),
	};
	this.init = function (savedTodoTasksData, callbacks ) {
		this.todoRecorderViewCallbacks = callbacks;
		this.taskDivisionClassName = utils.todoTasksDivisionClassName;
		Object.getPrototypeOf(this).init.call(this,savedTodoTasksData);
	};
	this.createAndRenderTodoTaskElement = function(taskText, flag){
		this.tasksListView.createAndRenderTodoTaskElement(taskText, flag);
		this.actionBarView.updateActionBar(utils.nonEmptyFlag);
	};
	this.createAndRenderMultipleTodoTasks = function(todoTasks){
		this.tasksListView.createAndRenderMultipleTodoTasks(todoTasks);
		this.actionBarView.updateActionBar(utils.nonEmptyFlag);
	};
}
function CompletedTasksDivisionView() {
	this.actionBarView = new CompletedActionBarView();
	this.tasksListView = new CompletedTasksListView();
	this.actionBarHandlers = {
		markAllHandler: function () {
			let completedTasksData = this.tasksListView.removeAll();
			this.todoRecorderViewCallbacks.markAllTodoHandler(completedTasksData);
			this.actionBarView.updateActionBar(utils.emptyFlag);
		}.bind(this),
	};
	this.taskListHandlers = {
		createTodoTask : function (taskText) {
			this.todoRecorderViewCallbacks.createTodoTask(taskText);
			this.actionBarView.updateActionBar(utils.nonEmptyFlag);
		}.bind(this),
	};
	this.init = function (savedCompletedTasksData, callbacks) {
		this.todoRecorderViewCallbacks = callbacks;
		this.taskDivisionClassName = utils.completedTasksDivisionClassName;
		Object.getPrototypeOf(this).init.call(this,savedCompletedTasksData);
	};
	this.createAndRenderCompletedTaskElement = function (taskText, flag) {
		this.tasksListView.createAndRenderCompletedTaskElement(taskText, flag);
		this.actionBarView.updateActionBar(utils.nonEmptyFlag);
	};
	this.createAndRenderMultipleCompletedTasks = function(completedTasks){
		this.tasksListView.createAndRenderMultipleCompletedTasks(completedTasks);
		this.actionBarView.updateActionBar(utils.nonEmptyFlag);
	};
}
TodoTasksDivisionView.prototype = new TasksDivisionView();
CompletedTasksDivisionView.prototype = new TasksDivisionView();

function ActionBarView() {
	this.init = function () {
		this.domElement = document.createElement('div');
		this.domElement.innerHTML = utils.getActionBarHTML(this.elementType);
		this.listHead = this.domElement.getElementsByClassName(this.classNames.listHead)[0];
		this.noTasksMessage = this.domElement.getElementsByClassName(this.classNames.noTasksMessage)[0];
		this.clearAllButton = this.domElement.getElementsByClassName(this.classNames.clearAllButton)[0];
		this.markAllButton = this.domElement.getElementsByClassName(this.classNames.markAllButton)[0];
		this.clearAllButton.onclick = this.taskDivisionCallbacks.clearAllHandler;
		this.markAllButton.onclick = this.taskDivisionCallbacks.markAllHandler;
	};
	this.render = function () {
		this.taskDivisionCallbacks.addActionBarDomElementToTaskDivision(this.domElement);
	};
	this.updateActionBar = function (status) {
		if(!status){
			if(this.taskDivisionCallbacks.isListEmpty()){
				status = utils.emptyFlag;
			}
			else{
				status = utils.nonEmptyFlag;
			}
		}
		if(status === utils.emptyFlag){
			this.noTasksMessage.style.opacity = '1';
			this.clearAllButton.disabled = true;
			this.markAllButton.disabled = true;
		}
		else if(status === utils.nonEmptyFlag){
			this.noTasksMessage.style.opacity = '0';
			this.clearAllButton.disabled = false;
			this.markAllButton.disabled = false;
		}
		else{
			throw{
				name:"Invalid Status Exception",
				message:"Given Status is neither Empty nor Non-Empty"
			}
		}
	};
}

function TodoActionBarView() {
	this.init = function (taskDivisionCallbacks) {
		this.taskDivisionCallbacks = taskDivisionCallbacks;
		this.classNames = {
			listHead: utils.todoTasksListHeadClassName,
			noTasksMessage: utils.noTodoTasksMessageClassName,
			clearAllButton: utils.clearAllTodoButtonClassName,
			markAllButton: utils.markAllAsCompletedButtonClassName,
		};
		this.elementType = utils.todoConstant;
		Object.getPrototypeOf(this).init.apply(this);
		
	}
}
function CompletedActionBarView() {
	this.init = function (taskDivisionCallbacks) {
		this.taskDivisionCallbacks = taskDivisionCallbacks;
		this.classNames = {
			listHead: utils.completedTasksListHeadClassName,
			noTasksMessage: utils.noCompletedTasksMessageClassName,
			clearAllButton: utils.clearAllCompletedClassName,
			markAllButton: utils.markAllTodoButtonClassName,
		};
		this.elementType = utils.completedConstant;
		Object.getPrototypeOf(this).init.apply(this);
	}
}

TodoActionBarView.prototype = new ActionBarView();
CompletedActionBarView.prototype = new ActionBarView();

function TasksListView(){
	let taskDivisionViewCallbacks;
	
	this.init = function (callbacks) {
		this.taskElementViewCollection = [];
		taskDivisionViewCallbacks = callbacks;
		this.elementHandlers = {
			taskTextUpdatedHandler: function (taskIndex, taskType, newText) {
				taskDivisionViewCallbacks.taskTextUpdatedHandler(taskIndex, taskType, newText);
			}.bind(this),
			removeTask: this.removeTask.bind(this),
			addElementToList : function (taskDomElements) {
				let listChildNodes = this.tasksList.getElementsByTagName('li');
				let targetIndex = listChildNodes.length - 1;
				
				this.tasksList.insertBefore(taskDomElements.taskNode, listChildNodes[targetIndex]);
				this.tasksList.insertBefore(taskDomElements.placeHolder, taskDomElements.taskNode);

			}.bind(this),
		};
		this.tasksList = document.createElement('ul');
		this.tasksList.classList.add(utils.taskListClassName);
		let initPlaceholder = document.createElement('li');
		initPlaceholder.className = utils.tasksListPlaceholderClass;
		this.tasksList.appendChild(initPlaceholder);
	};
	this.render = function () {
		for(let taskElementView of this.taskElementViewCollection){
			taskElementView.render();
		}
		taskDivisionViewCallbacks.addTaskListDomElementToTaskDivision(this.tasksList);
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
		return tasksData;
	};
	this.checkIfEmpty = function () {
		let numberOfTasks = this.tasksList.getElementsByClassName(utils.taskListElementClass).length;
		return numberOfTasks === 0;
	};
	this.removeTask = function (taskDomElements, taskIndex,taskType) {
		taskDivisionViewCallbacks.removeTaskFromModel(taskIndex,taskType);
		this.tasksList.removeChild(taskDomElements.taskNode);
		this.tasksList.removeChild(taskDomElements.placeHolder);
		taskDivisionViewCallbacks.removedTaskFromView();
	};
}

TasksListView.prototype = view;

function TodoTasksListView() {
	let todoDivisionViewCallbacks;
	
	this.init = function (savedTodoTasks, callbacks) {
		Object.getPrototypeOf(this).init.call(this, callbacks);
		todoDivisionViewCallbacks = callbacks;
		this.elementHandlers.markAsCompleted = function (taskDomElements, taskIndex, taskText) {
			todoDivisionViewCallbacks.createCompletedTask(taskText);
			this.removeTask(taskDomElements,taskIndex ,utils.todoConstant);
		}.bind(this);
		for(let todoTask of savedTodoTasks){
			let savedTaskElementView = new TodoTaskElementView();
			savedTaskElementView.init(todoTask.text, this.elementHandlers);
			this.taskElementViewCollection.push(savedTaskElementView);
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
	let completedTaskDivisionViewCallbacks;
	let markAllTodoButton;
	
	this.init = function (savedCompletedTasks, callbacks) {
		Object.getPrototypeOf(this).init.call(this, callbacks);
		completedTaskDivisionViewCallbacks = callbacks;
		this.elementHandlers.markAsTodo = function (taskDomElements, taskIndex, taskText) {
			completedTaskDivisionViewCallbacks.createTodoTask(taskText);
			this.removeTask(taskDomElements, taskIndex, utils.completedConstant);
		}.bind(this);
		for(let completedTask of savedCompletedTasks){
			let savedTaskElementView = new CompletedTaskElementView();
			savedTaskElementView.init(completedTask.text, this.elementHandlers);
			this.taskElementViewCollection.push(savedTaskElementView);
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

function TodoInputView() {
	let todoInputField;
	let todoRecorderViewHandlers;
	this.init = function (handlers) {
		this.todoInputDomDivision = document.createElement('div');
		this.todoInputDomDivision.className = utils.newTodoInputDivisionClassName;
		this.todoInputDomDivision.innerHTML= utils.getTodoInputHTML();
		todoInputField = this.todoInputDomDivision.getElementsByClassName(utils.newTodoInputFieldClassName)[0];
		todoInputField.onkeyup = function () {
			if (todoInputField.value.length > 0) {
				handlers.inputFieldTextEnterHandler(todoInputField.value);
				todoInputField.value = '';
			}
		};
		todoRecorderViewHandlers = handlers;
	};
	this.render = function () {
		todoRecorderViewHandlers.addInputDivisionDomElementToTodoRecorderView(this.todoInputDomDivision);
	};
	this.focus = function () {
		todoInputField.focus();
	};
}

TodoInputView.prototype = view;

const TodoRecorderView = function (todoRecorderModel) {
	let todoRecordersDivision;
	let todoInputView = new TodoInputView();
	let todoTasksDivisionView = new TodoTasksDivisionView();
	let completedTasksDivisionView = new CompletedTasksDivisionView();
	
	let inputFieldHandlers = {
		addInputDivisionDomElementToTodoRecorderView : function(todoInputDomElement){
			this.todoRecorderDomFragment.appendChild(todoInputDomElement);
		}.bind(this),
		inputFieldTextEnterHandler: function (inputText) {
			todoRecorderModel.addTodoTask(inputText);
			todoTasksDivisionView.createAndRenderTodoTaskElement(inputText, utils.newFlag);
		},
	};
	let listHandlers = {
		addTaskDivisionDomElementToTodoRecorderView: function(taskDivisionDomElement){
			this.todoRecorderDomFragment.appendChild(taskDivisionDomElement)
		}.bind(this),
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
			todoInputView.focus();
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
	};
	let todoListHandlers = {
		createCompletedTask: function (taskText) {
			todoRecorderModel.addCompletedTask(taskText);
			completedTasksDivisionView.createAndRenderCompletedTaskElement(taskText, utils.transferFlag);
		},
		markAllCompletedHandler: function(todoTasksData){
			todoRecorderModel.deleteAllTodoTasks();
			todoRecorderModel.addMultipleCompletedTasks(todoTasksData);
			completedTasksDivisionView.createAndRenderMultipleCompletedTasks(todoTasksData);
		},
		clearAllHandler: function () {
			todoRecorderModel.deleteAllTodoTasks();
		},
	};
	let completedListHandlers = {
		createTodoTask: function (taskText) {
			todoRecorderModel.addTodoTask(taskText);
			todoTasksDivisionView.createAndRenderTodoTaskElement(taskText, utils.transferFlag);
		},
		markAllTodoHandler: function (completedTasksData) {
			todoRecorderModel.deleteAllCompletedTasks();
			todoRecorderModel.addMultipleTodoTasks(completedTasksData);
			todoTasksDivisionView.createAndRenderMultipleTodoTasks(completedTasksData);
		},
		clearAllHandler : function () {
			todoRecorderModel.deleteAllCompletedTasks();
		},
	};
	Object.setPrototypeOf(todoListHandlers, listHandlers);
	Object.setPrototypeOf(completedListHandlers, listHandlers);
	
	this.init = function () {
		todoRecordersDivision = document.getElementsByClassName(utils.todoRecordersDivisionClassName)[0];
		this.todoRecorderDomFragment = document.createDocumentFragment();
		todoInputView.init(inputFieldHandlers);
		todoTasksDivisionView.init(todoRecorderModel.getSavedTodoTasksData(), todoListHandlers);
		completedTasksDivisionView.init(todoRecorderModel.getSavedCompletedTasksData(), completedListHandlers);
	};
	this.render = function () {
		todoTasksDivisionView.render();
		todoInputView.render();
		completedTasksDivisionView.render();
		todoRecordersDivision.appendChild(this.todoRecorderDomFragment);
	}
};
TodoRecorderView.prototype = view;