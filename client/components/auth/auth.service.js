'use strict';

angular.module('pumprApp')
  .factory('Auth', function Auth($location, $rootScope, $http, User, $cookieStore, $q) {
    var currentUser = {};
    if($cookieStore.get('token')) {
      currentUser = User.get();
    }

    return {

      /**
       * Authenticate user and save token
       *
       * @param  {Object}   user     - login info
       * @param  {Function} callback - optional
       * @return {Promise}
       */
      login: function(user, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();

        $http.post('/auth/local', {
          email: user.email,
          password: user.password
        }).
        success(function(data) {
          $cookieStore.put('token', data.token);
          currentUser = User.get();
          deferred.resolve(data);
          return cb();
        }).
        error(function(err) {
          this.logout();
          deferred.reject(err);
          return cb(err);
        }.bind(this));

        return deferred.promise;
      },

      /**
       * Get ArcGIS server Token
       *
       * @return {Promise}
       */
      agolToken: function(callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();

        $http.post('/api/arcgis/getToken').
        success(function(data) {
          $cookieStore.put('agolToken', data.token);
          $cookieStore.put('agolTokenExp', data.expires);
          deferred.resolve(data);
          return cb();
        }).
        error(function(err) {
          this.logout();
          deferred.reject(err);
          return cb(err);
        }.bind(this));

        return deferred.promise;
      },

      /**
       * Delete access token and user info
       *
       * @param  {Function}
       */
      logout: function() {
        $cookieStore.remove('token');
        $cookieStore.remove('agolToken');
        $cookieStore.remove('agolTokenExp');
        currentUser = {};
      },

      /**
       * Create a new user
       *
       * @param  {Object}   user     - user info
       * @param  {Function} callback - optional
       * @return {Promise}
       */
      createUser: function(user, callback) {
        var cb = callback || angular.noop;

        return User.save(user,
          function(data) {
            $cookieStore.put('token', data.token);
            currentUser = User.get();
            return cb(user);
          },
          function(err) {
            this.logout();
            return cb(err);
          }.bind(this)).$promise;
      },

      /**
       * Change password
       *
       * @param  {String}   oldPassword
       * @param  {String}   newPassword
       * @param  {Function} callback    - optional
       * @return {Promise}
       */
      changePassword: function(oldPassword, newPassword, callback) {
        var cb = callback || angular.noop;

        return User.changePassword({ id: currentUser._id }, {
          oldPassword: oldPassword,
          newPassword: newPassword
        }, function(user) {
          return cb(user);
        }, function(err) {
          return cb(err);
        }).$promise;
      },

      /**
       * Change role
       *
       * @param  {String}   newRole
       * @param  {Function} callback    - optional
       * @return {Promise}
       */
      changeRole: function(user, callback) {
        var cb = callback || angular.noop;
        return User.changeRole({ id: user._id }, {
          newRole: user.newRole
        }, function(user) {
          return cb(user);
        }, function(err) {
          return cb(err);
        }).$promise;
      },


      /**
       * Gets all available info on authenticated user
       *
       * @return {Object} user
       */
      getCurrentUser: function() {
        return currentUser;
      },

      /**
       * Check if a user is logged in
       *
       * @return {Boolean}
       */
      isLoggedIn: function() {
        return currentUser.hasOwnProperty('role');
      },

      /**
       * Waits for currentUser to resolve before checking if user is logged in
       */
      isLoggedInAsync: function(cb) {
        if(currentUser.hasOwnProperty('$promise')) {
          currentUser.$promise.then(function() {
            cb(true);
          }).catch(function() {
            cb(false);
          });
        } else if(currentUser.hasOwnProperty('role')) {
          cb(true);
        } else {
          cb(false);
        }
      },

      /**
       * Check if a user is an admin
       *
       * @return {Boolean}
       */
      isAdmin: function() {
        return currentUser.role === 'admin';
      },

      /**
       * Check if a user is a superuser
       *
       * @return {Boolean}
       */
      isSuperuser: function() {
        return currentUser.role === 'superuser' || currentUser.role === 'admin';
      },

      /**
       * Check if a user is a engineering firm
       *
       * @return {Boolean}
       */
      isEng: function() {
        return currentUser.role === 'eng' || currentUser.role === 'fireflow' || currentUser.role === 'admin';
      },

      /**
       * Check if a user is a fireflow
       *
       * @return {Boolean}
       */
      isFireflow: function() {
        return currentUser.role === 'fireflow' || currentUser.role === 'admin';
      },

      /**
       * Get auth token
       */
      getToken: function() {
        return $cookieStore.get('token');
      },

      /**
       * Get auth token
       */
      getAgolToken: function() {
        return $cookieStore.get('agolToken');
      },

      /**
       * Get auth token experiation
       */
      getAgolExpr: function() {
        return $cookieStore.get('agolTokenExp');
      },

      /**
       * Get auth token experiation
       */
      isAgolTokenExpr: function() {
        return $cookieStore.get('agolToken') && (Date().getTime() > $cookieStore.get('agolTokenExp'));
      },
      /**
       *Checks sets authorization header
       *
       * @return {object} header
       */
      setAuthHeader: function(){
        var headers ={};
        if (this.isLoggedIn()) {
          headers = {Authorization: 'Bearer ' + this.getToken()};
          return headers;
        }
      }
    };
  });
