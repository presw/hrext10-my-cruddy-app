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
    'Date created': Date.now(),
    'Due date': null,
    'dateFormatted': "",
    'description': ""
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
    `</div><div id="${taskId}" class="task-details form-control"><div type="text" id="${taskId}" ` +
    `class="task-name">${taskName}</div><div class="task-date">${taskObj.dateFormatted}</div></div></div>`;

  if (typeof taskObj.complete !== 'undefined') {
    $('.task-container').prepend($task);
    $('#' + taskId).css('background-color', 'white');
    if (taskObj.complete === true) {
      $('#task-checkbox')[0].checked = true;
      $('#' + taskId).css('background-color', 'lightgrey').offsetParent().wrap('<s></s>');
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
    let sortBy = {
      method: 'Date created',
      display: 'Newest',
      reverse: false
    }
    createItem('sortBy', sortBy);
  }
  if (getKeyValue('modalTask') === null) {
    createItem('modalTask', '');
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
    let compareA = a[parameter];
    let compareB = b[parameter];
    if (compareA === null) {
      compareA = Infinity;
    } else {
      compareA = parseInt(compareA);
    }
    if (compareB === null) {
      compareB = Infinity;
    } else {
      compareB = parseInt(compareB);
    }
    return compareA - compareB;
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

let showDatabaseContents = function() {
  $('.task-container').html('');

  let sortOrder = getKeyValue('sortBy')

  let taskArray = sortedArray(sortOrder.method);
  if (sortOrder.reverse === true) {
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

let resetInputs = function() {
  $('.key').val('');
  $('.value').val('');
};

let prepareDate = function(dateString) {
  let [month, day, year] = dateString.split('/');
  return [year, month - 1, day];
};

let saveModalAndClose = function() {
  let taskId = getKeyValue('modalTask');
  let task = getKeyValue(taskId);
  let date = $('#datepicker').val();
  let description = $('.task-description').val();
  task['dateFormatted'] = date;
  date = prepareDate(date);
  date = new Date(...date).getTime();
  task['Due date'] = date;
  task['description'] = description;
  updateItem(taskId, task);
  $('#datepicker').val('');
  $('.task-description').val('');
  $('#task-modal').css('display', 'none');
  $('#' + taskId)[0].childNodes[1].innerText = task['dateFormatted'];
};

let sortAndDisplay = function(sortMethod, reverseBoolean, display) {
  if (typeof display === 'undefined') {
    display = sortMethod;
  }
  $('.sort-by-button').text(display);
  let sort = getKeyValue('sortBy');
  sort.method = sortMethod;
  sort.reverse = reverseBoolean;
  sort.display = display;
  updateItem('sortBy', sort);
  showDatabaseContents();
}

// Document ready
$(document).ready(function() {
  (function() {
    if (getKeyValue('showComplete') === true) {
      document.querySelector('#completed-switch').checked = true;
    }
    $('.sort-by-button').text(getKeyValue('sortBy')['display']);
    let priority = getKeyValue('setPriority');
    $('.set-priority-button').text(priority.name).css('background-color', priority.color);
  })();
  showDatabaseContents();

// Modal clicks
  $('.task-container').on('click', '.task-details', function() {

    $('#datepicker').datepicker({
      changeMonth: true,
      changeYear: true
    });
    let taskId = $(this)[0].firstChild.id;
    let task = getKeyValue(taskId);
    if (task['dateFormatted'] !== null) {
      $('#datepicker').val(task['dateFormatted']);
    }
    $('.task-description').val(task['description']);
    updateItem('modalTask', taskId);

    $('#task-modal').css('display', 'block');
    $('.task-modal-header').text($(this)[0].firstChild.innerText).wrap('<h2></h2>');
    $('.task-modal-header').append('<span class="close">&times;</span>')
  });

  $(document).on('click', '.close', function() {
    saveModalAndClose();
  });

  $(document).on('click', function() {
    if (event.target.className === 'modal') {
      saveModalAndClose();
    }
  });

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

  $('#newest').on('click', function() {
    sortAndDisplay('Date created', false, 'Newest');
    $(this).offsetParent().hide();
  });

  $('#oldest').on('click', function() {
    sortAndDisplay('Date created', true, 'Oldest');
    $(this).offsetParent().hide();
  });

  $('#priority').on('click', function() {
    sortAndDisplay('Priority', false);
    $(this).offsetParent().hide();
  });

   $('#due-date').on('click', function() {
    sortAndDisplay('Due date', true);
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
      $('#' + taskId).css('background-color', 'lightgrey');
      $(this).offsetParent().wrap('<s></s>');
    } else {
      task['complete'] = false;
      $(this).offsetParent().unwrap();
      $('#' + taskId).css('background-color', 'white');
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

  $('.clear').click(function() {
    if (confirm('WARNING: Are you sure you want to clear the database? \n                THIS ACTION CANNOT BE UNDONE')) {
      clearDatabase();
      showDatabaseContents();
    }
  });

});
