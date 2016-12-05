
var app = angular.module('chatApp', []);
app.controller('chatCtrl', function($scope, $http) {

    $scope.messages = [];
    $scope.loggedIn = false;
    $scope.inRoom = false;

    
    

    $scope.send = function() {
        socket.emit('message', $scope.msg);
    }
})

var join = function() {
    console.log('Trying to join');
    var $scope = angular.element(document.getElementById('chatApp')).scope();

    socket.emit('join', {room: $scope.room, name: $scope.user.name, email: $scope.user.email});
    
    socket.on('response', function(msg) {
        console.log(msg);
    });

    socket.on('inRoom', function(msg) {
        console.log(msg);
        $scope.inRoom = true;
        $scope.$apply();
    });
}

var login = function(user) {
    socket = io();
    console.log('Trying to connect');
    var $scope = angular.element(document.getElementById('chatApp')).scope();
    $scope.user = user;
    socket.on('rooms', function(rooms) {
        $scope.rooms = rooms;
        $scope.loggedIn = true;
        $scope.$apply();
    });
    
    socket.on('message', function(msg) {
        // console.log('message:', msg);
        $scope.messages.push(msg);
        $scope.msg = '';
        $scope.$apply();
    })
}

function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    //   console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    //   console.log('Name: ' + profile.getName());
    //   console.log('Given Name: ' + profile.getGivenName());
    //   console.log('Family Name: ' + profile.getFamilyName());
    //   console.log('Image URL: ' + profile.getImageUrl());
    //   console.log('Email: ' + profile.getEmail());
    var user = {};
    user.email = profile.getEmail();
    user.name = profile.getGivenName();

    login(user);
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
    });
}