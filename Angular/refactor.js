//Dijkstra
$scope.dijkstra_init = function(salida, llegada, vertices, conexiones) {
  //alert("init");
  var c = conexiones.slice();
  var v = vertices.slice();
  var opciones = [];
  if (typeof $scope.selectedSalida === "undefined" || typeof $scope.selectedLlegada === "undefined") {
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

    if (typeof llegada === "undefined" || typeof salida === "undefined") {
      Materialize.toast("Selecciona los vértices de salida y llegada", 3000);
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
        //alert("Suma: " + salida.costo + "Costo Conexion: " + conexion.costo + " = " + (parseInt(salida.costo, 10) + parseInt(conexion.costo, 10)));
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
      else if (vecino.visto && vecino.costo > (best_opt.costo + conexion.costo)) {
        //alert("Sobrescrito!!: " + JSON.stringify(vecino));
        vecino.padre = parseInt(best_opt.id, 10);
        vecino.costo = (parseInt(best_opt.costo, 10) + parseInt(best_opt.costo, 10));
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
        if (v[i].id !== actual.padre) {
          actual = v[i];
        }
      }
    } //While

    //recorremos el array al reves para armar el string
    for (var i = (orden_inverso.length - 1); i >= 0; i--) {
      //alert("obj: " + );
      msg += orden_inverso[i].id;
        if (i !== orden_inverso.length - 1) {
          msg += "<i class='material-icons  center-align'>trending_flat</i>";
        }

    }
    return msg;
  } //Else
} //Func
