module SevenThree.Model {
	//参加者の状態を表すEnumの定義
	export enum State {
		Lose,
		Normal,
		Win,
	};

	export interface IUndoStack<T> {
		undostack: T[];
		stack(t:T): void;
		undo(): T;
	}

	export interface IParameter {
		right : number;
    misses: number;
    state : State;

    to_s()                      : string;
    rewriteParameter(s: string) : void;
	}

	export interface IMember {
		id        : number;
		parameter : IParameter;
		isSelected: boolean;

		to_s()                       : string;
		rewriteMember(s: string)     : void;
	}

	export interface IField {
		mList   : IMember[];
		qNum    : number;
		uStack  : IUndoStack<string>;

		addMember(m: IMember)  : void;
		getSelected()          : boolean[];
		resetSelected()        : void;
		answerRight()          : void;
		answerWrong()          : void;
		to_s()                 : string;
		rewriteField(s: string): void;
		undo()                 : void;
	}
}
