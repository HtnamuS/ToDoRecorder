"use strict";

function TaskData(taskText) {
	this.text = taskText;
}

let TodoRecorderModel = function (id) {
	let todoRecorderData;
	
	function saveData(){
		localStorage.todoRecorderData = JSON.stringify(todoRecorderData);
	}
	
	this.init = function(){
		todoRecorderData = JSON.parse(localStorage.getItem("todoRecorderData")) || {
			todoTasksData : [],
			completedTasksData: [],
		};
		saveData();
	};
	this.addTodoTask = function(taskText){
		let taskData = new TaskData(taskText);
		todoRecorderData.todoTasksData.push(taskData);
		saveData();
	};
	
	this.addCompletedTask = function (taskText) {
		let taskData = new TaskData(taskText);
		todoRecorderData.completedTasksData.push(taskData);
		saveData();
	};
	this.addMultipleTodoTasks = function (todoTasksData) {
		for(let todoTask of todoTasksData ){
			let taskData = new TaskData(todoTask.text);
			todoRecorderData.todoTasksData.push(taskData);
		}
		saveData();
	};
	this.addMultipleCompletedTasks = function (completedTasksData) {
		for(let completedTask of completedTasksData ){
			let taskData = new TaskData(completedTask.text);
			todoRecorderData.completedTasksData.push(taskData);
		}
		saveData();
	};
	this.editTodoTask = function (taskIndex, newTaskText) {
		todoRecorderData.todoTasksData[taskIndex].text = newTaskText;
		saveData();
	};
	
	this.editCompletedTask = function (taskIndex, newTaskText) {
		todoRecorderData.completedTasksData[taskIndex].text = newTaskText;
		saveData();
	};
	this.deleteTodoTask = function (taskIndex) {
		todoRecorderData.todoTasksData.splice(taskIndex,1);
		saveData();
	};
	
	this.deleteCompletedTask = function (taskIndex) {
		todoRecorderData.completedTasksData.splice(taskIndex,1);
		saveData();
	};
	this.deleteAllTodoTasks = function () {
		todoRecorderData.todoTasksData.splice(0,todoRecorderData.todoTasksData.length);
		saveData();
	};
	
	this.deleteAllCompletedTasks = function () {
		todoRecorderData.completedTasksData.splice(0,todoRecorderData.completedTasksData.length);
		saveData();
	};
	this.getSavedTodoTasksData = function(){
		return todoRecorderData.todoTasksData;
	};
	this.getSavedCompletedTasksData = function () {
		return todoRecorderData.completedTasksData;
	};
};