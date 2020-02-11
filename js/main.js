"use strict";


let todoFunctions = (function todoFunctionsGenerator(){
	let todoList = document.getElementById(constants.todoTaskListId);
	let completedList = document.getElementById(constants.completedTaskListId);
	let todoInputField = document.getElementById(constants.newTodoInputId);
	let markAllTodoButton = document.getElementById(constants.markAllTodoId);
	let markAllCompletedButton = document.getElementById(constants.markAllCompletedId);
	let clearAllButton = document.getElementById(constants.clearAllId);
	let dragDetails = {
		draggedElement: undefined,
		draggedElementIndex: undefined,
		draggedElementList: undefined,
		draggedPlaceHolderIndex: undefined,
		draggedPlaceHolderElement: undefined,
	};

	function checkListsIfEmpty(){
		if(todoList.getElementsByClassName(constants.taskListElementClass).length === 0 &&  document.getElementById(constants.noTodoTasksMessageId).style.opacity ==='0'){
			document.getElementById(constants.noTodoTasksMessageId).style.opacity = '1';
			markAllCompletedButton.disabled = true;
		}
		else if(todoList.getElementsByClassName(constants.taskListElementClass).length > 0 ){
			if(document.getElementById(constants.noTodoTasksMessageId)){
				document.getElementById(constants.noTodoTasksMessageId).style.opacity = '0';
			}
			markAllCompletedButton.disabled = false;
		}
		if(completedList.getElementsByClassName(constants.taskListElementClass).length === 0 && document.getElementById(constants.noCompletedTasksMessageId).style.opacity==='0'){
			document.getElementById(constants.noCompletedTasksMessageId).style.opacity = '1';
			markAllTodoButton.disabled = true;
		}
		else if(completedList.getElementsByClassName(constants.taskListElementClass).length > 0) {
			if(document.getElementById(constants.noCompletedTasksMessageId)){
				document.getElementById(constants.noCompletedTasksMessageId).style.opacity = '0';
			}
			markAllTodoButton.disabled = false;
		}
		clearAllButton.disabled = markAllCompletedButton.disabled && markAllTodoButton.disabled;
	}

	function removeTODO(node,e) {
		if(e){
			e.stopPropagation();
		}
		let list = node.parentElement;
		let originalPlaceHolderIndex = Array.from(list.childNodes).indexOf(node) - 1;
		let origPlaceHolder =  Array.from(list.childNodes)[originalPlaceHolderIndex];
		// noinspection JSCheckFunctionSignatures
		list.removeChild(origPlaceHolder);
		list.removeChild(node);
		checkListsIfEmpty();
	}

	function checkTodo(todoNode){
		let todoTextElement = todoNode.getElementsByClassName(constants.todoTaskTextClass)[0];
		let elementIndex = Array.from(todoList.childNodes).indexOf(todoNode);
		let placeHolderElement = Array.from(todoList.childNodes)[elementIndex - 1];
		todoTextElement.className = constants.completedTaskTextClass;
		completedList.insertBefore(todoNode, completedList.childNodes[0]);
		completedList.insertBefore(placeHolderElement, todoNode);
		checkListsIfEmpty();
	}

	function uncheckTodo(completedNode){
		let todoTextElement = completedNode.getElementsByClassName(constants.completedTaskTextClass)[0];
		let elementIndex = Array.from(completedList.childNodes).indexOf(completedNode);
		let placeHolderElement = Array.from(completedList.childNodes)[elementIndex - 1];
		todoTextElement.className = constants.todoTaskTextClass;
		todoList.insertBefore(completedNode,todoList.childNodes[0]);
		todoList.insertBefore(placeHolderElement, completedNode);
		checkListsIfEmpty();
	}

	let dragFunctions = {
		dragStart: function dragStart(e) {
			dragDetails.draggedElement = this;
			dragDetails.draggedElement.classList.add("FocusElement");
			dragDetails.draggedElementList = dragDetails.draggedElement.parentElement;
			dragDetails.draggedElementIndex = Array.from(dragDetails.draggedElementList.childNodes).indexOf(dragDetails.draggedElement);
			dragDetails.draggedPlaceHolderIndex = dragDetails.draggedElementIndex -1;
			dragDetails.draggedPlaceHolderElement = dragDetails.draggedElementList.childNodes[dragDetails.draggedPlaceHolderIndex];
			this.classList.add('dragged');
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/html', this.innerHTML);
			this.style.opacity = '0.4';
		},
		dragEnter: function dragEnter() {
			let targetIndex = Array.from(this.parentElement.childNodes).indexOf(this);
			if(this.parentElement === dragDetails.draggedElementList){
				if(Math.abs(targetIndex-dragDetails.draggedElementIndex) === 1){
					return;
				}
			}
			this.classList.add('over');
		},
		dragLeave : function dragLeave(e) {
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
			if(this.parentElement === dragDetails.draggedElementList){
				if(Math.abs(targetIndex-dragDetails.draggedElementIndex) === 1){
					this.classList.remove('over');
					return false;
				}
			}
			else{
				if(targetList.id === constants.todoTaskListId){
					uncheckTodo(dragDetails.draggedElement);
				}
				else if(targetList.id === constants.completedTaskListId){
					checkTodo(dragDetails.draggedElement);
				}
			}
			this.classList.remove('over');
			// noinspection JSCheckFunctionSignatures
			targetList.insertBefore(dragDetails.draggedPlaceHolderElement, this);
			targetList.insertBefore(dragDetails.draggedElement, this);
			return false;
		},
		dragEnd : function dragEnd(e) {
			this.classList.remove("FocusElement");
			this.classList.remove('dragged');
			this.style.opacity = '1';
			let listItems = document.querySelectorAll('.draggable');
			[].forEach.call(listItems, function(item) {
				item.classList.remove('over');
			});
		}
	};

	function addEventsDragAndDrop(el) {
		el.addEventListener('dragenter',dragFunctions.dragEnter, false);
		el.addEventListener('dragover', dragFunctions.dragOver, false);
		el.addEventListener('dragleave', dragFunctions.dragLeave, false);
		el.addEventListener('drop',dragFunctions.dragDrop,false);
	}

	(function makePlaceHolderDroppable() {
		let todoPlaceHolder = todoList.getElementsByClassName(constants.tasksListPlaceholderClass)[0];
		addEventsDragAndDrop(todoPlaceHolder);
		let completedPlaceHolder = completedList.getElementsByClassName(constants.tasksListPlaceholderClass)[0];
		addEventsDragAndDrop(completedPlaceHolder);
	})();

	function makeDraggable(listElement){
		listElement.draggable = true;
		listElement.addEventListener('dragstart', dragFunctions.dragStart, false);
		listElement.addEventListener('dragend', dragFunctions.dragEnd, false);
	}

	function addChildNodesToParentNode(parentNode, ...childNodes) {
		for(let childNode of childNodes){
			parentNode.appendChild(childNode);
		}
	}

	let createElements = {
		createDragElement: function createDragElement(){
			let dragSpan = document.createElement('span');
			let dragText = document.createTextNode(String.fromCharCode(0x2630));
			dragSpan.className = "dragElement";
			dragSpan.appendChild(dragText);
			dragSpan.onclick = function (e) {
				e.stopPropagation();
			};
			return dragSpan;
		},
		createCloseButtonForNode: function createCloseButtonForNode(todoNode){
			let crossElement = document.createTextNode( String.fromCharCode(0x2715));
			let closeButton = document.createElement('span');
			closeButton.appendChild(crossElement);
			closeButton.className = constants.closeButtonClass;
			closeButton.onclick = function(e){
				removeTODO(todoNode,e);
			};
			return closeButton;
		},
		createTextTodoNode: function createTextTodoNode(text){
			let todoDiv = document.createElement('span');
			todoDiv.className = constants.todoTaskTextClass;
			todoDiv.contentEditable = 'true';

			let textNode = document.createTextNode(text);
			todoDiv.appendChild(textNode);
			todoDiv.addEventListener("focusout", function () {
				todoDiv.contentEditable = 'false';
				if(todoDiv.textContent.trim() === ''){
					removeTODO(todoDiv.parentElement);
				}
				todoDiv.parentElement.classList.remove("FocusElement");
				todoInputField.focus();
			});
			todoDiv.addEventListener('keydown', function (event) {
				if (event.code === "Enter"){
					todoInputField.focus();
				}
			});
			return todoDiv;
		},
		createPlaceHolder: function createPlaceHolder(){
			let placeHolder = document.createElement('li');
			placeHolder.className = constants.tasksListPlaceholderClass;
			addEventsDragAndDrop(placeHolder);
			return placeHolder;
		},
		createNewNodeWithText: function createNewNodeWithText(todoText){
			let newTodoNode = document.createElement("li");
			newTodoNode.className = constants.taskListElementClass;
			let newDragElement = this.createDragElement();
			let newTodoText = this.createTextTodoNode(todoText);
			let closeButton = this.createCloseButtonForNode(newTodoNode);
			addChildNodesToParentNode(newTodoNode, newDragElement, newTodoText,closeButton);
			let prevent = false;
			let delay = 150;
			let timer;
			newTodoNode.onclick = function() {
				timer = setTimeout(function () {
					if (!prevent) {
						if (newTodoNode.parentElement.id === constants.todoTaskListId) {
							checkTodo(newTodoNode);
						} else {
							uncheckTodo(newTodoNode);
						}

					}
					prevent = false;
				}, delay);
			};
			newTodoNode.ondblclick = function(e){
				e.stopPropagation();
				clearTimeout(timer);
				prevent = true;
				newTodoText.contentEditable = 'true';
				newTodoNode.classList.add('FocusElement');
				constants.setEndOfContenteditable(newTodoText);
				newTodoText.focus();
			};
			let placeHolder = createElements.createPlaceHolder();
			todoList.insertBefore(placeHolder, todoList.childNodes[todoList.childNodes.length-2]);
			todoList.insertBefore(newTodoNode, todoList.childNodes[todoList.childNodes.length-2]);
			makeDraggable(newTodoNode);
			return {newTodoNode,newTodoText};
		},
	};

	return {
		makeNewTodo: function makeNewTodo(){
			let newElements = createElements.createNewNodeWithText(todoInputField.value);
			todoInputField.value = '';
			constants.setEndOfContenteditable(newElements.newTodoText);
			newElements.newTodoText.focus();
			newElements.newTodoNode.classList.add('FocusElement');
			checkListsIfEmpty();
		},

		markAllTodo: function markAllTodo(){
			while(completedList.getElementsByClassName(constants.taskListElementClass).length>0){
				uncheckTodo(completedList.childNodes[1]);
			}
			checkListsIfEmpty();
		},

		markAllCompleted: function markAllCompleted() {
			while(todoList.getElementsByClassName(constants.taskListElementClass).length>0){
				checkTodo(todoList.childNodes[1]);
			}
			checkListsIfEmpty();
		},

		clearAll: function clearAll() {
			while(todoList.getElementsByClassName(constants.taskListElementClass).length>0){
				removeTODO(todoList.childNodes[1]);
			}
			while(completedList.getElementsByClassName(constants.taskListElementClass).length>0){
				removeTODO(completedList.childNodes[1]);
			}
			checkListsIfEmpty();
		}
	}
})();
