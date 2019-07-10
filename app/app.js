/*

 ### Basic Reqs
- [ ] Where to store data? (localstorage)
- [ ] How to modify data? (update action, delete action)

*/

// localStorage functions

let createItem = function(key, value) {
  value = JSON.stringify(value);
  return window.localStorage.setItem(key, value);
}

let updateItem = function(key, value) {
  value = JSON.stringify(value);
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

let setPriority = function(priority) {
  return updateItem('setPriority', priority);
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

let makeTask = function(name) {
  if (name === undefined) {
    name = getKeyInput();
  }
  // let priority = getKeyValue('setPriority');
  let taskObject = {
    name: name,
    priority: getKeyValue('setPriority'),
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
  let taskObj = getKeyObject(taskId);

  let priorityColor = 'blue';
  let priority = taskObj.priority;
  if (priority === '0') {
    priorityColor = 'dimgray';
  } else if (priority === '2') {
    priorityColor = 'darkorange';
  } else if (priority === '3') {
    priorityColor = 'red';
  }

  let $task = `<div class="input-group mb-2 task-row">` +
    `<div class="input-group-prepend">` +
    `<div class="input-group-text checkbox" style="background-color: ${priorityColor}">` +
    `<input id="task-checkbox" type="checkbox" aria-label="Checkbox for following text input"></div>` +
    `</div><div type="text" id="${taskId}" class="form-control task-name">${taskName}</div></div>`;

  if (typeof taskObj.complete !== 'undefined') {
    $('.task-container').prepend($task);

    if (taskObj.complete === true) {
      $('#task-checkbox')[0].checked = true;
      $('#' + taskId).offsetParent().wrap('<s></s>');
    }
  } else {
    return undefined;
  }
};

// Basic Page Setup
(function() {
  if (getKeyValue('setPriority') === null) {
    createItem('setPriority', 1);
  }
  if (getKeyValue('hasIntroRun') === null) {
    createItem('hasIntroRun', false);
  }
  if (getKeyValue('hasIntroRun') === 'false') {
    let intro1 = makeTask('Type in the field above and press "enter" to create a task.')
    let intro2 = makeTask('<-- Click the checkbox to complete a task.')
    createItem(taskNum(), intro1);
    createItem(taskNum(), intro2);
    updateItem('hasIntroRun', true);
  }
})();

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
};

let getKeyInput = function() {
  return $('.key').val();
};

let getValueInput = function() {
  return $('.value').val();
};

let resetInputs = function() {
  $('.key').val('');
  $('.value').val('');
};

let sortedArray = function(parameter) {
  // Objective: Given a parameter, provide an ordered array of tasks based on parameter

  // iterate through localStorage to obtain an array of tasks
  // sort array of tasks based on parameter
  // return array
}

// Document ready
$(document).ready(function() {
  (function() {
    if (getKeyValue('showComplete') === 'true') {
      document.querySelector('#completed-switch').checked = true;
    }
  })();
  showDatabaseContents();

  $('#urgent').on('click', function() {
    $('.set-priority-button').text('Urgent').css('background-color', 'red');
    setPriority(3);
  });

  $('#important').on('click', function() {
    $('.set-priority-button').text('Important').css('background-color', 'darkorange');
    setPriority(2);
  });

  $('#standard').on('click', function() {
    $('.set-priority-button').text('Standard').css('background-color', 'blue');
    setPriority(1);
  });

  $('#no-rush').on('click', function() {
    $('.set-priority-button').text('No rush').css('background-color', 'dimgray');
    setPriority(0);
  });

  // Enter key when focused on add task field
  $('.key').on('keypress', function(event) {
    if (event.which === 13) {
      if (getKeyInput() !== '') {
        let task = makeTask();
        let id = taskNum();
        createItem(id, task);
        addTaskToBody(id, task.name);
        resetInputs();
      } else {
        alert('Please enter a task.');
      }
    }
  });

  // Clicking task checkbox
  $('.task-container').on('click', '#task-checkbox', function() {
    let taskId = $(this).offsetParent()[0].childNodes[1].id;
    let task = getKeyObject(taskId);
    if (this.checked) {
      task['complete'] = true;
      $(this).offsetParent().wrap('<s></s>');
    } else {
      task['complete'] = false;
      $(this).offsetParent().unwrap();
    }
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
