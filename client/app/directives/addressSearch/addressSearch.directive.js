/**
 * addressSearch Directive
 * @namespace Directive
 * @desc Auto fill address form element
 */

(function() {
  'use strict';

  angular
    .module('pumprApp')
    .directive('addressSearch', addressSearch);

    addressSearch.$inject = ['agsServer'];

  function addressSearch(agsServer) {
    var directive = {
      templateUrl: 'app/directives/addressSearch/addressSearch.html',
      transclude: true,
      restrict: 'E',
      scope: {
        value: '=ngModel'
      },
      link: link
    };
    return directive;

    function link(scope) {

      scope.findAddress = function (typed){
        var typed = typed.toUpperCase();
        var options = {
          layer: 'Addresses',
          geojson: false,
          actions: 'query',
          timeout: 30000,
          params: {
            f: 'json',
            outFields: 'ADDRESSU, CITY, STATE, ZIP',
            where: "ADDRESSU like '%" +typed + "%'",
            returnGeometry: false,
            orderByFields: 'ADDRESSU ASC'
          }
        };
        scope.addressPromise = agsServer.addressesMs.request(options);
        return scope.addressPromise
          .then(function(data){
            if (data.error){
              console.log(data.error);
            }
            else {
              return data.features.map(function(item){
                return item.attributes.ADDRESSU + ', ' +  item.attributes.CITY + ', ' +  item.attributes.STATE + ', ' +  item.attributes.ZIP;
            });
            }
          })
          .catch(function(err){
            console.log(err);
          });
      };

      scope.searchControl = function (item){
        scope.value = item;
      }

    }
  }
})();
