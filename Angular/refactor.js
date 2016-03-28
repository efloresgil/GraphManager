function dijkstra_init(salida, llegada, vertices, conexiones) {
  var c = conexiones.slice();
  var v = vertices.slice();
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

  resultado = vecinosDijkstra(v, c, salida, llegada);
  $scope.dijkstra_html = parseDijkstra(resultado, llegada);
}

function pathfinder(v, c, salida, llegada, opciones) {
  while (true) {
    var best_opt = bestOption(opciones);
    var vecinos = getVecinos(best_opt, v, c);
    var vecino;
    var conexion;
    for (var i = 1; i < vecinos.length; i++) {
      vecino = vecinos[i].ver;
      conexion = vecinos[i].conexion;
      if (!vecino.visto) {
        //alert("No visto aún!!: " + JSON.stringify(verticeActual));
        vecino.padre = parseInt(salida.id, 10);
        vecino.costo = (parseInt(salida.costo, 10) + parseInt(conexion.costo, 10));
        vecino.iteracion = salida.iteracion + 1;
        vecino.visto = true;

        //actualizamos como se ve el vertice en el array que vamos a retornar
        for (var j = 1; j < v.length; j++) {
          if (v[j].id === vecino.id) {
            v[j] = vecino;
          }
        }
      }
      //Si el costo actual del vertice es mayor que el que nosotros ofrecemos
      else if (vecino.visto && vecino.costo > (salida.costo + conexion.costo)) {
        //alert("Sobrescrito!!: " + JSON.stringify(verticeActual));
        vecino.padre = parseInt(salida.id, 10);
        vecino.costo = (parseInt(salida.costo, 10) + parseInt(conexion.costo, 10));
        vecino.iteracion = salida.iteracion + 1;
        //actualizamos como se ve el vertice en el array que vamos a retornar
        for (var j = 1; j < v.length; j++) {
          if (v[j].id === vecino.id) {
            v[j] = vecino;
          }
        }
      } else {
        //alert("Else!!: " + JSON.stringify(verticeActual));
        continue;
      }
      opciones.push(vecino); //anadimos la nueva opcion
    } //for each neighbor
    //sacamos la opcion que acabamos de procesar de la pila
    opciones.filter(function(item) {
      return item.id === best_opt.id;
    });
    //cuando todas las opciones posibles se agotan, estamos listos
    if (opciones.length === 0) {
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
            "vecino": ver;
            "conexion": con
          });
        }
      }
    }
  }
} //func
