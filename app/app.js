/*

 ### Basic Reqs
- [ ] Where to store data? (localStorage)
- [ ] How to modify data? (update action, delete action)

*/

// localStorage functions
let createItem = function(key, value) {
  value = JSON.stringify(value);
  return window.localStorage.setItem(key, value);
};

let updateItem = function(key, value) {
  value = JSON.stringify(value);
  return window.localStorage.setItem(key, value);
};

let deleteItem = function(key) {
  return window.localStorage.removeItem(key);
};

let clearDatabase = function() {
  return window.localStorage.clear();
};

let getKeyValue = function(key) {
  return JSON.parse(window.localStorage.getItem(key));
};

let setPriority = function(name, level, color) {
  let priorityObject = {
    name: name,
    level: level,
    color: color
  }
  return updateItem('setPriority', priorityObject);
};

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
};

let taskNum = taskCounter();

let makeTask = function(name) {
  if (name === undefined) {
    name = getKeyInput();
  }
  let taskObject = {
    'name': name,
    'id': taskNum(),
    'Priority': getKeyValue('setPriority')['level'],
    'complete': false,
    'Date created': Date.now()
  }
  return taskObject;
};

(function() {
  if (getKeyValue('showComplete') === undefined) {
    createItem('showComplete', false);
  }
})();

// Jquery functions
let addTaskToBody = function(taskId, taskName) {
  let taskObj = getKeyValue(taskId);

  let priorityColor = 'blue';
  let priority = taskObj['Priority'];
  if (priority === 0) {
    priorityColor = 'dimgray';
  } else if (priority === 2) {
    priorityColor = 'darkorange';
  } else if (priority === 3) {
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
    let priorityObj = {
      name: 'Standard',
      level: 1,
      color: 'blue'
    };
    createItem('setPriority', priorityObj);
  }
  if (getKeyValue('sortBy') === null) {
    createItem('sortBy', 'Date created');
  }
  if (getKeyValue('hasIntroRun') === null) {
    createItem('hasIntroRun', false);
  }
  if (getKeyValue('hasIntroRun') === false) {
    let intro1 = makeTask('<-- Click the checkbox to complete a task.');
    let intro2 = makeTask('Hover over "Standard" next to task entry to select a priority.');
    intro2['Priority'] = 2;
    let intro3 = makeTask('Type in the field above and press "enter" to create a task.');
    intro1['Date created'] += 2;
    intro2['Date created'] += 1;
    createItem(intro1.id, intro1);
    createItem(intro2.id, intro2);
    createItem(intro3.id, intro3);
    updateItem('hasIntroRun', true);
  }
})();

let sort = function(arr, parameter) {
  return arr.sort(function(a, b) {
    return parseInt(a[parameter]) - parseInt(b[parameter]);
  })
};

let sortedArray = function(parameter) {

  let output = [];

  for (let i = 0; i < window.localStorage.length; i++) {
    let key = window.localStorage.key(i);
    let value = getKeyValue(key);
    if (typeof value.complete !== 'undefined') {
      output.push(value);
    }
  }
  return sort(output, parameter);
};

let showDatabaseContents = function(sortBy, reverse) {
  $('.task-container').html('');

  let taskArray = sortedArray(sortBy);
  if (typeof reverse !== 'undefined') {
    taskArray = taskArray.reverse();
  }

  for (let i = 0; i < taskArray.length; i++) {
    let task = taskArray[i];
    if (getKeyValue('showComplete') === true) {
      addTaskToBody(task.id, task.name);
    } else if (task.complete === false) {
      addTaskToBody(task.id, task.name);
    }
  }
};

let getKeyInput = function() {
  return $('.key').val();
};

let getValueInput = function() {
  return $('.value').val();
};

// Document ready
$(document).ready(function() {
  (function() {
    if (getKeyValue('showComplete') === true) {
      document.querySelector('#completed-switch').checked = true;
    }
    $('.sort-by-button').text(getKeyValue('sortBy'));
    let priority = getKeyValue('setPriority');
    $('.set-priority-button').text(priority.name).css('background-color', priority.color);
  })();
  showDatabaseContents(getKeyValue('sortBy'));

// Priority drop-down buttons:
  $('.set-priority-button').mouseenter(function() {
    $('.priority-selection').show();
  });

  $('#urgent').on('click', function() {
    $('.set-priority-button').text($(this).text()).css('background-color', 'red');
    setPriority($(this).text(), 3, 'red');
    $('.key').focus();
    $(this).offsetParent().hide();
  });

  $('#important').on('click', function() {
    $('.set-priority-button').text($(this).text()).css('background-color', 'darkorange');
    setPriority($(this).text(), 2, 'darkOrange');
    $('.key').focus();
    $(this).offsetParent().hide();
  });

  $('#standard').on('click', function() {
    $('.set-priority-button').text($(this).text()).css('background-color', 'blue');
    setPriority($(this).text(), 1, 'blue');
    $('.key').focus();
    $(this).offsetParent().hide();
  });

  $('#no-rush').on('click', function() {
    $('.set-priority-button').text($(this).text()).css('background-color', 'dimgray');
    setPriority($(this).text(), 0, 'dimgray');
    $('.key').focus();
    $(this).offsetParent().hide();
  });

// Sort-by drop-down buttons:
  $('.sort-by-button').on('click', function() {
    $('.sort-by-selection').toggle();
  })

  $('#date-created').on('click', function() {
    $('.sort-by-button').text('Date created');
    updateItem('sortBy', 'Date created');
    showDatabaseContents('Date created');
    $(this).offsetParent().hide();
  });

  $('#priority').on('click', function() {
    $('.sort-by-button').text('Priority');
    updateItem('sortBy', 'Priority');
    showDatabaseContents('Priority');
    $(this).offsetParent().hide();
  });

  // Enter key when focused on add task field
  $('.key').on('keypress', function(event) {
    if (event.which === 13) {
      if (getKeyInput() !== '') {
        let task = makeTask();
        createItem(task.id, task);
        addTaskToBody(task.id, task.name);
        resetInputs();
      } else {
        alert('Please enter a task.');
      }
    }
  });

  // Clicking task checkbox
  $('.task-container').on('click', '#task-checkbox', function() {
    let taskId = $(this).offsetParent()[0].childNodes[1].id;
    let task = getKeyValue(taskId);
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
    showDatabaseContents(getKeyValue('sortBy'));
  });

  $('.clear').click(function() {
    if (confirm('WARNING: Are you sure you want to clear the database? \n                THIS ACTION CANNOT BE UNDONE')) {
      clearDatabase();
      showDatabaseContents();
    }
  });

});
