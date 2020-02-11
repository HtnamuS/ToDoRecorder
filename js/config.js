'use strict';
(function submitTodoOnEnter() {
	let todoInputField = document.getElementById(constants.newTodoInputId);
	todoInputField.addEventListener('keyup', function (event) {
		if(todoInputField.value.length > 0){
			todoFunctions.makeNewTodo();
		}
	});
})();


(function displayNoTasksInitially(){
	let todoTasksDivision = document.getElementById(constants.todoTasksDivisionId);
	let completedTasksDivision = document.getElementById(constants.completedTasksDivisionId);

	function displayNoTasks( taskDivisionElement ,taskType){
		let noTasksText = document.createTextNode("No " + taskType + " Tasks");
		let noTasksMessageNode = document.createElement('p');
		noTasksMessageNode.appendChild(noTasksText);
		if(taskType === constants.todo){
			noTasksMessageNode.id = constants.noTodoTasksMessageId;
			taskDivisionElement.insertBefore(noTasksMessageNode,taskDivisionElement.childNodes[0]);
		}
		else{
			noTasksMessageNode.id = constants.noCompletedTasksMessageId;
			taskDivisionElement.append(noTasksMessageNode);
		}


	}

	displayNoTasks(todoTasksDivision, constants.todo);
	displayNoTasks(completedTasksDivision, constants.completed);
	let markAllTodoButton = document.getElementById(constants.markAllTodoId);
	markAllTodoButton.disabled = true;
	let markAllCompletedButton = document.getElementById(constants.markAllCompletedId);
	markAllCompletedButton.disabled = true;
	let clearAllButton = document.getElementById(constants.clearAllId);
	clearAllButton.disabled = true;
})();