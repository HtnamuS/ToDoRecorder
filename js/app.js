const todoRecorderModel = new TodoRecorderModel();
todoRecorderModel.init();
const todoRecorderView = new TodoRecorderView(todoRecorderModel);
todoRecorderView.init();
todoRecorderView.render();