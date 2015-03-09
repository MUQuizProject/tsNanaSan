///<reference path="../typings/angularjs/angular.d.ts" />
///<reference path="./Quiz.ts" />
///<reference path="./Model.ts" />

module SevenThree {
	import Field = Model.Field;
	import Member = Model.Member;

	export interface Scope extends ng.IScope {
		idtext          : string;
		name            : string;
		qNumber         : number;
		memberList      : Member[];
		addMember()     : void;
		toggleSelected(m: Member): void;
		onKeyDown()		: void;
	}

	export class Controller {
		
		constructor(public $scope: Scope, public field: Field) {
			console.log("constructor in Controller is called");
			this.$scope.qNumber        = this.field.qNumber;
			this.$scope.memberList     = this.field.Members;
			this.$scope.addMember      = this.addMember.bind(this);
			this.$scope.toggleSelected = this.toggleSelected.bind(this);
			this.$scope.onKeyDown      = this.onKeyDown.bind(this);
		}

		addMember():void {
			console.log("addMember is called");
			var m: Member = new Member(this.$scope.name,parseInt(this.$scope.idtext));
			this.field.addMember(m);
			this.$scope.qNumber = this.field.qNumber;
			this.$scope.memberList = this.field.Members;
		}

		toggleSelected(member: Member): void {
			console.log(member.id);
			this.field.toggleSelected(member.id);
			this.$scope.qNumber = this.field.qNumber;
			this.$scope.memberList = this.field.Members;
		}

		onKeyDown(): void {
			switch(event.keyCode) {
				case 79:
				this.field.answerRight();
				break;
				case 88:
				this.field.answerWrong();
				break;
				case 85:
				this.field.undo();
				break;
				default:
				break;
			}
			this.$scope.qNumber = this.field.qNumber;
			this.$scope.memberList = this.field.Members;
		}
	}
}