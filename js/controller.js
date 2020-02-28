"use strict";

(function todoRecorderController() {
	function loadInitData(){
		let initData = todoRecorderModel.getData();
		todoRecorderModel.clearData();
		let initTodoData = initData.todoTasksData;
		let initCompletedData = initData.completedTasksData;
		while(initTodoData.length > 0){
			let todoTaskData = initTodoData[0];
			initTodoData.splice(0,1);
			todoRecorderControllerObj.todoTasksListController.createTodoTask(todoTaskData.text);
		}
		while(initCompletedData.length>0){
			let completedTaskData = initCompletedData[0];
			initCompletedData.splice(0,1);
			todoRecorderControllerObj.completedTasksListController.createCompletedTask(completedTaskData.text);
		}
	}

	const taskListController = (function () {
		return {
			deleteTask: function (targetTaskController) {
				let initLength = this.elementControllerCollection.length;
				this.elementControllerCollection = this.elementControllerCollection.filter(taskController => taskController !== targetTaskController);
				if (initLength === this.elementControllerCollection.length) {
					throw{
						name: "Exception in Todo List Controller",
						message: "Trying to delete non-existent element"
					}
				}
			},
			clearAll: function () {
				let elementControllers = this.elementControllerCollection.slice();
				for(let elementController of elementControllers){
					elementController.handlers.removeTask();
				}
			}
		};
	})();
	const taskElementController = (function () {
		let taskElementControllerObj = {};
		taskElementControllerObj.init = function (){
			this.handlers = {
				updateTaskText: function(newText){
					this.taskElementModel.updateText(newText);
				}.bind(this),
				removeTask: function(){
					this.taskListModel.removeTaskModel(this.taskElementModel);
					this.taskListView.removeTaskView(this.taskElementView);
					this.listController.deleteTask(this);
					if(this.taskListView.checkIfEmpty()){
						if(todoRecorderView.completedTasksListView.checkIfEmpty() && todoRecorderView.todoTasksListView.checkIfEmpty()){
							todoRecorderControllerObj.actionBarController.allListsEmpty();
							todoRecorderControllerObj.completedTasksListController.completedListEmpty();
							todoRecorderControllerObj.actionBarController.todoListEmpty();
						}
						else if(todoRecorderView.completedTasksListView.checkIfEmpty()){
							todoRecorderControllerObj.completedTasksListController.completedListEmpty();
						}
						if(todoRecorderView.todoTasksListView.checkIfEmpty()){
							todoRecorderControllerObj.actionBarController.todoListEmpty();
						}
					}
				}.bind(this),
				taskTextClickHandler: function (event) {
					let element = event.target;
					if (!this.taskElementView.isTaskTextElementContentEditable(element)) {
						this.timer = setTimeout(function () {
							if (!this.prevent){

								this.handlers.toggleTaskActiveness();
							}
						}.bind(this), utils.singleClickDelay);
						this.prevent = false;
					}
				}.bind(this),
				taskTextDoubleClickHandler: function (event) {
					event.stopPropagation();
					clearTimeout(this.timer);
					this.prevent = true;
					this.taskElementView.makeTaskTextElementContentEditableTrue();
				}.bind(this),
				toggleTaskActiveness : function(){
					this.elementType === utils.todoConstant ? this.markAsCompleted() : this.markAsTodo();
				}.bind(this),
			};
			this.prevent = false;
		};
		taskElementControllerObj.pushViewAndModelObjects = function () {
			this.taskListModel.pushTaskModel(this.taskElementModel);
			this.taskListView.pushTaskView(this.taskElementView);
		};
		taskElementControllerObj.unshiftViewAndModelObjects = function () {
			this.taskListModel.unshiftTaskModel(this.taskElementModel);
			this.taskListView.unshiftTaskView(this.taskElementView);
		};
		return taskElementControllerObj;
	})();

	let TodoTaskElementController = function (listController, taskText) {
		this.init();
		this.markAsCompleted = function(){
			let taskText = this.taskElementModel.getText();
			this.handlers.removeTask();
			todoRecorderControllerObj.completedTasksListController.createCompletedTask(taskText);
		};
		this.makeContentEditable = function(){
			this.taskElementView.makeTaskTextElementContentEditableTrue();
		};
		this.taskListModel = todoRecorderModel.todoTasksListModel;
		this.taskElementModel = todoRecorderModel.todoTasksListModel.createNewTaskModel(taskText);
		this.taskListView = todoRecorderView.todoTasksListView;
		this.taskElementView = todoRecorderView.todoTasksListView.createTodoTaskElementView(taskText,this.handlers);
		this.listController = listController;
		this.elementType = utils.todoConstant;
		return this;
	};
	let CompletedTaskElementController = function (listController, taskText) {
		this.init();
		this.markAsTodo = function(){
			let taskText = this.taskElementModel.getText();
			this.handlers.removeTask();
			todoRecorderControllerObj.todoTasksListController.createTodoTask(taskText);
		};
		this.taskListModel = todoRecorderModel.completedTasksListModel;
		this.taskElementModel = todoRecorderModel.completedTasksListModel.createNewTaskModel(taskText);
		this.taskListView = todoRecorderView.completedTasksListView;
		this.taskElementView = todoRecorderView.completedTasksListView.createCompletedTaskElementView(taskText,this.handlers);
		this.listController = listController;
		this.elementType = utils.completedConstant;
		return this;
	};

	TodoTaskElementController.prototype = taskElementController;
	CompletedTaskElementController.prototype = taskElementController;

	let todoRecorderControllerObj = {
		actionBarController : (function () {
			return {
				markAllCompletedHandler: function () {
					todoRecorderControllerObj.todoTasksListController.markAllCompleted();
				},
				clearAllHandler: function () {
					todoRecorderControllerObj.todoTasksListController.clearAll();
					todoRecorderControllerObj.completedTasksListController.clearAll();
				},
				allListsEmpty : function(){
					todoRecorderView.actionBarView.deactivateClearAllButton();
				},
				todoListEmpty : function () {
					todoRecorderView.actionBarView.deactivateMarkAllCompletedButton();
				}
			};
		})(),
		todoInputFieldController :  (function () {
			let todoInputFieldControllerObj = {};
			todoInputFieldControllerObj.textEnterHandler = function (inputText) {
				todoRecorderControllerObj.todoTasksListController.newTodoTask(inputText);
			};
			return todoInputFieldControllerObj;
		})(),
		todoTasksListController : (function () {
			let todoTasksListControllerObj = Object.create(taskListController);
			todoTasksListControllerObj.elementControllerCollection = [];
			todoTasksListControllerObj.newTodoTask = function (taskText) {
				let todoElementController = new TodoTaskElementController(todoTasksListControllerObj,taskText);
				todoElementController.pushViewAndModelObjects();
				todoRecorderView.actionBarView.activateClearAllButton();
				todoRecorderView.actionBarView.activateMarkAllCompletedButton();
				todoElementController.makeContentEditable();
				todoTasksListControllerObj.elementControllerCollection.push(todoElementController);
			};
			todoTasksListControllerObj.createTodoTask = function (taskText) {
				let todoElementController = new TodoTaskElementController(todoTasksListControllerObj,taskText);
				todoElementController.pushViewAndModelObjects();
				todoRecorderView.actionBarView.activateClearAllButton();
				todoRecorderView.actionBarView.activateMarkAllCompletedButton();
				todoTasksListControllerObj.elementControllerCollection.push(todoElementController);
			};
			todoTasksListControllerObj.markAllCompleted = function () {
				let todoElementControllers = todoTasksListControllerObj.elementControllerCollection.slice();
				for(let todoElementController of todoElementControllers){
					todoElementController.markAsCompleted();
				}
			};
			todoTasksListControllerObj.clearAll = function () {
				let todoElementControllers = todoTasksListControllerObj.elementControllerCollection.slice();
				for(let todoElementController of todoElementControllers){
					todoElementController.markAsCompleted();
				}
			};
			return todoTasksListControllerObj;
		})(),
		completedTasksListController : (function () {
			let completedTaskListControllerObj = Object.create(taskListController);
			completedTaskListControllerObj.elementControllerCollection = [];
			completedTaskListControllerObj.createCompletedTask = function(taskText){
				let completedElementController = new CompletedTaskElementController(completedTaskListControllerObj,taskText);
				completedElementController.pushViewAndModelObjects();
				todoRecorderView.actionBarView.activateClearAllButton();
				todoRecorderView.completedTasksListView.activateMarkAllTodoButton();
				completedTaskListControllerObj.elementControllerCollection.push(completedElementController);
			};
			completedTaskListControllerObj.markAllTodo = function() {
				let elementControllers = completedTaskListControllerObj.elementControllerCollection.slice();
				for(let elementController of elementControllers){
					elementController.markAsTodo();
				}
			};
			completedTaskListControllerObj.completedListEmpty = function () {
				todoRecorderView.completedTasksListView.deactivateMarkAllTodoButton();
			};


			return completedTaskListControllerObj;
		})(),
	};

	(function init() {
		todoRecorderView.todoInputFieldView.bindKeyUpHandler(todoRecorderControllerObj.todoInputFieldController.textEnterHandler);
		todoRecorderView.actionBarView.bindHandlerToMarkAllCompletedButton( todoRecorderControllerObj.actionBarController.markAllCompletedHandler);
		todoRecorderView.actionBarView.bindHandlerToClearAllButton( todoRecorderControllerObj.actionBarController.clearAllHandler);
		todoRecorderView.completedTasksListView.bindHandlerToMarkAllTodoButton(todoRecorderControllerObj.completedTasksListController.markAllTodo);
		todoRecorderView.actionBarView.deactivateClearAllButton();
		todoRecorderView.actionBarView.deactivateMarkAllCompletedButton();
		todoRecorderView.completedTasksListView.deactivateMarkAllTodoButton();
		loadInitData();
	})();
})();