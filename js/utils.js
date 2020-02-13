"use strict";
let utils = {
	todo : 'ToDo',
	completed : 'Completed',
	newTodoDivisionId: 'newTodo',
		newTodoInputId: 'newTodo__Input',

	onAllActionsDivisionId: "onAllActions",
		markAllTodoId: "onAllActions__markAllAsTodo",
		markAllCompletedId: "onAllActions__markAllAsCompleted",
		clearAllId: "onAllActions__clearAll",

	todoTasksDivisionId: "todoTasks",
		tasksLabelClass: 'tasks__Label',
		noTodoTasksMessageId: 'todoTasks__noTasksMessage',
		todoTaskListId: 'todoTasks__list',
			todoTaskTextClass: 'todoTasks__list__element__text',
	completedTasksListHeadClass: "completedTasksListHead",
	completedTasksDivisionId: 'completedTasks',
		noCompletedTasksMessageId: 'completedTasks__noTasksMessage',
		completedTaskListId: 'completedTasks__list',
			completedTaskTextClass: 'completedTasks__list__element__text',

	tasksListPlaceholderClass: "list__placeHolder",
	taskListElementClass: 'tasks__list__element',
	closeButtonClass: 'closeTaskButton',
	checkButtonClass: 'checkTaskButton',
	dragButtonClass: 'dragTaskButton',
	placeHolderHrClass : 'placeHolderHr',
	compressedListClass: "compressed",

	setEndOfContenteditable: function setEndOfContenteditable(contentEditableElement) {
		var range,selection;
		if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
		{
			range = document.createRange();//Create a range (a range is a like the selection but invisible)
			range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
			range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
			selection = window.getSelection();//get the selection object (allows you to change selection)
			selection.removeAllRanges();//remove any selections already made
			selection.addRange(range);//make the range you have just created the visible selection
		}
		else if(document.selection)//IE 8 and lower
		{
			range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
			range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
			range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
			range.select();//Select the range (make it the visible selection
		}
	},
	arrowDown: String.fromCharCode(0x25BD),
	arrowRight: String.fromCharCode(0x25BA),
	todoInitialPlaceholderId: 'initial_Placeholder',
	listCompressThreshold: 5,
};