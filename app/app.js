/*

 ### Basic Reqs
- [ ] Where to store data? (localstorage)
- [ ] How to modify data? (update action, delete action)

*/

// localStorage functions

var createItem = function(key, value) {
  return window.localStorage.setItem(key, value);
}

var updateItem = function(key, value) {
  return window.localStorage.setItem(key, value);
}

var deleteItem = function(key) {
  return window.localStorage.removeItem(key);
}

var clearDatabase = function() {
  return window.localStorage.clear();
}

var getKeyValue = function(key) {
  return window.localStorage.getItem(key);
}

let taskCounter = function() {
  let taskCount;
  if (getKeyValue('taskCount') !== null) {
    taskCount = getKeyValue('taskCount');
  } else {
    taskCount = 0;
    createItem('taskCount', 0);
  }
  return function() {
    let taskNum = 'task' + taskCount;
    taskCount++;
    updateItem('taskCount', taskCount);
    return taskNum;
  }
}

let makeTask = function() {
  let name = getKeyInput();
  let taskObject = {
    name: name,
    complete: false,
    created: Date.now()
  }
  return taskObject;
}

let taskNum = taskCounter();

// Jquery functions
var addTaskToBody = function(taskName) {
  $('.task-container').prepend(`<div class="input-group mb-2 task-row">` +
    `<div class="input-group-prepend"><div class="input-group-text checkbox">` +
    `<input type="checkbox" aria-label="Checkbox for following text input"></div>` +
    `</div><div type="text" class="form-control task-name">${taskName}</div></div>`);
}

var showDatabaseContents = function() {
  $('.task-container').html('');

  for (var i = 0; i < window.localStorage.length; i++) {
    let key = window.localStorage.key(i);
    let value = JSON.parse(getKeyValue(key));
    if (value.complete === false) {
      addTaskToBody(value.name);
    }
  }
}

var getKeyInput = function() {
  return $('.key').val();
}

var getValueInput = function() {
  return $('.value').val();
}

var resetInputs = function() {
  $('.key').val('');
  $('.value').val('');
}

var addTaskToBody = function(taskName) {
  $('.task-container').prepend(`<div class="input-group mb-2 task-row">` +
    `<div class="input-group-prepend"><div class="input-group-text checkbox">` +
    `<input type="checkbox" aria-label="Checkbox for following text input"></div>` +
    `</div><div type="text" class="form-control task-name">${taskName}</div></div>`);
}

// Document ready
$(document).ready(function() {
  showDatabaseContents();

  $('.key').on('keypress', function(event) {
    if (event.which === 13) {
      if (getKeyInput() !== '') {
        let task = makeTask();
        addTaskToBody(task.name);
        task = JSON.stringify(task);
        createItem(taskNum(), task);
        resetInputs();
      } else {
        alert('Please enter a task.');
      }
    }
  })

  $('.create').click(function() {
    if (getKeyInput() !== '' && getValueInput() !== '') {
      if (keyExists(getKeyInput())) {
        if(confirm('key already exists in database, do you want to update instead?')) {
          updateItem(getKeyInput(), getValueInput());
          showDatabaseContents();
        }
      } else {
        createItem(getKeyInput(), getValueInput());
        showDatabaseContents();
        resetInputs();
      }
    } else  {
      alert('key and value must not be blank');
    }
  });

  $('.update').click(function() {
    if (getKeyInput() !== '' && getValueInput() !== '') {
      if (keyExists(getKeyInput())) {
        updateItem(getKeyInput(), getValueInput());
        showDatabaseContents();
        resetInputs();
      } else {
        alert('key does not exist in database');
      }
    } else {
      alert('key and value must not be blank');
    }
  });

  $('.delete').click(function() {
     if (getKeyInput() !== '') {
      if (keyExists(getKeyInput())) {
        deleteItem(getKeyInput());
        showDatabaseContents();
        resetInputs();
      } else {
        alert('key does not exist in database');
      }
    } else {
      alert('key must not be blank');
    }
  });

  $('.reset').click(function() {
    resetInputs();
  })

  $('.clear').click(function() {
    if (confirm('WARNING: Are you sure you want to clear the database? \n                THIS ACTION CANNOT BE UNDONE')) {
      clearDatabase();
      showDatabaseContents();
    }
  })
})
