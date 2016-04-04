var app = angular.module("GraphManager", ['ngSanitize']);

app.controller('mainCtrl', function($scope, $filter) {
  var first = {
    "id": 1,
    "color": "#eee",
    "grado": 0
  };
  //variables del scope principal
  //yes
  $scope.hw = null;
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
    var mayor = 0;
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
    this.costo = parseInt(costo, 10);
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

  $scope.resetVertices = function() {
    $scope.vertices = [];
    $scope.resetConexiones();
  }

  $scope.resetConexiones = function() {
    $scope.matriz = [];
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
  $scope.dijkstra_init = function(salida, llegada, vertices, conexiones) {
    //alert("init");
    var c = conexiones.slice();
    var v = vertices.slice();
    var opciones = [];
    if (typeof salida === "undefined" || llegada === "undefined") {
      Materialize.toast("Selecciona los vértices de salida y llegada", 3000);
    } else {
      //inicializo las métricas para la funcion en todos los vértices
      for (var i = 0; i < v.length; i++) {
        v[i].padre = null;
        v[i].costo = -1;
        v[i].visto = false;
        v[i].iteracion = 0;
      }
      //inicializo salida
      salida.visto = true;
      salida.costo = 0;

      opciones.push(salida);

      if (salida.id === llegada.id) {
        Materialize.toast("El inicio y el final no pueden ser iguales");
        return false;
      }



      resultado = pathfinder(v, c, salida, llegada, opciones);
      $scope.dijkstra_html = parseDijkstra(resultado, salida, llegada, opciones);
    }
  }

  function pathfinder(v, c, salida, llegada, opciones) {
    //alert("PathFinder iniciado");
    //alert("OPTS:" + opciones.length);
    while (true) {
      var best_opt = bestOption(opciones);
      //alert("Best Option is: " + JSON.stringify(best_opt));
      var vecinos = getVecinos(best_opt, v, c);
      //alert("Vecinos encontrados: " + vecinos.length);
      var vecino;
      var conexion;
      for (var i = 0; i < vecinos.length; i++) {
        vecino = vecinos[i].vecino;
        conexion = vecinos[i].conexion;
        //alert("CONEXION: " + JSON.stringify(conexion));
        if (!vecino.visto) {
          //alert("No visto aún!!: " + JSON.stringify(vecino));
          vecino.padre = parseInt(best_opt.id, 10);
          vecino.costo = (parseInt(best_opt.costo, 10) + parseInt(conexion.costo, 10));
          //alert("NUEVO COSTO ES: " + vecino.costo);
          //alert("Salida: " + salida.costo + "Costo Conexion: " + conexion.costo + " = " + (parseInt(salida.costo, 10) + parseInt(conexion.costo, 10)));
          vecino.iteracion = best_opt.iteracion + 1;
          vecino.visto = true;

          //actualizamos como se ve el vertice en el array que vamos a retornar
          for (var j = 1; j < v.length; j++) {
            if (v[j].id === vecino.id) {
              v[j] = vecino;
            }
          }
          opciones.push(vecino); //anadimos la nueva opcion
        }
        //Si el costo actual del vertice es mayor que el que nosotros ofrecemos
        else if (vecino.visto && vecino.costo > (parseInt(best_opt.costo) + parseInt(conexion.costo))) {
          //alert("Sobrescrito!!: " + JSON.stringify(vecino));
          vecino.padre = parseInt(best_opt.id, 10);
          vecino.costo = (parseInt(best_opt.costo, 10) + parseInt(conexion.costo, 10));
          vecino.iteracion = best_opt.iteracion + 1;
          //actualizamos como se ve el vertice en el array que vamos a retornar
          for (var j = 1; j < v.length; j++) {
            if (v[j].id === vecino.id) {
              v[j] = vecino;
            }
          }
          opciones.push(vecino); //anadimos la nueva opcion
        } else {
          //alert("Else!!: " + JSON.stringify(vecino));
          continue;
        }

      } //for each neighbor
      //sacamos la opcion que acabamos de procesar de la pila
      opciones = opciones.filter(function(item) {
        return item.id !== best_opt.id;
      });
      //cuando todas las opciones posibles se agotan, estamos listos
      if (opciones.length === 0) {
        //alert("Break");
        break;
      }
    } //while true
    //retornamos los vertices ya actualizados
    return v;
  } //pathfinder


  function bestOption(opciones) {
    var mejor = opciones[0];
    var actual = {};
    for (var i = 1; i < opciones.length; i++) {
      actual = opciones[i];
      if (actual.costo < mejor.costo) {
        mejor = actual;
      } //if
    } //for
    return mejor;
  } //func


  function getVecinos(vertice, v, c) {
    var con;
    var ver;
    var vecinos = [];
    for (var i = 0; i < c.length; i++) {
      con = c[i];
      //solo conecciones que salen del vertice que nos importa
      if (con.salida === vertice.id) {
        for (var j = 0; j < v.length; j++) {
          ver = v[j];
          //si es vecino, osea la conexion actual desemboca aqui
          if (ver.id === con.llegada) {
            vecinos.push({
              "vecino": ver,
              "conexion": con
            });
          }
        }
      }
    }
    return vecinos;
  } //func

  function parseDijkstra(resultado, salida, llegada, opciones) {
    //alert("Resultado:" + resultado.length);
    var final = {};
    var actual;
    var orden_inverso = [];
    var orden_correcto = [];
    var v = resultado.slice();
    //alert("V:" + resultado.length);
    var msg = "";

    //alert("Llegada: " + JSON.stringify(llegada));
    for (var i = 0; i < v.length; i++) {
      if (v[i].id === llegada.id) {
        final = v[i];
        actual = final;
      }
    }

    //alert("FINAL: " + JSON.stringify(final));

    if (final.costo < 0) {
      return "Los vértices están aislados, no exite un camino que los conecte."
    } else {
      msg += "Costo total: " + final.costo + "<br/>";
      msg += "Saltos totales: " + final.iteracion + "<br/> <br/>";
      msg += "La ruta es: ";

      while (true) {
        //alert("PUSH: " + JSON.stringify(actual));
        orden_inverso.push(actual);

        if (actual.padre === null) {
          break;
        }

        //otenemos un array con los saltos, pero al reves
        for (var i = 0; i < v.length; i++) {
          if (v[i].id === actual.padre) {
            actual = v[i];
            break;
          }
        }
      } //While

      //recorremos el array al reves para armar el string
      for (var i = (orden_inverso.length - 1); i >= 0; i--) {
        //alert("obj: " + );
        msg += orden_inverso[i].id;
        if (i !== 0) {
          msg += "<i class='material-icons  center-align'>trending_flat</i>";
        }

      }
      return msg;
    } //Else
  } //Func

  //KRUSKAL
  $scope.kruskal_init = function(vertices, conexiones, minimo) {
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

    if (ceros.length !== 0) {
      Materialize.toast("Hay vértices desconectados!", 3000);
      return false;
    }


    var v = vertices.slice();
    var c = conexiones.slice();
    var capa = 0;
    var saltos = 0;
    var n = v.length;
    var escogidos = [];
    var arbol = [];
    var hijos = [];
    var mejor_con = {};
    var llegada = {};
    var salida = {};
    var inversa = {};
    var primero = {};


    for (var i = 0; i < v.length; i++) {
      var ver = v[i];
      ver.visto = false;
    }

    c = c.filter(function(item) {
      return item.salida !== item.llegada;
    });
    if (minimo) {
      c = $filter('orderBy')(c, "costo");
    } else {
      c = $filter('orderBy')(c, "-costo");
    }
    //console.log(c);

    mejor_con = getMejorCon(c, minimo);
    llegada = getVertice(mejor_con.llegada);
    salida = getVertice(mejor_con.salida);
    inversa = getInverso(mejor_con);

    escogidos.push(mejor_con);

    //Eliminamos esta y su inversa, si existe
    //alert("b4 LENGTH: " + c.length);
    c = c.filter(function(item) {
      if (inversa !== false) {
        //alert("MEJOR_CON: " + JSON.stringify(mejor_con) + "A FILTRAR: " + JSON.stringify(item) + " FILTRADO: " + !(((item.salida === mejor_con.salida) && (item.llegada === mejor_con.llegada)) || ((item.llegada === mejor_con.salida) && (item.salida === mejor_con.llegada))));
        return !(((item.salida === mejor_con.salida) && (item.llegada === mejor_con.llegada)) || ((item.llegada === mejor_con.salida) && (item.salida === mejor_con.llegada)));
      } else {
        //alert("MEJOR_CON: " + JSON.stringify(mejor_con) + "A FILTRAR: " + JSON.stringify(item) + " FILTRADO: " + !((item.salida === mejor_con.salida) && (item.llegada === mejor_con.llegada)));
        return !((item.salida === mejor_con.salida) && (item.llegada === mejor_con.llegada));
      }
    });
    //alert("AFTER: " + c.length + "SALTOS: " + saltos);

    salida.visto = true;
    llegada.visto = true;

    saltos++;

    while (saltos !== (n - 1)) {

      mejor_con = getMejorCon(c, minimo);
      //alert("MEJOR_CON: " + JSON.stringify(mejor_con));
      llegada = getVertice(mejor_con.llegada);
      salida = getVertice(mejor_con.salida);
      inversa = getInverso(mejor_con);
      //alert("LLEGADA: " + JSON.stringify(llegada));
      if (!llegada.visto) {
        escogidos.push(mejor_con);
        llegada.visto = true;
        saltos++;
        //alert("SALTOS++");
      }
      //alert("b4 LENGTH: " + c.length);
      c = c.filter(function(item) {
        if (inversa !== false) {
          //alert("MEJOR_CON: " + JSON.stringify(mejor_con) + "A FILTRAR: " + JSON.stringify(item) + " FILTRADO: " + !(((item.salida === mejor_con.salida) && (item.llegada === mejor_con.llegada)) || ((item.llegada === mejor_con.salida) && (item.salida === mejor_con.llegada))));
          return !(((item.salida === mejor_con.salida) && (item.llegada === mejor_con.llegada)) || ((item.llegada === mejor_con.salida) && (item.salida === mejor_con.llegada)));
        } else {
          //alert("MEJOR_CON: " + JSON.stringify(mejor_con) + "A FILTRAR: " + JSON.stringify(item) + " FILTRADO: " + !((item.salida === mejor_con.salida) && (item.llegada === mejor_con.llegada)));
          return !((item.salida === mejor_con.salida) && (item.llegada === mejor_con.llegada));
        }
      });
      //alert("AFTER: " + c.length + "SALTOS: " + saltos);
      //alert("SALTOS: " + saltos);
    } //while;
    //return escogidos;
    if (minimo) {
      escogidos = $filter('orderBy')(escogidos, "costo");
    } else {
      escogidos = $filter('orderBy')(escogidos, "-costo");
    }
    //alert("Retun escogidos: " + escogidos.length);
    arbol = getArbol(escogidos, escogidos);

    $scope.arbolKruskal = arbol;
    console.log(arbol);
  }

  function getArbol(escogidos, c_original) {
    var salida = {};
    var llegada = {};
    var arbol = [];
    var arbol_hijos = [];
    var actual = {};
    var hijos = [];
    var ramas = [];
    var hijosFull=[0];

    escogidos = escogidos.slice();
    while (escogidos.length !== 0) {
      //estan ordenados por orden y eliminamos a los hijos asi que siempre ocuparemos al 0
      //alert("Escogidos: " + escogidos.length);
      actual = escogidos[0];
      salida = getVertice(actual.salida);
      llegada = getVertice(actual.llegada);

      //alert("Actual: " + JSON.stringify(actual));

      hijos = getHijos(actual, c_original);
      hijosFull=getHijosFull(hijos);


      for (var i = 0; i < hijos.length; i++) {
        hijos[i].tienePadre = true;
      }
      //alert(JSON.stringify(actual) + " tiene " + hijos.length + " hijos ");
      //quito los hijos de escogidos y el actual
      escogidos = escogidos.filter(function(item) {
        return (item.salida !== llegada.id) && (item.salida !== actual.salida || item.llegada !== actual.llegada) && !isHijo(item, hijosDeep);
      });
      //alert("Escogidos: " + escogidos.length);


      //aun hay hijos por los que seguir
      if (hijos.length !== 0) {
        arbol_hijos = getArbol(hijos, c_original);
        ramas.push(arbol.hijos);
      }

      arbol.push({
        conexion: actual,
        vertice: salida,
        hijos: arbol_hijos,
        ramas: ramas
      });
    }


    return arbol;
    if (arbol.ramas.length === 0) {
      return arbol;
    }
  }

  function getHijosFull(ver, escogidos) {
    var hijosTotal = [];
    var hijos = getHijos(ver, escogidos);
    var hijosDeep = [];
    for (var i = 0; i < hijos.length; i++) {
      hijosDeep.push(getHijosFull(hijos[i], escogidos));
    }
    for (var i = 0; i < hijosDeep.length; i++) {
      var actual = hijosDeep[i];
      for (var i = 0; j < actual.length; j++) {
        hijosTotal.push(actual[j]);
      }
      //hijosDeep[i];
    }
    return hijosTotal;
  }

  function isHijo(conexion, hijos) {
    for (var i = 0; i < hijos.length; i++) {
      var actual = hijos[i];
      if (actual.salida === conexion.salida && actual.llegada===conexion.llegada) {
        return true;
      }
    }
    return false;
  }

  function getHijos(ver, escogidos) {
    var hijos = [];
    for (var i = 0; i < escogidos.length; i++) {
      var actual = escogidos[i];
      var llegada = getVertice(actual.llegada);
      var salida = getVertice(actual.salida);

      if ((actual.salida === ver.llegada) && !actual.tienePadre) {
        actual.tienePadre = true;
        hijos.push(actual);
      }
    }
    return hijos;
  }

  function getMejorCon(c, minimo) {
    var mejor = c[0];
    for (var i = 0; i < c.length; i++) {
      var con = c[i];
      if (minimo) {
        if (mejor.costo > con.costo) {
          mejor = con;
        }
      } else {
        if (mejor.costo < con.costo) {
          mejor = con;
        }
      }
    }
    return mejor;
  }

  function getVertice(id) {
    for (var i = 0; i < $scope.vertices.length; i++) {
      var actual = $scope.vertices[i];
      if (actual.id === id) {
        //alert(actual);
        return actual;
      }
    }
  }

  function getInverso(conexion) {
    for (var i = 0; i < $scope.matriz.length; i++) {
      var actual = $scope.matriz[i];
      if ((actual.salida === conexion.llegada) && (actual.llegada === conexion.salida)) {
        return actual;
      }
    }
    return false;
  }

  function parseKruskal(res) {
    var template = "";
    var actual = res[0];
    var hijos = [];

  }

  //Euleriano
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
