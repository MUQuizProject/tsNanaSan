///<reference path="../typings/angularjs/angular.d.ts" />
///<reference path='Quiz.ts'/>
///<reference path='Model.ts'/>
///<reference path='Controller.ts' />

module SevenThree {
	angular.module("seventhree",[])
	.service("field",SevenThree.Model.Field)
	.controller("fieldcontroller",SevenThree.Controller);
}
