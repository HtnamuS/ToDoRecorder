"use strict";

function TaskData(taskText) {
	return {
		text: taskText,
	};
}

let TodoRecorderModel = function () {
	let todoRecorderData;
	this.init = function(){
		todoRecorderData = JSON.parse(localStorage.getItem("todoRecorderData"))||{
			todoTasksData:[],
			completedTasksData: []
		};
	};
	this.addTodoTask = function(taskText){
		let taskData = new TaskData(taskText);
		todoRecorderData.todoTasksData.push(taskData);
	};
	
	this.addCompletedTask = function (taskText) {
		let taskData = new TaskData(taskText);
		todoRecorderData.completedTasksData.push(taskData);
	};
	this.editTodoTask = function (taskIndex, newTaskText) {
		todoRecorderData.todoTasksData[taskIndex].text = newTaskText;
	};
	this.editCompletedTask = function (taskIndex, newTaskText) {
		todoRecorderData.completedTasksData[taskIndex].text = newTaskText;
	};
	this.deleteTodoTask = function (taskIndex) {
		todoRecorderData.todoTasksData = todoRecorderData.todoTasksData.splice(taskIndex,1);
	};
	
	this.deleteCompletedTask = function (taskIndex) {
		todoRecorderData.completedTasksData = todoRecorderData.completedTasksData.splice(taskIndex,1)
	};

	this.getData = function(){
		return {
			todoTasksData: todoRecorderData.todoTasksData.slice(),
			completedTasksData: todoRecorderData.completedTasksData.slice()
		};
	};
	this.clearData = function(){
		todoRecorderData.todoTasksData.splice(0,todoRecorderData.todoTasksData.length);
		todoRecorderData.completedTasksData.splice(0,todoRecorderData.completedTasksData.length);
	};
};