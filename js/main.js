(function () {
	let view = (function () {
		const todoList = document.getElementByNodeId(utils.todoListNodeID);
		const completedList = document.getElementByNodeId(utils.completedListNodeId);
		const todoInputField = document.getElementByNodeId(utils.newTodoInputFieldNodeId);
		const markAllTodoButton = document.getElementByNodeId(utils.markAllTodoButtonNodeID);
		const markAllCompletedButton = document.getElementByNodeId(utils.markAllCompletedButtonNodeID);
		const clearAllButton = document.getElementByNodeId(utils.clearAllButtonNodeID);
		const completedTasksListHead = document.getElementByNodeId(utils.completedTasksListHeadNodeId);

		function updateNoTasksMessageAndActionsOnAllButtons() {
			if (todoList.getElementsByClassName(utils.taskListElementClass).length === 0 && document.getElementByNodeId(utils.noTodoTasksMessageNodeID).style.opacity === '0') {
				document.getElementByNodeId(utils.noTodoTasksMessageNodeID).style.opacity = '1';
				markAllCompletedButton.disabled = true;
			} else if (todoList.getElementsByClassName(utils.taskListElementClass).length > 0) {
				if (document.getElementByNodeId(utils.noTodoTasksMessageNodeID)) {
					document.getElementByNodeId(utils.noTodoTasksMessageNodeID).style.opacity = '0';
				}
				markAllCompletedButton.disabled = false;
			}
			if (completedList.getElementsByClassName(utils.taskListElementClass).length === 0 && document.getElementByNodeId(utils.noCompletedTasksMessageNodeId).style.opacity === '0') {
				document.getElementByNodeId(utils.noCompletedTasksMessageNodeId).style.opacity = '1';
				markAllTodoButton.disabled = true;
			} else if (completedList.getElementsByClassName(utils.taskListElementClass).length > 0) {
				if (document.getElementByNodeId(utils.noCompletedTasksMessageNodeId)) {
					document.getElementByNodeId(utils.noCompletedTasksMessageNodeId).style.opacity = '0';
				}
				markAllTodoButton.disabled = false;
			}
			clearAllButton.disabled = markAllCompletedButton.disabled && markAllTodoButton.disabled;
		}

		function updateCompletedTasksDivision() {
			if (completedTasksListHead.classList.contains(utils.compressedListClass)) {
				for (let childNode of completedList.getElementsByTagName('li')) {
					if (childNode.nodeId !== utils.newTodoListElementNodeId && !childNode.classList.contains(utils.todoInitialPlaceholderClassName)) {
						childNode.style.display = 'none';
					}
				}
				if (completedList.getElementsByTagName('li').length > 1) {
					completedTasksListHead.textContent = utils.arrowRight + ' Completed Tasks: ' + (completedList.getElementsByTagName('li').length - 1) / 2;
				} else {
					completedTasksListHead.textContent = utils.arrowRight + ' Completed Tasks';
				}
				document.getElementByNodeId(utils.noCompletedTasksMessageNodeId).style.opacity = '0';
			} else if (completedList.getElementsByTagName('li').length > 1) {
				completedTasksListHead.textContent = utils.arrowDown + ' Completed Tasks: ' + (completedList.getElementsByTagName('li').length - 1) / 2;
			} else {
				completedTasksListHead.textContent = utils.arrowDown + ' Completed Tasks';
			}
		}

		function renderListDivisions() {
			updateNoTasksMessageAndActionsOnAllButtons();
			updateCompletedTasksDivision();
		}

		function removeTaskFromList(nodeIndex, list) {
			let listIndex = domListIndexFromActualIndex(nodeIndex);
			let node = list.getElementsByTagName('li')[listIndex];
			let originalPlaceHolderIndex = listIndex - 1;
			let origPlaceHolder = list.getElementsByTagName('li')[originalPlaceHolderIndex];

			list.removeChild(origPlaceHolder);
			list.removeChild(node);
			renderListDivisions();
		}

		function removeTodoNode(nodeIndex) {
			removeTaskFromList(nodeIndex, todoList);
		}

		function removeCompletedNode(nodeIndex) {
			removeTaskFromList(nodeIndex, completedList);
		}

		function checkTodo(actualIndex) {
			let listIndex = domListIndexFromActualIndex(actualIndex);
			let todoNode = todoList.getElementsByTagName('li')[listIndex];
			let todoTextElement = todoNode.getElementsByClassName(utils.todoTaskTextClass)[0];
			let elementIndex = Array.from(todoList.getElementsByTagName('li')).indexOf(todoNode);
			let placeHolderElement = Array.from(todoList.getElementsByTagName('li'))[elementIndex - 1];
			todoTextElement.className = utils.completedTaskTextClass;
			completedList.insertBefore(todoNode, completedList.firstChild);
			completedList.insertBefore(placeHolderElement, todoNode);
			renderListDivisions();
			return 0;
		}

		function uncheckTodo(actualIndex) {
			let listIndex = domListIndexFromActualIndex(actualIndex);
			let completedNode = completedList.getElementsByTagName('li')[listIndex];
			let todoTextElement = completedNode.getElementsByClassName(utils.completedTaskTextClass)[0];
			let elementIndex = Array.from(completedList.getElementsByTagName('li')).indexOf(completedNode);
			let placeHolderElement = Array.from(completedList.getElementsByTagName('li'))[elementIndex - 1];
			todoTextElement.className = utils.todoTaskTextClass;
			todoList.insertBefore(completedNode, todoList.getElementsByTagName('li')[0]);
			todoList.insertBefore(placeHolderElement, completedNode);
			renderListDivisions();
			return 0;
		}

		let dragFunctions = {
			removeHoverEffectOnTask: function removeHoverOnTask(draggedElementDetails) {
				let taskTextElements;
				let draggedElement = nodeFromActualIndexAndElementType(draggedElementDetails);
				if (draggedElementDetails.elementType === utils.todoConstant) {
					taskTextElements = draggedElement.getElementsByClassName(utils.todoTaskTextClass);
				} else {
					taskTextElements = draggedElement.getElementsByClassName(utils.completedTaskTextClass);
				}
				if (taskTextElements.length > 1) {
					throw{
						name: "Incorrect Number of text elements in dragged task"
					}
				}
				let taskTextElement = taskTextElements[0];
				taskTextElement.classList.remove(utils.todoTaskTextHoverClassName);
			},
			addDraggedEffect: function startDrag(event, draggedElementDetails) {
				let draggedElement = nodeFromActualIndexAndElementType(draggedElementDetails);
				draggedElement.classList.add('dragged');
				event.dataTransfer.effectAllowed = 'move';
				event.dataTransfer.setData('text/html', draggedElement.innerHTML);
				draggedElement.style.opacity = '0.4';
			},
			removeDraggedEffect: function dragEnd(draggedElementDetails) {
				let draggedElement = nodeFromActualIndexAndElementType(draggedElementDetails);
				draggedElement.classList.remove("FocusElement");
				draggedElement.classList.remove('dragged');
				draggedElement.style.opacity = '1';
			},
			checkIfImmediatePlaceHolder: function checkIfNotImmediatePlaceHolder(draggedElementDetails, placeHolderElement) {
				let draggedElementListIndex = domListIndexFromActualIndex(draggedElementDetails.elementIndex);
				let targetPlaceholderIndex = Array.from(placeHolderElement.closest(".taskList").getElementsByTagName('li')).indexOf(placeHolderElement);
				if (getElementType(placeHolderElement) === draggedElementDetails.elementType) {
					if (Math.abs(targetPlaceholderIndex - draggedElementListIndex) === 1) {
						return true;
					}
				}
				return false;
			},
			addDragOverEffect: function renderDragEnter(placeHolderElement) {
				let targetPlaceholderIndex = Array.from(placeHolderElement.closest(".taskList").getElementsByTagName('li')).indexOf(placeHolderElement);
				placeHolderElement.classList.add('over');
				if (getElementType(placeHolderElement) === utils.completedConstant && targetPlaceholderIndex === placeHolderElement.closest(".taskList").getElementsByTagName('li').length - 1) {
					placeHolderElement.classList.add('overLastPlaceHolder');
				}
				if (getElementType(placeHolderElement) === utils.todoConstant && targetPlaceholderIndex === 0) {
					placeHolderElement.classList.add('overFirstPlaceHolder');
				}
			},
			removeDragOverEffect: function removeOverEffect(placeHolderElement) {
				placeHolderElement.classList.remove('overLastPlaceHolder');
				placeHolderElement.classList.remove('overFirstPlaceHolder');
				placeHolderElement.classList.remove('over');
			},
			removeDragOverEffectOnAll: function () {
				let listItems = document.querySelectorAll('.draggable');
				[].forEach.call(listItems, function (item) {
					item.classList.remove('over');
					item.classList.remove(utils.todoTaskTextHoverClassName);
					item.classList.remove(utils.completedTaskTextHoverClassName);
					item.classList.remove('overLastPlaceHolder');
					item.classList.remove('overFirstPlaceHolder');
				});
			},
			insertBeforePlaceholder: function insertBeforePlaceholder(draggedElementDetails, placeHolderElement) {
				let targetList = getElementType(placeHolderElement) === utils.todoConstant ? todoList : completedList;
				let draggedElement = nodeFromActualIndexAndElementType(draggedElementDetails);
				let draggedPlaceHolderElement = getPlaceholderOfTaskElement(draggedElement);
				targetList.insertBefore(draggedPlaceHolderElement, placeHolderElement);
				targetList.insertBefore(draggedElement, placeHolderElement);
				return actualIndexOfNode(draggedElement);
			}
		};

		function makeElementDroppable(element) {
			element.addEventListener('dragenter', controller.placeholderDragEnter, false);
			element.addEventListener('dragover', controller.placeholderDragOver, false);
			element.addEventListener('dragleave', controller.placeholderDragLeave, false);
			element.addEventListener('drop', controller.placeholderDragDrop, false);
		}

		function makeInitialPlaceHolderDroppable() {
			let initialTodoPlaceHolders = todoList.getElementsByClassName(utils.tasksListPlaceholderClass);
			let initialCompletedPlaceHolders = completedList.getElementsByClassName(utils.tasksListPlaceholderClass);
			if (initialTodoPlaceHolders.length > 1) {
				throw{
					name: "Incorrect Number of Initial Todo Placeholders"
				}
			}
			if (initialCompletedPlaceHolders.length > 1) {
				throw{
					name: "Incorrect Number of Initial Completed Placeholders"
				}
			}
			let initialTodoPlaceHolder = initialTodoPlaceHolders[0];
			let initialCompletedPlaceHolder = initialCompletedPlaceHolders[0];
			makeElementDroppable(initialTodoPlaceHolder);
			makeElementDroppable(initialCompletedPlaceHolder);
		}

		function makeElementDraggable(listElement) {
			listElement.draggable = true;
			listElement.addEventListener('dragstart', controller.taskDragStart, false);
			listElement.addEventListener('dragend', controller.taskDragEnd, false);
		}

		function nodeFromActualIndexAndElementType(elementDetails) {
			let elementType = elementDetails.elementType;
			let actualIndex = elementDetails.elementIndex;
			if (elementType === utils.todoConstant) {
				return todoList.getElementsByTagName('li')[domListIndexFromActualIndex(actualIndex)];
			} else {
				return completedList.getElementsByTagName('li')[domListIndexFromActualIndex(actualIndex)];
			}
		}

		function actualIndexOfNode(taskNode) {
			let listIndex = Array.from(taskNode.closest(".taskList").getElementsByTagName('li')).indexOf(taskNode);
			return (listIndex - 1) / 2;
		}

		function domListIndexFromActualIndex(actualIndex) {
			return (2 * actualIndex) + 1;
		}

		function isElementContentEditable(element) {
			return element.contentEditable === 'true';
		}

		function makeTaskTextElementContentEditable(element) {
			element.contentEditable = 'true';
			element.classList.add(utils.contentEditingClassName);

		}

		function focusOnTaskTextElement(element) {
			element.closest('.tasksListElement').classList.add('FocusElement');
			element.focus();
		}

		function editTaskTextElement(element) {
			makeTaskTextElementContentEditable(element);
			focusOnTaskTextElement(element);
			utils.setEndOfContentEditable(element);
		}

		function getElementType(element) {
			if (element.closest(`[nodeID=${utils.todoListNodeID}]`)) {
				return utils.todoConstant;
			} else if (element.closest(`[nodeID=${utils.completedListNodeId}]`)) {
				return utils.completedConstant;
			} else {
				throw{
					name: "Not todo or completed element"
				}
			}
		}

		function getPlaceholderOfTaskElement(element) {
			let elementIndex = Array.from(element.closest('.taskList').getElementsByTagName('li')).indexOf(element);
			let placeHolderIndex = elementIndex - 1;
			return element.closest('.taskList').getElementsByTagName('li')[placeHolderIndex];
		}

		let createTaskElement = function createElement(todoText) {
			function addChildNodesToParentNode(parentNode, ...childNodes) {
				for (let childNode of childNodes) {
					parentNode.appendChild(childNode);
				}
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

			function createCloseButtonForNode(todoNode) {
				let crossElement = document.createTextNode(String.fromCharCode(0x2715));
				let closeButton = document.createElement('span');
				closeButton.appendChild(crossElement);
				closeButton.className = utils.closeButtonClass;
				closeButton.onclick = function (e) {
					e.stopPropagation();
					if (getElementType(todoNode) === utils.todoConstant) {
						controller.removeTask(actualIndexOfNode(todoNode), utils.todoConstant);
					} else {
						controller.removeTask(actualIndexOfNode(todoNode), utils.completedConstant);
					}
				};
				return closeButton;
			}

			function createTextTodoNode(text, newTodoNode) {
				let todoTextSpan = document.createElement('span');
				todoTextSpan.className = utils.todoTaskTextClass;
				todoTextSpan.contentEditable = 'true';
				todoTextSpan.classList.add(utils.contentEditingClassName);
				todoTextSpan.appendChild(document.createTextNode(text));

				todoTextSpan.addEventListener("focusout", function () {
					let currentListType = getElementType(newTodoNode) === utils.todoConstant ? utils.todoConstant : utils.completedConstant;
					let currentActualIndex = actualIndexOfNode(todoTextSpan.closest('.tasksListElement'));
					todoTextSpan.contentEditable = 'false';
					todoTextSpan.classList.remove(utils.contentEditingClassName);
					if (todoTextSpan.textContent.trim() === '') {
						controller.removeTask(currentActualIndex, currentListType);
					} else {
						controller.updateTaskText(currentActualIndex, currentListType, todoTextSpan.textContent);
					}
					todoTextSpan.closest('.tasksListElement').classList.remove("FocusElement");
					todoInputField.focus();
					renderListDivisions();
				});
				todoTextSpan.onkeydown = function (event) {
					if (event.code === "Enter") {
						todoInputField.focus();
					}
				};
				todoTextSpan.onmouseenter = function () {
					if (getElementType(todoTextSpan) === utils.todoConstant) {
						todoTextSpan.classList.add(utils.todoTaskTextHoverClassName);
					} else {
						todoTextSpan.classList.add(utils.completedTaskTextHoverClassName);
					}
				};
				todoTextSpan.onmouseleave = function () {
					todoTextSpan.classList.remove(utils.todoTaskTextHoverClassName);
					todoTextSpan.classList.remove(utils.completedTaskTextHoverClassName);
				};


				todoTextSpan.prevent = false;
				todoTextSpan.timer = undefined;
				todoTextSpan.onclick = function (event) {
					controller.taskTextSpanOnClick(event, actualIndexOfNode(newTodoNode));
				};
				todoTextSpan.ondblclick = controller.taskTextSpanOnDbClick;


				return todoTextSpan;
			}

			function createPlaceHolder() {
				let placeHolder = document.createElement('li');
				placeHolder.className = utils.tasksListPlaceholderClass;
				makeElementDroppable(placeHolder);
				return placeHolder;
			}

			let newTodoNode = document.createElement("li");
			newTodoNode.className = utils.taskListElementClass;
			let newDragElement = createDragElement();
			let newTodoText = createTextTodoNode(todoText, newTodoNode);
			let closeButton = createCloseButtonForNode(newTodoNode);
			addChildNodesToParentNode(newTodoNode, newDragElement, newTodoText, closeButton);
			makeTaskTextElementContentEditable(newTodoText);
			focusOnTaskTextElement(newTodoText);
			let placeHolder = createPlaceHolder();
			todoList.insertBefore(placeHolder, todoList.getElementsByTagName('li')[todoList.getElementsByTagName('li').length - 2]);
			todoList.insertBefore(newTodoNode, todoList.getElementsByTagName('li')[todoList.getElementsByTagName('li').length - 2]);
			makeElementDraggable(newTodoNode);
			return {newTodoNode, newTodoText};
		};

		function newTodoRequest(todoText) {
			let newElements = createTaskElement(todoText);
			todoInputField.value = '';
			utils.setEndOfContentEditable(newElements.newTodoText);
			renderListDivisions();
		}

		function compressCompletedList() {
			for (let childNode of completedList.getElementsByTagName('li')) {
				if (childNode.nodeId !== utils.newTodoListElementNodeId && !childNode.classList.contains(utils.todoInitialPlaceholderClassName)) {
					childNode.style.display = 'none';
				}
			}
			completedTasksListHead.classList.add(utils.compressedListClass);
			renderListDivisions();
		}

		function expandCompletedList() {
			for (let childNode of completedList.getElementsByTagName('li')) {
				childNode.style.display = 'block';
			}
			completedTasksListHead.classList.remove(utils.compressedListClass);
			renderListDivisions();
		}

		function completedListIsCompressed() {
			return completedTasksListHead.classList.contains(utils.compressedListClass);
		}

		function updateCompletedTasksListHead(arrowSymbol) {
			completedTasksListHead.textContent = arrowSymbol + completedTasksListHead.textContent.substr(1);
		}

		function assignEventListenersToHTMLElements() {
			todoInputField.onkeyup = function () {controller.todoInputOnEnter(todoInputField.value);};
			markAllTodoButton.onclick = controller.markAllTodo;
			markAllCompletedButton.onclick = controller.markAllCompleted;
			clearAllButton.onclick = controller.clearAll;
			completedTasksListHead.onclick = controller.completedTasksListHeadClick;
		}

		return {
			newTodoRequest,
			checkTodo,
			uncheckTodo,
			removeTodoNode,
			removeCompletedNode,
			completedListIsCompressed,
			expandCompletedList,
			compressCompletedList,
			updateCompletedTasksListHead,
			isElementContentEditable,
			getElementType,
			editTaskTextElement,
			assignEventListenersToHTMLElements,
			makeInitialPlaceHolderDroppable,
			dragFunctions,
			actualIndexOfNode,
			renderListDivisions,
		}
	})();

	let model = (function () {
		let tasksData = {
			todoData: [],
			completedData: []
		};

		function newTask(text) {
			return {
				text: text,
			}
		}

		function addTodo(todoText) {
			tasksData.todoData.push(newTask(todoText));
		}

		function checkTodo(nodeIndex) {
			let checkedTask = tasksData.todoData.splice(nodeIndex, 1)[0];
			tasksData.completedData.unshift(checkedTask);
		}

		function uncheckTodo(nodeIndex) {
			let uncheckedTask = tasksData.completedData.splice(nodeIndex, 1)[0];
			tasksData.todoData.unshift(uncheckedTask);
		}

		function removeTaskFromTodoList(nodeIndex) {
			tasksData.todoData.splice(nodeIndex, 1);
		}

		function removeTaskFromCompletedList(nodeIndex) {
			tasksData.completedData.splice(nodeIndex, 1);
		}

		function updateTodoTaskText(nodeIndex, newText) {
			tasksData.todoData[nodeIndex].text = newText;
		}

		function updateCompletedTaskText(nodeIndex, newText) {
			tasksData.completedData[nodeIndex].text = newText;
		}

		function hasTodoTask() {
			return tasksData.todoData.length > 0;
		}

		function hasCompletedTask() {
			return tasksData.completedData.length > 0;
		}

		function moveTask(initIndex, initElementType, finalIndex, finalElementType) {
			let task;
			if (initElementType === utils.todoConstant) {
				task = tasksData.todoData.splice(initIndex, 1)[0];
			} else {
				task = tasksData.completedData.splice(initIndex, 1)[0];
			}
			if (finalElementType === utils.todoConstant) {
				tasksData.todoData.splice(finalIndex, 0, task)
			} else {
				tasksData.completedData.splice(finalIndex, 0, task)
			}
		}

		return {
			addTodo,
			checkTodo,
			uncheckTodo,
			removeTaskFromTodoList,
			removeTaskFromCompletedList,
			updateTodoTaskText,
			updateCompletedTaskText,
			hasTodoTask,
			hasCompletedTask,
			moveTask,
		}
	})();

	let controller = (function () {
		let draggedElementDetails = {
			elementIndex: undefined,
			elementType: undefined
		};

		function todoInputOnEnter(inputText) {
			if (inputText.length > 0) {
				model.addTodo(inputText);
				view.newTodoRequest(inputText);
			}
		}

		function checkTaskRequest(nodeIndex) {
			model.checkTodo(nodeIndex);
			view.checkTodo(nodeIndex);
		}

		function uncheckTaskRequest(nodeIndex) {
			model.uncheckTodo(nodeIndex);
			view.uncheckTodo(nodeIndex);
		}

		function removeTask(nodeIndex, elementType) {
			if (elementType === utils.todoConstant) {
				model.removeTaskFromTodoList(nodeIndex);
				view.removeTodoNode(nodeIndex);
			} else {
				model.removeTaskFromCompletedList(nodeIndex);
				view.removeCompletedNode(nodeIndex);
			}
		}

		function updateTaskText(nodeIndex, elementType, newText) {
			if (elementType === utils.todoConstant) {
				model.updateTodoTaskText(nodeIndex, newText)
			} else {
				model.updateCompletedTaskText(nodeIndex, newText);
			}
		}

		function markAllTodo() {
			while (model.hasCompletedTask()) {
				uncheckTaskRequest(0);
			}
		}

		function markAllCompleted() {
			while (model.hasTodoTask()) {
				checkTaskRequest(0);
			}
		}

		function clearAll() {
			while (model.hasTodoTask()) {
				removeTask(0, utils.todoConstant);
			}
			while (model.hasCompletedTask()) {
				removeTask(0, utils.completedConstant);
			}
		}

		function completedTasksListHeadClick() {
			if (view.completedListIsCompressed()) {
				view.expandCompletedList();
				view.updateCompletedTasksListHead(utils.arrowDown);
			} else {
				view.compressCompletedList(utils.arrowRight);
				view.updateCompletedTasksListHead(utils.arrowRight);
			}
		}

		function taskTextSpanOnClick(event, nodeIndex) {
			let element = event.target;
			if (!view.isElementContentEditable(element)) {
				element.timer = setTimeout(function () {
					if (!element.prevent) {
						if (view.getElementType(element) === utils.todoConstant) {
							controller.checkTaskRequest(nodeIndex);
						} else {
							controller.uncheckTaskRequest(nodeIndex);
						}
					}
				}, utils.singleClickDelay);
				element.prevent = false;
			}
		}

		function taskTextSpanOnDbClick(event) {
			let element = event.target;
			event.stopPropagation();
			clearTimeout(element.timer);
			element.prevent = true;
			view.editTaskTextElement(element);
		}

		function taskDragStart(event) {
			draggedElementDetails.elementIndex = view.actualIndexOfNode(this);
			draggedElementDetails.elementType = view.getElementType(this);
			view.dragFunctions.removeHoverEffectOnTask(draggedElementDetails);
			view.dragFunctions.addDraggedEffect(event, draggedElementDetails);
		}

		function taskDragEnd() {
			view.dragFunctions.removeDragOverEffectOnAll();
			view.dragFunctions.removeDraggedEffect(draggedElementDetails);
		}

		function placeholderDragEnter() {
			if (!view.dragFunctions.checkIfImmediatePlaceHolder(draggedElementDetails, this)) {
				view.dragFunctions.addDragOverEffect(this);
			}
		}

		function placeholderDragOver(event) {
			event.preventDefault();
			event.dataTransfer.dropEffect = 'move';
		}

		function placeholderDragLeave(event) {
			event.stopPropagation();
			view.dragFunctions.removeDragOverEffect(this);
		}

		function placeholderDragDrop() {
			view.dragFunctions.removeDraggedEffect(draggedElementDetails);
			if (!view.dragFunctions.checkIfImmediatePlaceHolder(draggedElementDetails, this)) {
				let originalIndex = draggedElementDetails.elementIndex;
				let originalElementType = draggedElementDetails.elementType;
				let finalElementType = originalElementType;
				if (view.getElementType(this) !== draggedElementDetails.elementType) {
					if (view.getElementType(this) === utils.todoConstant) {
						draggedElementDetails.elementIndex = view.uncheckTodo(draggedElementDetails.elementIndex);
						draggedElementDetails.elementType = utils.todoConstant;
						finalElementType = utils.todoConstant;
					} else {
						draggedElementDetails.elementIndex = view.checkTodo(draggedElementDetails.elementIndex);
						draggedElementDetails.elementType = utils.completedConstant;
						finalElementType = utils.completedConstant;
					}
				}
				let finalIndex = view.dragFunctions.insertBeforePlaceholder(draggedElementDetails, this);
				model.moveTask(originalIndex, originalElementType, finalIndex, finalElementType);
			}
			view.dragFunctions.removeDragOverEffect(this);
		}

		function init() {
			view.assignEventListenersToHTMLElements();
			view.makeInitialPlaceHolderDroppable();
			view.renderListDivisions();
		}

		return {
			init,
			todoInputOnEnter,
			checkTaskRequest,
			uncheckTaskRequest,
			removeTask,
			updateTaskText,
			markAllTodo,
			markAllCompleted,
			clearAll,
			completedTasksListHeadClick,
			taskTextSpanOnClick,
			taskTextSpanOnDbClick,
			taskDragStart,
			taskDragEnd,
			placeholderDragEnter,
			placeholderDragOver,
			placeholderDragLeave,
			placeholderDragDrop,
		}
	})();

	controller.init();
})();