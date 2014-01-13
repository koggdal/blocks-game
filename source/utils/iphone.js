exports.isIphone = window.navigator.platform === 'iPhone';
exports.isSafariApp = exports.isIphone && !window.navigator.standalone;
