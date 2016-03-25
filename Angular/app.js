var app = angular.module("GraphManager", []);

app.controller('mainCtrl', function($scope) {
  $scope.bidireccional=true;
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
  Celda = function(salida, llegada, costo) {
    this.salida = salida;
    this.llegada = llegada;
    this.costo=costo;
  }
  var first = {
    "id": 1,
    "color": "#eee"
  };
  $scope.matriz = [];
  $scope.vertices = [first];

  $scope.nuevoVertice = function() {
    var vertice = new Vertice(1, "#eee");
    $scope.vertices.push(vertice);
    //alert(JSON.stringify($scope.vertices[2]));
    //alert(($scope.vertices).lenght);
  }

  $scope.nuevaConexion = function() {
    var conexion;
    var salida = ($scope.selectedSalida).id;
    var llegada = ($scope.selectedLlegada).id;
    var costo = $("#costo").val();
    //alert(salida);
    if (costo == null || costo == "") {
      costo = 0;
    }
    if (salida == null || llegada == null) {
      alert("Selecciona los vértices de salida y llegada");
    } else {
      conexion=new Celda(salida,llegada,costo);
      //alert(JSON.stringify(conexion));
      $scope.matriz.push(conexion);
      if ($scope.bidireccional) {
        conexion=new Celda(llegada,salida,costo);
        //alert(JSON.stringify(conexion));
        $scope.matriz.push(conexion);
      }
    }
  }

});
