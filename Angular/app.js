var app = angular.module("GraphManager", ['ngSanitize']);

app.controller('mainCtrl', function($scope) {
  var first = {
    "id": 1,
    "color": "#eee",
    "grado": 0
  };
  //variables del scope principal
  $scope.matriz = [];
  $scope.vertices = [first];
  $scope.NOEULER = "Grafo No Euleriano, no Semieuleriano";
  $scope.EULER = "Grafo Euleriano";
  $scope.SEMIEULER = "Grafo Semieuleriano";
  $scope.ISOLATED = "Hay vértices aislados en el grafo (grado 0). No Euleriano";
  $scope.tipo = $scope.ISOLATED;

  $scope.path_html = "";
  $scope.dijkstra_html = "";

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
        if (!circular) {
          $scope.selectedSalida.grado++;
        }
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
    var circular = conexion.salida === conexion.llegada;
    $scope.matriz = $scope.matriz.filter(function(item) {
      return (item.salida !== conexion.salida || item.llegada !== conexion.llegada);
      //le bajamos el grado al vértice de salida
    });
    for (var i = 0; i < $scope.vertices.length; i++) {
      if ($scope.vertices[i].id === conexion.salida) {
        if (!circular) {
          $scope.vertices[i].grado--;
        }
        calcularEuleriano();
      }
    }
  }

  //Dijkstra
  $scope.dijkstraPath = function(salida, llegada, vertices, conexiones) {

    //alert("Salida: "+JSON.stringify(salida));
    var c = conexiones.slice();
    var v = vertices.slice();
    //inicializo las métricas para la funcion en todos los vértices
    for (var i = 0; i < v.length; i++) {
      v[i].padre = null;
      v[i].costo = -1;
      v[i].visto = false;
      v[i].iteracion = 0;
    }
    salida.visto = true;
    salida.costo = 0;

    //Quitamos las conexiones circulares, que no os importan para el algorimto
    c.filter(function(item) {
      return item.salida !== item.llegada;
    })

    resultado = vecinosDijkstra(v, c, salida, llegada);
    $scope.dijkstra_html = parseDijkstra(resultado, llegada);
  }

  function vecinosDijkstra(v, c, salida, llegada) {
    //alert("DJAKSTRA PATHFINDER INICIADO");
    //alert("c: "+JSON.stringify(c[0]));
    var verticeActual;
    var todos_vistos = true;
    var rama_agotada = true;
    var vecinos_totales = 0;
    var totale_escalados_en_false;
    //Contamos cuantos vecinos tiene el vertice actual
    for (var i = 0; i < c.length; i++) {
        //alert(JSON.stringify(c[i])+ " no es vecino");
      if (c[i].salida === salida.id) {
        //alert(JSON.stringify(c[i]) + " Descubrio un vecino!!");
        vecinos_totales++;
        var con = c[i];
        for (var j = 0; j < v.length; j++) {
          var ver = v[j];
          //Si este es el vérice al que la conexión llega
          //alert("i: " + i);
          if (ver.id === con.llegada) {
            //realmente la rama no importa si ya esta vista y su costo es menor al que podemos ofrecer
            if (!(ver.visto && (ver.costo < (salida.costo + con.costo)))) {
              rama_agotada = false;
              break;
            }
            //rama_agotada = rama_agotada && (ver.visto && (ver.costo < (salida.costo + con.costo)));
          }
        }
      }
    } //FIN FOR RAMA AGOTADA
    //alert(vecinos_totales + " vecinos para " + JSON.stringify(salida));
    if (rama_agotada) {
      //alert("RETURN RAMA AGOTADA");
      return false;
    }
    //Buscamos conexiones que salgan de nuestro vertice salida
    for (var i = 0; i < c.length; i++) {
      totale_escalados_en_false = 0;
      //alert("Iteracion en i:" + i);
      //Las conexiones circulares no nos interesan
      if (c[i].salida === c[i].llegada) {
        //alert("Circular: " + JSON.stringify(c[i]));
        continue;
      }
      //Solo conexiones que salgan del vertice que nos interesa
      if (c[i].salida === salida.id) {
        var con = c[i];
        for (var j = 0; j < v.length; j++) {
          //alert("Iteracion en j:" + j);
          //Si este es el vérice al que la conexión llega
          if (v[j].id === con.llegada) {
            verticeActual = v[j];
            //Si el vértice aún no ha sido visto
            if (!verticeActual.visto) {
              //alert("No visto aún!!: " + JSON.stringify(verticeActual));
              verticeActual.padre = parseInt(salida.id, 10);
              verticeActual.costo = (parseInt(salida.costo, 10) + parseInt(con.costo, 10));
              verticeActual.iteracion = salida.iteracion + 1;
              verticeActual.visto = true;
            }
            //Si el costo actual del vertice es mayor que el que nosotros ofrecemos
            else if (verticeActual.visto && verticeActual.costo > (salida.costo + con.costo)) {
              //alert("Sobrescrito!!: " + JSON.stringify(verticeActual));
              verticeActual.padre = parseInt(salida.id, 10);
              verticeActual.costo = (parseInt(salida.costo, 10) + parseInt(con.costo, 10));
              verticeActual.iteracion = salida.iteracion + 1;
            } else {
              //alert("Else!!: " + JSON.stringify(verticeActual));
              continue;
            }
            //nos fijamos si ya todos salen como visto
            for (var k = 0; k < v.length; k++) {
              todos_vistos = todos_vistos && v[k].visto;
              if (!todos_vistos) {
                //alert("NOT TODOS VISTOS");
                break;
              }
            }
            //Si todos están vistos, ya terminamos
            if (todos_vistos || verticeActual.id === llegada.id) {
              //alert("RETURN SUCCESSFUL");
              return {
                "v": v,
                "c": c
              }
            }
            //sino
            else {
              res = vecinosDijkstra(v, c, verticeActual, llegada);
              //Si res es falso, la rama se quedo sin vetices a los que ir que no estuvieran visitados
              if (res !== false) {
                //alert("RETURN ESCALADO");
                return res;
              } else {
                totale_escalados_en_false++;
                //Si todos los intentos de recursividad se han rendido, hay vértices aislados
                if (totale_escalados_en_false === vecinos_totales) {
                  //alert("RETURN FOR TERMINADO, TODOS ESCALADOS");
                  return false;
                }
              }
            }
          }
        }
      }
    } //FIN FOR PRINCIPAL
    return false;
  }

  function parseDijkstra(res, final) {
    var final;
    var path = [];
    if (res === false) {
      return "Los vértices están aislados, no existe una ruta que los conecte"
    }
    var vertice_final;
    for (var i = 0; i < res.v.length; i++) {
      if (res.v[i].id === final.id) {
        vertice_final = res.v[i];
      }
    }
    path = ordenarArray(res.v, vertice_final, []);
    //alert("PATH: "+path.length)
    var msg = "";
    msg += "Costo total: " + vertice_final.costo + "<br/>";
    msg += "Saltos totales: " + vertice_final.iteracion + "<br/> <br/>";
    msg += "La ruta es: ";
    //path es un array con el orden al reves, vamos de final a inicio,y omitomos el primero de la lisa
    //para meterlo SIN la flecha el final
    for (var i = path.length - 1; i >= 1; i--) {
      msg += path[i].id + " <i class='material-icons  center-align'>trending_flat</i>";
    }
    msg += path[0].id;
    return msg;
  }

  function ordenarArray(v, vertice_actual, array) {
    //alert("Actual: "+JSON.stringify(vertice_actual));
    array.push(vertice_actual);
    if (vertice_actual.padre === null) {

      return array;
    }
    for (var i = 0; i < v.length; i++) {
      if (v[i].id === vertice_actual.padre) {
        //alert("WE HAVE TO GO DEEPER!");
        return ordenarArray(v, v[i], array)
      }
    }
  }

  function calcularEuleriano() {
    var pares = [];
    var inpares = [];
    var ceros = [];
    for (var i = 0; i < $scope.vertices.length; i++) {
      //total += $scope.vertices[i].grado;
      if (($scope.vertices[i].grado % 2) !== 0) {
        inpares.push($scope.vertices[i]);
      } else if ($scope.vertices[i].grado !== 0) {
        pares.push($scope.vertices[i]);
      } else {
        ceros.push($scope.vertices[i])
      }
    }
    if (inpares.length === 2 && ceros.length === 0) {
      var primero = inpares[0];
      var segundo = inpares[1];

      $scope.tipo = $scope.SEMIEULER;

      var v = $scope.vertices;
      var c = $scope.matriz;
      var r = primero.id;
      var f = primero.id;
      var l = segundo.id;
      //var circuito = SemiEulerianoFleury(c, v, c, r, f, l, []);
      var camino = SemiEulerianoFleury(c, v, c, r, f, l, []);
      var msg = "";
      if (camino !== false) {
        msg += "<h3>" + "El Camino Euleriano es: " + parseFleury(camino) + "</h3>" + "<br/>";
      } else {
        msg += "<h3>No existe un Camino Euleriano...</h3><br/>";
      }
      if (msg !== $scope.path_html) {
        $scope.path_html = msg;
        Materialize.toast("Nuevo camino de Euler calculado!", 3000);
      }
    } else if (pares.length === $scope.vertices.length && inpares.length === 0 && ceros.length === 0) {
      //alert("Carefull");
      $scope.tipo = $scope.EULER;
      var v = $scope.vertices;
      var c = $scope.matriz;
      var r = $scope.vertices[0].id;
      var f = $scope.vertices[0].id;
      var circuito = CircuitoFleury(c, v, c, r, f, []);
      var camino = CaminoFleury(c, v, c, r, f, []);
      var msg = "";
      if (circuito !== false) {
        msg += "<h3>" + "Un Circuito Euleriano es: " + parseFleury(circuito) + "</h3>" + "<br/>";
      } else {
        msg += "<h3>No existe un Circuito Euleriano...</h3><br/>";
      }
      if (camino !== false) {
        msg += "<h3>" + "Un Camino Euleriano es: " + parseFleury(camino) + "</h3>" + "<br/>";
      } else {
        msg += "<h3>No existe un Camino Euleriano...</h3><br/>";
      }
      if (msg !== $scope.path_html) {
        $scope.path_html = msg;
        Materialize.toast("Nuevo camino de Euler calculado!", 3000);
      }
      //alert("v: " + v + " c: " + c + " r: " + r + " f: " + f);
      //$("#path").html("Un camino Euleriano es: " + parseFleury(Fleury(v, c, r, f, [])));
    } else if (ceros.length !== 0) {
      $scope.tipo = $scope.ISOLATED;
      $scope.path_html = "";
    } else {
      $scope.tipo = $scope.NOEULER;
      $scope.path_html = "";
    }
  }




});


