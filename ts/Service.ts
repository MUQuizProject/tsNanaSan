///<reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="./Model.ts" />

module SevenThree {
	import Member = Model.Member;
	import Undo = Model.Undo;

	export class Service {
		mList : Member[];
		uStack: Undo;
		qNum  : number;

		constructor() {
			mList  = [];
			uStack = new Undo();
			qNum   = 1;
		}

		addMember(m: Member): void {this.mList.push(m);}

		getSelected(): number[]{
			var r: number[] = [];
			for (var i = 0; i < this.mList.length; ++i) {
		        if(this.mList[i].isSelected) {
		          r.push(i);
		        }
      		}
      		return r;
    	}

    	resetSelected(): void{
	    	for (var i = 0; i < this.mList.length; ++i) {
	        	this.mList[i].changeSelected(false);
	      	}
    	}

    	answerRight(): void {
		      this.uStack.stack(this.to_s());
		      var indices: number[] = this.getSelected();
		      for (var i = 0; i < indices.length; ++i) {
		        this.mList[i].answerRight();
		      }
		      this.qNum++;
		    }
    answerWrong(): void {
      this.uStack.stack(this.to_s());
      var indices: number[] = this.getSelected();
      for (var i = 0; i < indices.length; ++i) {
        this.mList[i].answerWrong();
      }
      this.qNum++;
    }

    to_s(): string {
      var r: string = "";
      for (var i = 0; i < this.mList.length; ++i) {
        r = r + this.mList[i].to_s() + "/";
      }

      return r;
    }
    rewriteField(s: string): void {
      var splitted: string[] = s.split("/");
      for (var i = 0; i < splitted.length; ++i) {
        this.mList[i].rewriteMember(splitted[i]);
      }
    }
    undo(): void {
      this.rewriteField(this.uStack.undo());
    }
	}
}
