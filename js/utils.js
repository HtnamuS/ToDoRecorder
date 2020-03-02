"use strict";

let utils = {
	getActionBarHTML: function(actionBarType){
		if(actionBarType === utils.todoConstant){
			return '<div class="todoActionBar">\n' +
				'\t\t<span class = "todoTasksListHead tasksListHead" >&#x25BD Todo Tasks</span>\n' +
				'\t\t<span class="noTodoTasksMessage" >No ToDo Tasks</span>\n' +
				'\t\t<button class="markAllAsCompletedButton" >Mark All Completed</button>\n' +
				'\t\t<button class="clearAllTodoButton">Clear All</button>\n' +
				'\t</div>';
		}
		else if(actionBarType === utils.completedConstant){
			return '<div class="completedActionBar">\n' +
				'\t\t<span class = "completedTasksListHead tasksListHead" >&#x25BD Completed Tasks</span>\n' +
				'\t\t<span class="noCompletedTasksMessage" >No Completed Tasks</span>\n' +
				'\t\t<button class="markAllAsTodoButton" > Mark All ToDo</button>\n' +
				'\t\t<button class="clearAllCompletedButton">Clear All</button>\n' +
				'\t</div>';
		}
		else{
			throw{
				name:"Unknown Element Type",
				message:"No element of " + actionBarType + " type can be created"
			}
		}
	},
	getTodoInputHTML: function(){
		return '<span class = "newTodoPlusSymbol" >&#43;</span>\n' +
			'\t<input type="text" class="newTodoInputField"  autocomplete="off" placeholder="Add todo..." autofocus="autofocus">';
	},
	todoConstant:"todo",
	completedConstant:"completed",
	transferFlag: "transfer",
	newFlag: "new",
	emptyFlag: 'empty',
	nonEmptyFlag:'non-empty',

	todoRecordersDivisionClassName: "ToDoRecorders",
	taskListClassName: 'taskList',
	tasksListHead: 'tasksListHead',
	todoTasksDivisionClassName: "todoTasksDivision",
		todoActionBarClassName: "todoActionBar",
			todoTasksListHeadClassName : "todoTasksListHead",
			noTodoTasksMessageClassName: 'noTodoTasksMessage',
			markAllAsCompletedButtonClassName : 'markAllAsCompletedButton',
			clearAllTodoButtonClassName: 'clearAllTodoButton',
		todoListClassName: 'todoList',
			todoTaskTextClass: 'todoListElementText',
			todoTaskTextHoverClassName: 'todoListElementTextHover',
	newTodoInputDivisionClassName: 'newTodoInput',
		newTodoInputFieldClassName: 'newTodoInputField',


	completedTasksDivisionClassName: 'completedTasksDivision',
		completedActionBarClassName: "completedActionBar",
			completedTasksListHeadClassName: "completedTasksListHead",
			noCompletedTasksMessageClassName: 'noCompletedTasksMessage',
			markAllTodoButtonClassName: "markAllAsTodoButton",
			clearAllCompletedClassName: 'clearAllCompletedButton',
		completedListClassName: 'completedList',
			completedTaskTextClass: 'completedListElementText',
			completedTaskTextHoverClassName: 'completedListElementTextHover',
		
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