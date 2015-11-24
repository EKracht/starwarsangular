'use strict';

var myapp = angular.module('myapp', ["ui.router"]);
    
    myapp.service("residentSvc", function(){
      this.residents = {};
      var resident = {};
      this.saveResident = function(theResident, id){
        resident[id] = theResident;
        this.residents[id] = theResident;
      }
      this.getResident = function(id){
        return resident[id];
      }
    });

    myapp.controller("ResidentCtrl", function($scope, $http, $stateParams, residentSvc) {
      var id = $stateParams.id;
      if (!residentSvc.getResident(id)) {
        $http.get("http://swapi.co/api/people/" + id + "/?format=json")
        .then(res => {
          residentSvc.saveResident(res.data, id);
          $scope.character = residentSvc.getResident(id);
        }).catch(error => console.error(error.status));
      } else {
        $scope.character = residentSvc.getResident(id);
      }
    });

    myapp.service("planetsSvc", function(){
      var planets = [];
      this.savePlanets = function(res){
        planets = res.map(planet => {
          planet.residents = planet.residents.map(resident => {
            var resident = { url: resident };
            resident.id = resident.url.match(/\d+/)[0];
            return resident;
          });
          return planet;
        });
      };

      this.getPlanets = function(){
        return planets;
      };
    });

    myapp.controller("PlanetCtrl", function($scope, $http, planetsSvc, residentSvc) {
      $scope.knownResidents = residentSvc.residents;
      if (planetsSvc.getPlanets().length === 0) {
        $http.get("http://swapi.co/api/planets/?format=json")
        .then(res => {
          planetsSvc.savePlanets(res.data.results);
          $scope.planets = planetsSvc.getPlanets();
        }).catch(error => console.error(error.status));
      } else {
        $scope.planets = planetsSvc.getPlanets();
      }
    });

    myapp.config(function($stateProvider, $urlRouterProvider){
      $urlRouterProvider.otherwise("/planets")
      $stateProvider
        .state('planets', {
          url: "/planets",
          templateUrl: "planets.html",
          controller: "PlanetCtrl as p"
        })
        .state('resident', {
          url: "/resident/:id",
          templateUrl: "resident.html",
          controller: "ResidentCtrl as r"
        })
    })