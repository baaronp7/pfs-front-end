'use strict';

module.exports = function() {
  $('body').on('load', () => {
    alert('test js compiled and working');
  });
};

