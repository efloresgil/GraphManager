var app = angular.module("GraphManager", []);

app.controller('mainCtrl', function($scope) {
  //variables
  function getRandomColor() {
    var length = 6;
    var chars = '0123456789ABCDEF';
    var hex = '#';
    while (length--) hex += chars[(Math.random() * 16) | 0];
    return hex;
  }


  function nextID() {
    var mayor = 1;
    for (i = 0; i < $scope.vertices.length; i++) {
      var vertice = $scope.vertices[i];
      if (mayor < vertice.id) {
        mayor = vertice.id;
      }
    }
    return mayor + 1;
  }

  Vertice = function(id, color) {
    this.id = nextID();
    this.color = getRandomColor();
  }
  Celda = function(entrada, salida, costo) {
    this.entrada = entrada;
    this.salida = salida;
  }
  var first = {
    "id": 1,
    "color": "#eee"
  };
  $scope.matriz = [first];
  $scope.vertices = [first];

  $scope.nuevoVertice = function() {
    var vertice = new Vertice(1, "#eee");
    $scope.vertices.push(vertice);
    //alert(JSON.stringify($scope.vertices[2]));
    //alert(($scope.vertices).lenght);
  }

});
