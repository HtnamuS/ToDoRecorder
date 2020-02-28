"use strict";


let todoRecorderModel = (function () {
	let todoRecorderData = JSON.parse(localStorage.getItem("todoRecorderData"))||{
		todoTasksData:[],
		completedTasksData: []
	};

	const taskListModel = (function () {
		let tasksModelObj = {};
		tasksModelObj.createNewTaskModel = function(taskText){
			return new Task(taskText);
		};
		tasksModelObj.pushTaskModel = function (targetTaskModel) {
			this.taskModelCollection.push(targetTaskModel);
			this.tasksDataList.push(targetTaskModel.getTaskData());
			todoRecorderModel.commitData();
		};
		tasksModelObj.unshiftTaskModel = function (targetTaskModel) {
			this.taskModelCollection.unshift(targetTaskModel);
			this.tasksDataList.unshift(targetTaskModel.getTaskData());
			todoRecorderModel.commitData();
		};
		tasksModelObj.removeTaskModel = function (targetTaskModel) {
			let initTaskDataListLength = this.tasksDataList.length;
			this.tasksDataList.splice(this.tasksDataList.indexOf(targetTaskModel.getTaskData()),1);
			if(this.tasksDataList.length === initTaskDataListLength){
				throw {
					name: "Exception in Task Data Controller",
					message: "Trying to delete non-existent element"
				}
			}
			let initModelCollectionLength = this.taskModelCollection.length;
			this.taskModelCollection = this.taskModelCollection.filter(taskModel => taskModel !== targetTaskModel);
			if(this.taskModelCollection.length === initModelCollectionLength){
				throw {
					name: "Exception in Task List Model",
					message: "Trying to delete non-existent element"
				}
			}
			todoRecorderModel.commitData();
		};
		return tasksModelObj;
	})();
	function Task(taskText) {
		let taskData = {
			text: taskText,
		};
		this.updateText = function(newText){
			taskData.text = newText;
			todoRecorderModel.commitData();
		};
		this.getText = function(){
			return taskData.text;
		};
		this.getTaskData = function(){
			return taskData;
		};
		return this;
	}

	let todoRecorderModelObj = {
		todoTasksListModel : (function () {
			let todoTasksListModelObj = Object.create(taskListModel);
			todoTasksListModelObj.tasksDataList = todoRecorderData.todoTasksData;
			todoTasksListModelObj.taskModelCollection = [];
			return todoTasksListModelObj;
		})(),
		completedTasksListModel : (function () {
			let completedTasksModelObj = Object.create(taskListModel);
			completedTasksModelObj.tasksDataList = todoRecorderData.completedTasksData;
			completedTasksModelObj.taskModelCollection = [];
			return completedTasksModelObj;
		})(),
	};
	todoRecorderModelObj.commitData = function(){
		localStorage.todoRecorderData = JSON.stringify(todoRecorderData);
	};
	todoRecorderModelObj.getData = function(){
		return {
			todoTasksData: todoRecorderData.todoTasksData.slice(),
			completedTasksData: todoRecorderData.completedTasksData.slice()
		};
	};
	todoRecorderModelObj.clearData = function(){
		todoRecorderData.todoTasksData.splice(0,todoRecorderData.todoTasksData.length);
		todoRecorderData.completedTasksData.splice(0,todoRecorderData.completedTasksData.length);
	};
	return todoRecorderModelObj;
})();