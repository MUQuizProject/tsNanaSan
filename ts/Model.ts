///<reference path='Quiz.ts'/>

module SevenThree.Model {
  export class Parameter implements IParameter {
    right  : number;
    misses : number;
    state  : State;

    constructor() {
      this.right  = 0;
      this.misses = 0;
      this.state  = State.Normal;
    }
    
    get Right(): number {return this.right;}
    get Misses(): number {return this.misses;}
    get State(): State {return this.state;}

    set Right(n: number) {
      this.right = n;
      if(this.right >= 7) {
        this.state = State.Win;
      } else {
        this.state = State.Normal;
      }
    }

    set Misses(n: number){
      this.misses = n;
      if(this.misses >= 3) {
        this.state = State.Lose;
      } else {
        this.state = State.Normal;
      }
    }

    to_s(): string {
      return this.right + "," + this.misses + "," + this.state;
    }

    rewriteParameter(s: string): void {
      var array: string[] = s.split(",");
      this.right  = parseInt(array[0]);
      this.misses = parseInt(array[1]);
      this.state  = parseInt(array[2]);
    }
  }

  export class Member implements IMember {
    id         : number;
    name       : string;
    parameter  : Parameter;
    isSelected : boolean;

    constructor(name: string, id: number) {
      this.id   = id;
      this.name = name;
      this.parameter = new Parameter();
      this.isSelected = false;
    }

    get Selected(): boolean {return this.isSelected;}

    set Selected(flag: boolean) {this.isSelected = flag;}

    getRight(): number {return this.parameter.Right;}

    getMisses(): number {return this.parameter.Misses;}

    getState(): State {return this.parameter.State;}

		to_s(): string {
      return this.id + ":" + this.parameter.to_s();
    }

    answerRight(): void {
      this.parameter.Right = this.parameter.Right + 1;
    }

    answerWrong(): void {
      this.parameter.Misses = this.parameter.Misses + 1;
    }

		rewriteMember(s: string): void {
      var ss = s.split(":");
      this.id = parseInt(ss[0]);
      this.parameter.rewriteParameter(ss[1]);
    }
  }

  export class Undo implements IUndoStack<string> {
    undostack: string[];

    constructor(){
      this.undostack = [];
    }

    stack(t: string):void {
      this.undostack.push(t);
    }

    undo(): string {
      return this.undostack.pop();
    }
  }

  
  export class Field implements IField {
    mList   : Member[];
    qNum    : number;
    uStack  : Undo;

    constructor(){
      this.mList = [];
      this.qNum = 1;
      this.uStack = new Undo();
    }

    addMember(m: Member): void {this.mList.push(m);}
    resetMembers(): void {this.mList = [];}

    get Members(): Member[] {return this.mList;}
    get qNumber(): number {return this.qNum;}

    toggleSelected(id: number): void {
      for (var i = 0; i < this.mList.length; ++i) {
        if(this.mList[i].id === id){
          this.mList[i].Selected = !(this.mList[i].Selected);
        }
      };
      console.log("selected: "+this.getSelected());
    }


    getSelected(): boolean[]{
      var r: boolean[] = [];
      for (var i = 0; i < this.mList.length; ++i) {
        r.push(this.mList[i].Selected);
      }
      return r;
    }

    resetSelected(): void{
      for (var i = 0; i < this.mList.length; ++i) {
        this.mList[i].Selected = false;
      }
    }

    answerRight(): void {
      this.uStack.stack(this.to_s());
      var sList: boolean[] = this.getSelected();
      console.log("selected:" + sList);
      for (var i = 0; i < sList.length; ++i) {
        if(sList[i]){ this.mList[i].answerRight(); }
      }
      this.qNum++;
      this.resetSelected();
    }
    answerWrong(): void {
      this.uStack.stack(this.to_s());
      var sList: boolean[] = this.getSelected();
      console.log("selected:" + sList);
      for (var i = 0; i < sList.length; ++i) {
        if(sList[i]){ this.mList[i].answerWrong(); }
      }
      this.qNum++;
      this.resetSelected();
    }

    to_s(): string {
      var r: string = "";
      for (var i = 0; i < this.mList.length; ++i) {
        r = r + this.mList[i].to_s() + "/";
      }

      return r;
    }
    rewriteField(s: string): void {
      console.log(s);
      var splitted: string[] = s.split("/");
      for (var i = 0; i < splitted.length; ++i) {
        console.log(splitted[i]);
        if(splitted[i] !== ""){
          this.mList[i].rewriteMember(splitted[i]);
        }
      }
    }
    undo(): void {
      this.rewriteField(this.uStack.undo());
    }
  }
}
