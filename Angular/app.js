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
    var msg="";
    var msgBi=""
    var repetido;
    var repetidoBi;
    var conexion;
    var salida = ($scope.selectedSalida).id;
    var llegada = ($scope.selectedLlegada).id;
    var costo = $("#costo").val();
    var circular = (llegada === salida);
    //alert(salida);
    if (costo == null || costo == "") {
      costo = 0;
    }
    if (salida == null || llegada == null) {
      alert("Selecciona los vértices de salida y llegada");
    } else {
      for (var i = 0; i < $scope.matriz.length; i++) {
        if ($scope.matriz[i].salida===salida && $scope.matriz[i].llegada===llegada) {
          repetido=true;
          msg += salida + " -> " + llegada + " ya existe, por lo que no fue creado \n";
          break;
        }
      }
      if (!repetido) {
        conexion=new Celda(salida,llegada,costo);
        $scope.matriz.push(conexion);
        msg += salida + " -> " + llegada + " agregado \n";
      }

      if ($scope.bidireccional && !circular) {
        for (var i = 0; i < $scope.matriz.length; i++) {
          if ($scope.matriz[i].salida===llegada && $scope.matriz[i].llegada===salida) {
            repetidoBi=true;
            msgBi += llegada + " -> " + salida + " ya existe, por lo que no fue creado";
            break;
          }
        }
        if (!repetidoBi) {
          conexion=new Celda(llegada,salida,costo);
          $scope.matriz.push(conexion);
          msgBi += llegada + " -> " + salida + " agregado";
        }
      }
    }
    //alert(msg);
    Materialize.toast(msg, 5000);
    Materialize.toast(msgBi, 5000);
  }


  $scope.eliminarVertice = function(id) {
    //alert(id);
    $scope.matriz=$scope.matriz.filter(function(item){
      return (item.salida!==id && item.llegada!==id);
    });

    $scope.vertices=$scope.vertices.filter(function(item){
      return item.id!==id;
    });
  }

  $scope.eliminarConexion = function(conexion) {
    //alert(id);
    $scope.matriz=$scope.matriz.filter(function(item){
      return (item.salida!==conexion.salida || item.llegada!==conexion.llegada);
    });
  }

});
