/*

 ### Basic Reqs
- [ ] Where to store data? (localstorage)
- [ ] How to modify data? (update action, delete action)

*/

// localStorage functions

let createItem = function(key, value) {
  return window.localStorage.setItem(key, value);
}

let updateItem = function(key, value) {
  return window.localStorage.setItem(key, value);
}

let deleteItem = function(key) {
  return window.localStorage.removeItem(key);
}

let clearDatabase = function() {
  return window.localStorage.clear();
}

let getKeyValue = function(key) {
  return window.localStorage.getItem(key);
}

let getKeyObject = function(key) {
  let result = getKeyValue(key);
  if (key !== 'taskCount') {
    return JSON.parse(result);
  } else {
    return result;
  }
}

// Setup

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

(function() {
  if (getKeyValue('showComplete') === undefined) {
    createItem('showComplete', false);
  }
})();

// Jquery functions
let addTaskToBody = function(taskId, taskName) {
  let task = `<div class="input-group mb-2 task-row">` +
    `<div class="input-group-prepend"><div class="input-group-text checkbox">` +
    `<input id="task-checkbox" type="checkbox" aria-label="Checkbox for following text input"></div>` +
    `</div><div type="text" id="${taskId}" class="form-control task-name">${taskName}</div></div>`;
  let taskObj = getKeyObject(taskId);

  if (taskObj.complete !== undefined) {
    if (taskObj.complete === true) {
      task = '<s>' + task + '</s>';
    }
    $('.task-container').prepend(task);
  } else {
    return undefined;
  }
}

let showDatabaseContents = function() {
  $('.task-container').html('');

  for (var i = 0; i < window.localStorage.length; i++) {
    let key = window.localStorage.key(i);
    let value = getKeyObject(key);
    if (getKeyValue('showComplete') === 'true') {
      addTaskToBody(key, value.name);
    } else if (value.complete === false) {
      addTaskToBody(key, value.name);
    }
  }
}

let getKeyInput = function() {
  return $('.key').val();
}

let getValueInput = function() {
  return $('.value').val();
}

let resetInputs = function() {
  $('.key').val('');
  $('.value').val('');
}

// Document ready
$(document).ready(function() {
  (function() {
    if (getKeyValue('showComplete') === 'true') {
      document.querySelector('#completed-switch').checked = true;
    }
  })();
  showDatabaseContents();

  // Enter key when focused on add task field
  $('.key').on('keypress', function(event) {
    if (event.which === 13) {
      if (getKeyInput() !== '') {
        let task = makeTask();
        let id = taskNum();
        addTaskToBody(id, task.name);
        task = JSON.stringify(task);
        createItem(id, task);
        resetInputs();
      } else {
        alert('Please enter a task.');
      }
    }
  });

  // Clicking task checkbox
  // TODO: Bug - tasks won't complete or uncomplete after toggling show completed
  $('.checkbox').on('click', 'input[type="checkbox"]', function() {
    let taskId = $(this).offsetParent()[0].childNodes[1].id;
    let task = getKeyObject(taskId);
    if (this.checked) {
      task['complete'] = true;
      $(this).offsetParent().wrap('<s></s>');
    } else {
      task['complete'] = false;
      $(this).offsetParent().unwrap();
    }
    task = JSON.stringify(task);
    updateItem(taskId, task);
  });

  $('#completed-switch').on('click', function() {
    if (event.target.checked === true) {
      updateItem('showComplete', true);
    } else {
      updateItem('showComplete', false);
    }
    showDatabaseContents();
  });

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
