///<reference path="../typings/angularjs/angular.d.ts" />
///<reference path="./Quiz.ts" />
///<reference path="./Model.ts" />


module SevenThree {
	export enum Mode {
		Input,
		Playing
	}

	import Field = Model.Field;
	import Member = Model.Member;

	export interface Scope extends ng.IScope {
		idtext               : string;
		name                 : string;
		inputText            : string;
		qNumber              : number;
		memberList           : Member[];
		mode                 : Mode;
		addMemberTemporally(): void;
		deleteAllMembers()   : void;
		confirmMembers()     : void;
		toggleSelected(m:Member): void;
		onKeyDown()          : void;
		tempMems             : Member[];
	}

	export class Controller {
		constructor(public $scope: Scope, public field: Field) {
			this.$scope.qNumber        = this.field.qNumber;
			this.$scope.memberList     = this.field.Members;
			this.$scope.tempMems       = [new Member("a",1),new Member("b",2)];
			this.$scope.addMemberTemporally = this.addMemberTemporally.bind(this);
			this.$scope.confirmMembers = this.confirmMembers.bind(this);
			this.$scope.toggleSelected = this.toggleSelected.bind(this);
			this.$scope.onKeyDown      = this.onKeyDown.bind(this);
			this.$scope.mode           = Mode.Input;
			console.log(this.$scope.mode);
		}

		addMemberTemporally(): void {
			var byLine: string[] = this.$scope.inputText.split("\n");
			for (var i = 0; i < byLine.length; ++i) {
				var spTxt: string[] = byLine[i].split(",");
				var m: Member = new Member(spTxt[1],parseInt(spTxt[0]));
				this.$scope.tempMems.push(m);
			}
		}

		deleteAllMembers(): void {
			this.$scope.tempMems = [];
		}

		confirmMembers(): void {
			this.field.resetMembers();
			for (var i = 0; i < this.$scope.tempMems.length; ++i){
				this.field.addMember(this.$scope.tempMems[i]);
			}
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