var app = angular.module("GraphManager", []);

app.controller('mainCtrl', function($scope) {
  var first = {
    "id": 1,
    "color": "#eee",
    "grado": 0
  };
  //variables del scope principal
  $scope.matriz = [];
  $scope.vertices = [first];
  $scope.NOEULER = "No Euleriano, no Semieuleriano";
  $scope.EULER = "Euleriano";
  $scope.SEMIEULER = "Semieuleriano";
  $scope.tipo = $scope.NOEULER;

  $scope.bidireccional = true;
  //variables
  function calcularGrado(vertice) {
    var grado;
    var item;
    for (var i = 0; i < $scope.matriz.length; i++) {
      item = $scope.matriz[i];
      if (item.salida === vertice.id) {
        grado++;
      }
    }
    return {
      "grado": grado,
      "par": ((grado % 2) === 0)
    }
  }

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
    this.grado = 0;
  }
  Celda = function(salida, llegada, costo) {
    this.salida = salida;
    this.llegada = llegada;
    this.costo = costo;
  }

  //SCOPE variables y funciones
  $scope.nuevoVertice = function() {
    var vertice = new Vertice(1, "#eee");
    $scope.vertices.push(vertice);
    calcularEuleriano();
    //alert(JSON.stringify($scope.vertices[2]));
    //alert(($scope.vertices).lenght);
  }

  $scope.nuevaConexion = function() {
    ($scope.selectedSalida);
    var msg = "";
    var msgBi = ""
    var repetido;
    var repetidoBi;
    var conexion;
    var salida;
    var llegada;

    var costo = $("#costo").val();
    var circular;
    //alert(salida);
    if (costo == null || costo == "") {
      costo = 0;
    }
    if (typeof $scope.selectedSalida === "undefined" || typeof $scope.selectedLlegada === "undefined") {
      Materialize.toast("Selecciona los vértices de salida y llegada", 3000);
    } else {
      salida = ($scope.selectedSalida).id;
      llegada = ($scope.selectedLlegada).id;
      circular = (llegada === salida);
      for (var i = 0; i < $scope.matriz.length; i++) {
        if ($scope.matriz[i].salida === salida && $scope.matriz[i].llegada === llegada) {
          repetido = true;
          msg += salida + " -> " + llegada + " ya existe, por lo que no fue creado \n";
          break;
        }
      }
      if (!repetido) {
        conexion = new Celda(salida, llegada, costo);
        $scope.matriz.push(conexion);
        msg += salida + " -> " + llegada + " agregado \n";
        $scope.selectedSalida.grado++;
      }

      if ($scope.bidireccional && !circular) {
        for (var i = 0; i < $scope.matriz.length; i++) {
          if ($scope.matriz[i].salida === llegada && $scope.matriz[i].llegada === salida) {
            repetidoBi = true;
            msgBi += llegada + " -> " + salida + " ya existe, por lo que no fue creado";
            break;
          }
        }
        if (!repetidoBi) {
          conexion = new Celda(llegada, salida, costo);
          $scope.matriz.push(conexion);
          msgBi += llegada + " -> " + salida + " agregado";
          $scope.selectedLlegada.grado++;
        }
      }
    }
    //alert(msg);
    Materialize.toast(msg, 5000);
    Materialize.toast(msgBi, 5000);
    calcularEuleriano();
  }


  $scope.eliminarVertice = function(id) {
    //alert(id);
    //$scope.matriz = $scope.matriz.filter(function(item) {
    //  return (item.salida !== id && item.llegada !== id) || ;
    //});

    //Usamos esto y no filter para controlar los grados de los vertices de entrada
    //Hay que tener cuidado aqui, porque lenght cambia en tiempo real
    for (var i = $scope.matriz.length - 1;
      (i < $scope.matriz.length) && (i >= 0); i--) {
      //alert($scope.matriz.length);
      //alert(i);
      //alert($scope.matriz[i].llegada+" -> "+ $scope.matriz[i].salida);
      if ($scope.matriz[i].llegada === id || $scope.matriz[i].salida === id) {
        $scope.eliminarConexion($scope.matriz[i]);
      }
    }

    $scope.vertices = $scope.vertices.filter(function(item) {
      return item.id !== id;
    });
  }

  $scope.eliminarConexion = function(conexion) {
    //alert(id);
    $scope.matriz = $scope.matriz.filter(function(item) {
      return (item.salida !== conexion.salida || item.llegada !== conexion.llegada);
      //le bajamos el grado al vértice de salida
    });
    for (var i = 0; i < $scope.vertices.length; i++) {
      if ($scope.vertices[i].id === conexion.salida) {
        $scope.vertices[i].grado--;
        calcularEuleriano();
      }
    }
  }

  function calcularEuleriano() {
    var pares = 0;
    var inpares = 0;
    for (var i = 0; i < $scope.vertices.length; i++) {
      //total += $scope.vertices[i].grado;
      if (($scope.vertices[i].grado % 2) !== 0 || $scope.vertices[i].grado === 0) {
        inpares++;
      } else {
        pares++;
      }
    }
    if (inpares === 2) {
      $scope.tipo = $scope.SEMIEULER;
    } else if (pares === $scope.vertices.length && inpares === 0) {
      //alert("Carefull");
      $scope.tipo = $scope.EULER;
      var v = $scope.vertices;
      var c = $scope.matriz;
      var r = $scope.vertices[0].id;
      var f = $scope.vertices[0].id;
      //alert("v: " + v + " c: " + c + " r: " + r + " f: " + f);
      $("#path").html("Un camino Euleriano es: " + parseFleury(Fleury(v, c, r, f, [])));
    } else {
      $scope.tipo = $scope.NOEULER;
    }
  }

  function Fleury(v, c, r, f, path) {
    //alert("v: " + v.length + " c: " + c.length + " r: " + r + " f: " + f + " p: " + path.length);
    var path_clone = path;
    for (var i = 0; i < c.length; i++) {
      if (c[i].salida !== r) {
        continue;
      }
      //alert("Conexion: " + JSON.stringify(c[i]));
      //alert("path: " +  + "f: " + f)
      if (c[i].llegada === f && path.length >= $scope.vertices.length - 1) {
        path_clone.push(c[i]);
        //alert("PATH: " + path.length);
        return path;
      } else {
        var c_clone = c;
        var v_clone = v;

        c_clone = c_clone.filter(function(item) {
          //eliminamos esta conexion, y si la tiene, su inversa
          return (item.salida !== c[i].salida || item.llegada !== c[i].llegada) && (item.salida !== c[i].llegada || item.llegada !== c[i].salida);
        });
        v_clone = v_clone.filter(function(item) {
          return item.id !== r;
        });
        path_clone.push(c[i]);
        var res = Fleury(v_clone, c_clone, c[i].llegada, f, path_clone);
        return res;
      }
    }
    return false;
  }



});

function parseFleury(res) {
  alert(res.length)
  var msg = "";
  if (res === false) {
    return "false";
  } else {
    for (var i = 0; i < res.length; i++) {
      msg += res[i].salida + ", ";
    }
  }
  return msg;
}
