const todoRecorderModel = new TodoRecorderModel();
todoRecorderModel.init();
let todoRecorderView = new TodoRecorderView(todoRecorderModel);
todoRecorderView.init();
todoRecorderView.render();
