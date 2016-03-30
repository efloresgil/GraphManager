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
