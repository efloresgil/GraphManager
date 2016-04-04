angular.module("app")
  .drective("kruskalRoot", ["$complie", function($complie) {
    return {
      restrict: 'E',
      scope: {},
      bindToController: {
        nodo: '@'
      },
      link: function($scope, $element) {
        var template = "<ul><li>";
        if ($scope.KruskalTree === []) {
          return false;
        }
        var primero =
      }, //LINK

    }; //RETURN
  }])

.directive('tree', function($compile) {
  return {
    restrict: 'E',
    terminal: true,
    scope: {
      val: '=',
      parentData: '='
    },
    link: function(scope, element, attrs) {
      var template = '<span>{{val.text}}</span>';
      template += '<button ng-click="deleteMe()" ng-show="val.text">delete</button>';

      if (angular.isArray(scope.val.items)) {
        template += '<ul class="indent"><li ng-repeat="item in val.items"><tree val="item" parent-data="val.items"></tree></li></ul>';
      }
      scope.deleteMe = function(index) {
        if (scope.parentData) {
          var itemIndex = scope.parentData.indexOf(scope.val);
          scope.parentData.splice(itemIndex, 1);
        }
        scope.val = {};
      };
      var newElement = angular.element(template);
      $compile(newElement)(scope);
      element.replaceWith(newElement);
    }
  }
});
