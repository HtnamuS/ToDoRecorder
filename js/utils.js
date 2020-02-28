"use strict";

Object.getPrototypeOf(document).getElementByNodeId = function(nodeId){
	let elements = this.querySelectorAll(`[nodeID=${nodeId}]`);
	if(elements.length > 1){
		throw{
			name:"Multiple Elements with same nodeId",
			message: `${elements[0]}, ${elements[1]} etc. have same nodeId`,
		}
	}
	return elements[0];
};

Object.defineProperty(HTMLElement.prototype,'nodeId',{
	get() {
		return this.getAttribute('nodeId');
	},
	set(newNodeId){
		this.setAttribute('nodeId', newNodeId);
	}
});

let utils = {
	todoConstant:"todo",
	completedConstant:"completed",
	actionsOnAllDivisionNodeID: "actionsOnAllDivision",
		markAllCompletedButtonNodeID: "markAllCompletedButton",
		clearAllButtonNodeID: "clearAllButton",

	taskListClassName: 'taskList',
	todoTasksDivisionNodeID: "todoTasksDivision",
		noTodoTasksMessageNodeID: 'noTodoTaskMessage',
		todoListNodeID: 'todoList',
			todoTaskTextClass: 'todoListElementText',
			todoTaskTextHoverClassName: 'todoListElementTextHover',
		newTodoListElementNodeId: 'newTodoListElement',
		newTodoInputFieldNodeId: 'newTodoInputField',


	completedTasksDivisionNodeId: 'completedTasksDivision',
		completedTasksListHeadNodeId: "completedTasksListHead",
		markAllTodoButtonNodeID: "markAllAsTodoButton",
		completedListNodeId: 'completedList',
			completedTaskTextClass: 'completedListElementText',
			completedTaskTextHoverClassName: 'completedListElementTextHover',
		noCompletedTasksMessageNodeId: 'noCompletedTasksMessage',
	compressedListClass: "compressed",

	//For both Lists
	taskListElementClass: 'tasksListElement',
	tasksListPlaceholderClass: "listPlaceHolderElement",
	closeButtonClass: 'closeTaskButton',
	checkButtonClass: 'checkTaskButton',
	dragButtonClass: 'dragTaskButton',

	todoInitialPlaceholderClassName: 'initialPlaceholder',
	contentEditingClassName: "contentEditing",


	arrowDown: String.fromCharCode(0x25BD),
	arrowRight: String.fromCharCode(0x25BA),
	singleClickDelay: 200,
};