//Euler
function CircuitoFleury(c_original, v, c, r, f, path) {
  //alert("v: " + v.length + " c: " + c.length + " r: " + r + " f: " + f + " p: " + path.length);
  //console.log(path);
  for (var i = 0; i < c.length; i++) {
    if (c[i].salida !== r) {
      continue;
    }
    //alert("Conexion: " + JSON.stringify(c[i]));
    //alert("path: " +  + "f: " + f)
    //c[i].llegada === f &&
    if (c[i].llegada === f && c.length === (2)) {
      var p_c = path.slice();
      //alert("Insertado!!:  " + c[i]);
      p_c.push(c[i]);
      //alert("PATH: " + path.length);
      return p_c;
    } else {
      var path_clone = path.slice();
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
      var res = CircuitoFleury(c_original, v_clone, c_clone, c[i].llegada, f, path_clone);
      if (res !== false) {
        return res;
      }
    }
  }
  return false;
}

function CaminoFleury(c_original, v, c, r, f, path) {
  //alert("c_o: " + c_original.length + "v: " + v.length + " c: " + c.length + " r: " + r + " f: " + f + " p: " + path.length);
  //var path_clone = path;
  for (var i = 0; i < c.length; i++) {
    if (c[i].salida !== r) {
      continue;
    }
    ///alert("Conexion: " + JSON.stringify(c[i]));
    //alert("path: " +  + "f: " + f)
    //c[i].llegada === f &&

    if (c.length === (2)) {
      var p_c = path.slice();
      //alert("Success");
      p_c.push(c[i]);
      //alert("Finishing blow is: " + JSON.stringify(c[i]));
      return p_c;
    } else {
      var path_clone = path.slice();
      var c_clone = c;
      var v_clone = v;
      //alert("1ST  CLONE: "+path_clone.length+" PATH: "+path.length);
      c_clone = c_clone.filter(function(item) {
        //eliminamos esta conexion, y si la tiene, su inversa
        return (item.salida !== c[i].salida || item.llegada !== c[i].llegada) && (item.salida !== c[i].llegada || item.llegada !== c[i].salida);
      });
      v_clone = v_clone.filter(function(item) {
        return item.id !== r;
      });

      path_clone.push(c[i]);
      //alert("2ND  CLONE: "+path_clone.length+" PATH: "+path.length);
      var res = CaminoFleury(c_original, v_clone, c_clone, c[i].llegada, f, path_clone);
      //alert("res: " + (res !== false));
      if (res !== false) {
        //alert("Escalado!!:  " + JSON.stringify(c[i]));
        return res;
      }
    }
  }
  return false;
}


