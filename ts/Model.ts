///<reference path='Quiz.ts'/>

module SevenThree.Model {
    //パラメーター
    export class Parameter implements IParameter {
	//正解数
	right  : number;
	//誤答数
	misses : number;
	//状態
	state  : State;

	constructor() {
	    this.right  = 0;
	    this.misses = 0;
	    this.state  = State.Normal;
	}
	//アクセサ．
	get Right(): number {return this.right;}
	get Misses(): number {return this.misses;}
	get State(): State {return this.state;}

	//setアクセサの中で，勝ち抜けや失格の条件をもう定義しておく．
	//7○3×などの大抵のルールでは，
	//参加者の勝ち抜けや失格はその参加者のポイントだけに依存するので，
	//こっちで処理しています．
	//ただし，(ときどきある)そうでない場合は考えなおす必要がありますが．
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
	//以下2つのメソッドはUndo用です．
	//Undo用のスタックは，得点状況を文字列化して積んでおきます．
	//文字列化(to_s)と，文字列を受け取って変数を更新する(rewrite〜〜)を定義してます．
	to_s(): string {
	    //「正解数,誤答数,状態」という文字列に変換
	    return this.right + "," + this.misses + "," + this.state;
	}

	rewriteParameter(s: string): void {
	    var array: string[] = s.split(",");
	    this.right  = parseInt(array[0]);
	    this.misses = parseInt(array[1]);
	    this.state  = parseInt(array[2]);
	}
    }
    //参加者を表すクラス
    export class Member implements IMember {
	id         : number;
	name       : string;
	//パラメーター
	parameter  : Parameter;
	//選択状態
	isSelected : boolean;

	constructor(name: string, id: number) {
	    this.id   = id;
	    this.name = name;
	    this.parameter = new Parameter();
	    this.isSelected = false;
	}
	//ここはアクセサでなくてもいい気がします．
	get Selected(): boolean {return this.isSelected;}

	set Selected(flag: boolean) {this.isSelected = flag;}

	//正解数を取得
	getRight(): number {return this.parameter.Right;}
	//誤答数を取得
	getMisses(): number {return this.parameter.Misses;}
	//状態を取得
	getState(): State {return this.parameter.State;}

	//正解時．Parameterでのアクセサ定義の中で，勝ち抜け・失格も実装してあるので，
	//ここは単に+1するだけでOK．
	answerRight(): void {
	    this.parameter.Right = this.parameter.Right + 1;
	}
	//誤答時
	answerWrong(): void {
	    this.parameter.Misses = this.parameter.Misses + 1;
	}

	to_s(): string {
	    //「ID:(parameter#to_sの結果)」という形に変換．
	    //こうして再帰的にto_sを呼び出しています．
	    return this.id + ":" + this.parameter.to_s();
	}

	rewriteMember(s: string): void {
	    var ss = s.split(":");
	    this.id = parseInt(ss[0]);
	    this.parameter.rewriteParameter(ss[1]);
	}
    }
    //Undo用のスタック．ここは素直．
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
    //得点状況
    export class Field implements IField {
	//各参加者
	mList   : Member[];
	//問題番号
	qNum    : number;
	uStack  : Undo;

	constructor(){
	    this.mList = [];
	    this.qNum = 1;
	    this.uStack = new Undo();
	}
	//参加者の追加
	addMember(m: Member): void {this.mList.push(m);}
	//参加者をリセット
	resetMembers(): void {this.mList = [];}

	//参加者リストを取得
	get Members(): Member[] {return this.mList;}
	//問題番号を取得
	get qNumber(): number {return this.qNum;}

	//idで指定された参加者の選択状態をトグルする
	toggleSelected(id: number): void {
	    for (var i = 0; i < this.mList.length; ++i) {
		if(this.mList[i].id === id){
		    this.mList[i].Selected = !(this.mList[i].Selected);
		}
	    };
	    console.log("selected: "+this.getSelected());
	}
	//各参加者の選択状態を取得する．
	//選択状態は排他的にはしていません．
	//ボードクイズなどにも対応可能にするためです．
	getSelected(): boolean[]{
	    var r: boolean[] = [];
	    for (var i = 0; i < this.mList.length; ++i) {
		r.push(this.mList[i].Selected);
	    }
	    return r;
	}
	//全参加者の選択状態をリセット
	resetSelected(): void{
	    for (var i = 0; i < this.mList.length; ++i) {
		this.mList[i].Selected = false;
	    }
	}
	//選択状態にあるプレーヤーが正解した場合の挙動
	answerRight(): void {
	    this.uStack.stack(this.to_s());
	    var sList: boolean[] = this.getSelected();
	    for (var i = 0; i < sList.length; ++i) {
		if(sList[i]){ this.mList[i].answerRight(); }
	    }
	    this.qNum++;
	    this.resetSelected();
	}
	//選択状態にあるプレーヤーが誤答した場合の挙動
	answerWrong(): void {
	    this.uStack.stack(this.to_s());
	    var sList: boolean[] = this.getSelected();
	    for (var i = 0; i < sList.length; ++i) {
		if(sList[i]){ this.mList[i].answerWrong(); }
	    }
	    this.qNum++;
	    this.resetSelected();
	}

	to_s(): string {
	    //各参加者のMember#to_sの結果をスラッシュでつないでいます．
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
	//Undo
	undo(): void {
	    this.rewriteField(this.uStack.undo());
	}
    }
}
