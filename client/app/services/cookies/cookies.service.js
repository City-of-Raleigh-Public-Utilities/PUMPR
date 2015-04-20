'use strict';

angular.module('pumprApp')
  .service('cookies', ['$cookieStore', function($cookieStore){
    this.addProjectCookie = function (typed) {
      var current = $cookieStore.get('projects');
      if (current !== undefined && current.length > 0 && current.indexOf(typed) === -1){
        console.log('Add to Cookie');
        current.unshift(typed);
        if (current.length > 5){
          current.pop();
        }
        $cookieStore.put('projects', current);
      }
      else if (!current){
        console.log('new cookie');
        $cookieStore.put('projects', [typed]);
      }
      return this;
    };
  }]);
