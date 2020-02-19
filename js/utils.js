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

	setEndOfContentEditable: function setEndOfContenteditable(contentEditableElement) {
		let range,selection;
		range = document.createRange();//Create a range (a range is a like the selection but invisible)
		range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
		range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
		selection = window.getSelection();//get the selection object (allows you to change selection)
		selection.removeAllRanges();//remove any selections already made
		selection.addRange(range);//make the range you have just created the visible selection
	},
};