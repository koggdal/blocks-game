/**
 * @module utils/json
 */
'use strict';

/**
 * Load JSON data from a path into a plain JavaScript object.
 *
 * @param {string} path The path to the JSON response.
 * @param {Function} callback The callback function. First argument is an error
 *     (or null), and second argument is the JavaScript object for the response.
 */
function loadJSON(path, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', path, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        try {
          var data = JSON.parse(xhr.responseText);
          callback(null, data);
        } catch(error) {
          callback(error, xhr.responseText);
        }
        
      } else {
        var msg = 'Couldn\'t load JSON: Server responded with ' + xhr.status;
        callback(new Error(msg));
      }
    }
  };
  xhr.send();
}

/**
 * Save data to a path from a plain JavaScript object.
 *
 * @param {string} path The path to the server that will handle the POST.
 * @param {Object} data The data object. It will only get data from the first
 *     level, not deeper.
 * @param {Function} callback The callback function. First argument is an error
 *     (or null).
 */
function saveJSON(path, data, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', path, true);

  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        callback(null);
      } else {
        var msg = 'Couldn\'t save JSON: Server responded with ' + xhr.status;
        callback(new Error(msg));
      }
    }
  };

  var formData = new FormData();
  for (var prop in data) {
    formData.append(prop, data[prop]);
  }

  xhr.send(formData);
}

exports.load = loadJSON;
exports.save = saveJSON;