function SemiEulerianoFleury(c_original, v, c, r, f, l, path) {
  //alert("v: " + v.length + " c: " + c.length + " r: " + r + " f: " + f + " p: " + path.length);
  //console.log(path);
  for (var i = 0; i < c.length; i++) {
    if (c[i].salida !== r) {
      continue;
    }
    //alert("Conexion: " + JSON.stringify(c[i]));
    //alert("path: " +  + "f: " + f)
    //c[i].llegada === f &&
    if (c[i].llegada === l && c.length === (2)) {
      var p_c = path.slice();
      //alert("Insertado!!:  " + c[i]);
      p_c.push(c[i]);
      return p_c;
    } else {
      var path_clone = path.slice();
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
      var res = SemiEulerianoFleury(c_original, v_clone, c_clone, c[i].llegada, f, l, path_clone);
      if (res !== false) {
        return res;
      }
    }
  }
  return false;
}

function parseFleury(res) {
  //alert(JSON.stringify(res[res.length-1]));
  var msg = "";
  if (res === false) {
    return "false";
  } else {
    for (var i = 0; i < res.length; i++) {
      //msg += "[" + res[i].salida + "," + res[i].llegada + "] ";
      msg += res[i].salida + " <i class='material-icons  center-align'>trending_flat</i> ";
    }
    msg += res[res.length - 1].llegada;

  }
  return msg;
}
