/**
 * @module SoundManager
 */
'use strict';

/**
 * @classdesc A SoundManager that can control sounds.
 *
 * @property {Object} audioObjects Object containing all the audio objects.
 *     The keys in this object are the IDs for the sounds.
 * @property {Array} newAudioObjects An array of new audio objects. This list
 *     will be cleared when a touchstart happens.
 *
 * @constructor
 */
function SoundManager() {
  this.audioObjects = {};
  this.newAudioObjects = [];
  this.touchHackHandler = null;

  this.addTouchHack();
}

/**
 * Add a sound file to the manager.
 *
 * @param {string} id The ID to connect the file to.
 * @param {Object} paths The path to the audio file, in different formats.
 *     The keys in this object are MIME types for the audio files, and the
 *     values are the paths.
 */
SoundManager.prototype.addSoundFile = function(id, paths) {
  var audio = new Audio();
  audio.preload = 'auto';

  for (var mime in paths) {
    if (audio.canPlayType(mime)) {
      audio.src = paths[mime];
      break;
    }
  }

  if (!audio.src) return;

  if (!this.touchHackHandler) this.addTouchHack();

  this.audioObjects[id] = audio;
  this.newAudioObjects.push(audio);
};

/**
 * Play the sound associated with the ID.
 *
 * @param {string} id The ID for the sound.
 */
SoundManager.prototype.play = function(id) {
  var audio = this.audioObjects[id];
  if (!audio) return;
  audio.play();
};

/**
 * Stop the sound associated with the ID.
 *
 * @param {string} id The ID for the sound.
 */
SoundManager.prototype.stop = function(id) {
  var audio = this.audioObjects[id];
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
};

/**
 * Pause the sound associated with the ID.
 *
 * @param {string} id The ID for the sound.
 */
SoundManager.prototype.pause = function(id) {
  var audio = this.audioObjects[id];
  if (!audio) return;
  audio.pause();
};

/**
 * Add the touch hack handler.
 */
SoundManager.prototype.addTouchHack = function() {
  var self = this;
  this.touchHackHandler = function() { self.onTouchHack(); };
  document.addEventListener('touchstart', this.touchHackHandler, false);
};

/**
 * Remove the touch hack handler.
 */
SoundManager.prototype.removeTouchHack = function() {
  document.removeEventListener('touchstart', this.touchHackHandler, false);
  this.touchHackHandler = null;
};

/**
 * Touch hack handler.
 * This will load all new audio objects and pause them.
 */
SoundManager.prototype.onTouchHack = function() {
  var objects = this.newAudioObjects;
  if (objects.length === 0) return;

  for (var i = 0, l = objects.length; i < l; i++) {
    (function(object) {
      setTimeout(function() {
        object.pause();
        object.currentTime = 0;
      }, 300);
      object.load();
    }(objects[i]));
    objects.splice(i, 1);
    i--; l--;
  }

  if (objects.length === 0) this.removeTouchHack();
};

module.exports = SoundManager;
