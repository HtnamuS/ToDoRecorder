"use strict";
const view = {
	init: function () {},
	render: function() {},
	destroy: function () {}
};

function ActionBarView() {
	let markAllCompletedButton = document.getElementByNodeId(utils.markAllCompletedButtonNodeID);
	let clearAllButton = document.getElementByNodeId(utils.clearAllButtonNodeID);

	this.bindHandlerToMarkAllCompletedButton = function (handler) {
			markAllCompletedButton.onclick = handler;
	};
	this.bindHandlerToClearAllButton= function (handler) {
			clearAllButton.onclick = handler;
	};
	this.deactivateClearAllButton= function () {
			clearAllButton.disabled = true;
	};
	this.activateClearAllButton= function () {
			clearAllButton.disabled = false;
	};
	this.activateMarkAllCompletedButton= function () {
			markAllCompletedButton.disabled = false;
	};
	this.deactivateMarkAllCompletedButton= function () {
			markAllCompletedButton.disabled = true;
	};
}

function TasksListView() {
	this.removeTaskView = function (taskView) {
		let taskElements = taskView.getElements();
		this.tasksList.removeChild(taskElements.taskNode);
		this.tasksList.removeChild(taskElements.placeHolder);
	};
	this.unshiftTaskView = function(taskView){
		let domElements = taskView.getElements();
		this.tasksList.insertBefore(domElements.taskNode, this.tasksList.firstChild);
		this.tasksList.insertBefore(domElements.placeHolder, this.tasksList.firstChild);
		this.noTasksMessage.style.opacity = '0';
	};
	this.checkIfEmpty = function(){
			let numberOfTasks = this.tasksList.getElementsByClassName(utils.taskListElementClass).length;
			if(numberOfTasks === 0){
				this.noTasksMessage.style.opacity = '1';
				return true;
			}
			return false;
		};
}
TasksListView.prototype = view;

function TodoTasksListView() {
	this.tasksList = document.getElementByNodeId(utils.todoListNodeID);
	this.noTasksMessage = document.getElementByNodeId(utils.noTodoTasksMessageNodeID);
	this.createTodoTaskElement = function (todoText, handlers) {
		return new TodoTaskElementView(todoText, handlers);
	};
	this.pushTaskView = function (taskView) {
		let domElements = taskView.getElements();
		let listChildNodes = this.tasksList.getElementsByTagName('li');

		let targetIndex = listChildNodes.length - 2;
		this.tasksList.insertBefore(domElements.taskNode, listChildNodes[targetIndex]);
		this.tasksList.insertBefore(domElements.placeHolder, domElements.taskNode);
		this.noTasksMessage.style.opacity = '0';
	};
	return this;
}
function CompletedTasksListView(){
	let markAllTodoButton = document.getElementByNodeId(utils.markAllTodoButtonNodeID);
	this.tasksList = document.getElementByNodeId(utils.completedListNodeId);
	this.noTasksMessage = document.getElementByNodeId(utils.noCompletedTasksMessageNodeId);
	this.listType = utils.completedConstant;

	this.createCompletedTaskElementView = function (todoText, handlers) {
		let completedElementView = new CompletedTaskElementView(todoText, handlers);
		let newDomElements = completedElementView.getElements();
		let completedListChildNodes = this.tasksList.getElementsByTagName('li');
		let targetIndex = completedListChildNodes.length - 2;

		this.tasksList.insertBefore(newDomElements.taskNode, completedListChildNodes[targetIndex]);
		this.tasksList.insertBefore(newDomElements.placeHolder, newDomElements.taskNode);

		return completedElementView;
	};
	this.pushTaskView = function (taskView) {
		let domElements = taskView.getElements();

		this.tasksList.append(domElements.placeHolder);
		this.tasksList.append(domElements.taskNode);
		this.noTasksMessage.style.opacity = '0';
	};
	this.bindHandlerToMarkAllTodoButton = function (handler) {
		markAllTodoButton.onclick = handler;
	};
	this.deactivateMarkAllTodoButton = function () {
		markAllTodoButton.disabled = true;
	};
	this.activateMarkAllTodoButton = function () {
		markAllTodoButton.disabled = false;
	};
	return this;
}

TodoTasksListView.prototype = new TasksListView();
CompletedTasksListView.prototype = new TasksListView();

function TaskElementView(){
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

	this.createTaskElement = function(taskText, handlers, taskTextClass, taskTextHoverClass) {
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
	};
	this.makeTaskTextElementContentEditableTrue = function () {
		let taskNode = this.getElements().taskNode;
		let textNode = getTextNode(taskNode);
		taskNode.classList.add('FocusElement');
		textNode.contentEditable = 'true';
		textNode.classList.add(utils.contentEditingClassName);
		textNode.focus();
		setEndOfContentEditable(textNode);
	};
	this.makeTaskTextElementContentEditableFalse = function () {
		let taskNode = this.getElements().taskNode;
		let textNode = getTextNode(taskNode);
		taskNode.classList.remove('FocusElement');
		textNode.contentEditable = 'false';
		textNode.classList.remove(utils.contentEditingClassName);
		textNode.focus();
		setEndOfContentEditable(textNode);
	};
	this.isTaskTextElementContentEditable = function () {
		let taskNode = this.getElements().taskNode;
		let textNode = getTextNode(taskNode);
		return textNode.contentEditable === 'true';
	};
	this.getElements = function () {
		return this.taskElements;
	};
}
TaskElementView.prototype = view;

 function TodoTaskElementView(todoText, handlers) {
	this.taskElements = this.createTaskElement.call(this,todoText, handlers, utils.todoTaskTextClass, utils.todoTaskTextHoverClassName);
};
 function CompletedTaskElementView(todoText, handlers) {
	this.taskElements = this.createTaskElement.call(this,todoText,handlers, utils.completedTaskTextClass, utils.completedTaskTextHoverClassName);
};

TodoTaskElementView.prototype = new TaskElementView();
CompletedTaskElementView.prototype = new TaskElementView();

function TodoInputFieldView(){
	const todoInputField = document.getElementByNodeId(utils.newTodoInputFieldNodeId);
	this.init = function (handlers) {
		todoInputField.onkeyup = function () {
			if (todoInputField.value.length > 0) {
				handlers.inputFieldTextEnterHandler(todoInputField.value);
				todoInputField.value = '';
			}

		}
	};
	this.render = function () {

	};
	this.focus = function () {
		todoInputField.focus();
	};
}
TodoInputFieldView.prototype = view;

const TodoRecorderView = function (todoRecorderModel) {
	let actionBarView = new ActionBarView();
	let todoTasksListView = new TodoTasksListView();
	let completedTasksListView = new CompletedTaskElementView();
	let todoInputFieldView =  new TodoInputFieldView();

	function inputFieldTextEnterHandler(inputText){
		todoRecorderModel
		todoTasksListView.createTodoTaskElement(inputText);
	}

	let inputFieldHandlers = {
		inputFieldTextEnterHandler,
	};

	this.init = function () {
		actionBarView.init();
		todoTasksListView.init();
		completedTasksListView.init();
		todoInputFieldView.init(inputFieldHandlers);
	};
	this.render = function(){

	};
};
TodoRecorderView.prototype = view;