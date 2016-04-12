var app = angular.module("numericsys", []);

app.controller('convertion', function($scope) {

});

app.controller('decToBin', function($scope) {
  this.number = 0;
  this.convert = function() {
    var dec = this.number + "";
    this.resultado = parseInt(dec, 10).toString(2);
  };
});

app.controller('binToDec', function($scope) {
  this.number = 0;
  this.convert = function() {
    var bin = this.number + "";
    this.resultado = parseInt(bin, 2).toString(10);
  };
});

app.controller('binToOct', function($scope) {
  this.number = 0;
  this.convert = function() {
    var bin = this.number + "";
    this.resultado = parseInt(bin, 2).toString(8);
  };
});

app.controller('octToBin', function($scope) {
  this.number = 0;
  this.convert = function() {
    var oct = this.number + "";
    this.resultado = parseInt(oct, 8).toString(2);
  };
});

app.controller('suma', function($scope) {
  this.number1 = 0;
  this.number2 = 0;

  this.sumar = function() {
    var n1 = this.number1 + "";
    var n2 = this.number2 + "";

    var n1Bin=parseInt(n1, 2).toString(10);
    var n2Bin=parseInt(n2, 2).toString(10);

    var resultado = (parseInt(n1Bin, 10) + parseInt(n2Bin, 10)).toString(2);
    this.resultado = resultado;
  };
});

app.controller('resta', function($scope) {
  this.number1 = 0;
  this.number2 = 0;

  this.restar = function() {
    var n1 = this.number1 + "";
    var n2 = this.number2 + "";

    var n1Bin=parseInt(n1, 2).toString(10);
    var n2Bin=parseInt(n2, 2).toString(10);

    var resultado = (parseInt(n1Bin, 10) - parseInt(n2Bin, 10)).toString(2);
    this.resultado = resultado;
  };
});
