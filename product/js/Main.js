//各種Interfaceの定義
var SevenThree;
(function (SevenThree) {
    var Model;
    (function (Model) {
        //参加者の状態を表すEnumの定義
        (function (State) {
            State[State["Lose"] = 0] = "Lose";
            State[State["Normal"] = 1] = "Normal";
            State[State["Win"] = 2] = "Win";
        })(Model.State || (Model.State = {}));
        var State = Model.State;
        ;
    })(Model = SevenThree.Model || (SevenThree.Model = {}));
})(SevenThree || (SevenThree = {}));
///<reference path='Quiz.ts'/>
var SevenThree;
(function (SevenThree) {
    var Model;
    (function (Model) {
        //パラメーター
        var Parameter = (function () {
            function Parameter() {
                this.right = 0;
                this.misses = 0;
                this.state = Model.State.Normal;
            }
            Object.defineProperty(Parameter.prototype, "Right", {
                //アクセサ．
                get: function () { return this.right; },
                //setアクセサの中で，勝ち抜けや失格の条件をもう定義しておく．
                //7○3×などの大抵のルールでは，
                //参加者の勝ち抜けや失格はその参加者のポイントだけに依存するので，
                //こっちで処理しています．
                //ただし，(ときどきある)そうでない場合は考えなおす必要がありますが．
                set: function (n) {
                    this.right = n;
                    if (this.right >= 7) {
                        this.state = Model.State.Win;
                    }
                    else {
                        this.state = Model.State.Normal;
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Parameter.prototype, "Misses", {
                get: function () { return this.misses; },
                set: function (n) {
                    this.misses = n;
                    if (this.misses >= 3) {
                        this.state = Model.State.Lose;
                    }
                    else {
                        this.state = Model.State.Normal;
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Parameter.prototype, "State", {
                get: function () { return this.state; },
                enumerable: true,
                configurable: true
            });
            //以下2つのメソッドはUndo用です．
            //Undo用のスタックは，得点状況を文字列化して積んでおきます．
            //文字列化(to_s)と，文字列を受け取って変数を更新する(rewrite〜〜)を定義してます．
            Parameter.prototype.to_s = function () {
                //「正解数,誤答数,状態」という文字列に変換
                return this.right + "," + this.misses + "," + this.state;
            };
            Parameter.prototype.rewriteParameter = function (s) {
                var array = s.split(",");
                this.right = parseInt(array[0]);
                this.misses = parseInt(array[1]);
                this.state = parseInt(array[2]);
            };
            return Parameter;
        })();
        Model.Parameter = Parameter;
        //参加者を表すクラス
        var Member = (function () {
            function Member(name, id) {
                this.id = id;
                this.name = name;
                this.parameter = new Parameter();
                this.isSelected = false;
            }
            Object.defineProperty(Member.prototype, "Selected", {
                //ここはアクセサでなくてもいい気がします．
                get: function () { return this.isSelected; },
                set: function (flag) { this.isSelected = flag; },
                enumerable: true,
                configurable: true
            });
            //正解数を取得
            Member.prototype.getRight = function () { return this.parameter.Right; };
            //誤答数を取得
            Member.prototype.getMisses = function () { return this.parameter.Misses; };
            //状態を取得
            Member.prototype.getState = function () { return this.parameter.State; };
            //正解時．Parameterでのアクセサ定義の中で，勝ち抜け・失格も実装してあるので，
            //ここは単に+1するだけでOK．
            Member.prototype.answerRight = function () {
                this.parameter.Right = this.parameter.Right + 1;
            };
            //誤答時
            Member.prototype.answerWrong = function () {
                this.parameter.Misses = this.parameter.Misses + 1;
            };
            Member.prototype.to_s = function () {
                //「ID:(parameter#to_sの結果)」という形に変換．
                //こうして再帰的にto_sを呼び出しています．
                return this.id + ":" + this.parameter.to_s();
            };
            Member.prototype.rewriteMember = function (s) {
                var ss = s.split(":");
                this.id = parseInt(ss[0]);
                this.parameter.rewriteParameter(ss[1]);
            };
            return Member;
        })();
        Model.Member = Member;
        //Undo用のスタック．ここは素直．
        var Undo = (function () {
            function Undo() {
                this.undostack = [];
            }
            Undo.prototype.stack = function (t) {
                this.undostack.push(t);
            };
            Undo.prototype.undo = function () {
                return this.undostack.pop();
            };
            return Undo;
        })();
        Model.Undo = Undo;
        //得点状況
        var Field = (function () {
            function Field() {
                this.mList = [];
                this.qNum = 1;
                this.uStack = new Undo();
            }
            //参加者の追加
            Field.prototype.addMember = function (m) { this.mList.push(m); };
            //参加者をリセット
            Field.prototype.resetMembers = function () { this.mList = []; };
            Object.defineProperty(Field.prototype, "Members", {
                //参加者リストを取得
                get: function () { return this.mList; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Field.prototype, "qNumber", {
                //問題番号を取得
                get: function () { return this.qNum; },
                enumerable: true,
                configurable: true
            });
            //idで指定された参加者の選択状態をトグルする
            Field.prototype.toggleSelected = function (id) {
                for (var i = 0; i < this.mList.length; ++i) {
                    if (this.mList[i].id === id) {
                        this.mList[i].Selected = !(this.mList[i].Selected);
                    }
                }
                ;
                console.log("selected: " + this.getSelected());
            };
            //各参加者の選択状態を取得する．
            //選択状態は排他的にはしていません．
            //ボードクイズなどにも対応可能にするためです．
            Field.prototype.getSelected = function () {
                var r = [];
                for (var i = 0; i < this.mList.length; ++i) {
                    r.push(this.mList[i].Selected);
                }
                return r;
            };
            //全参加者の選択状態をリセット
            Field.prototype.resetSelected = function () {
                for (var i = 0; i < this.mList.length; ++i) {
                    this.mList[i].Selected = false;
                }
            };
            //選択状態にあるプレーヤーが正解した場合の挙動
            Field.prototype.answerRight = function () {
                this.uStack.stack(this.to_s());
                var sList = this.getSelected();
                for (var i = 0; i < sList.length; ++i) {
                    if (sList[i]) {
                        this.mList[i].answerRight();
                    }
                }
                this.qNum++;
                this.resetSelected();
            };
            //選択状態にあるプレーヤーが誤答した場合の挙動
            Field.prototype.answerWrong = function () {
                this.uStack.stack(this.to_s());
                var sList = this.getSelected();
                for (var i = 0; i < sList.length; ++i) {
                    if (sList[i]) {
                        this.mList[i].answerWrong();
                    }
                }
                this.qNum++;
                this.resetSelected();
            };
            Field.prototype.to_s = function () {
                //各参加者のMember#to_sの結果をスラッシュでつないでいます．
                var r = "";
                for (var i = 0; i < this.mList.length; ++i) {
                    r = r + this.mList[i].to_s() + "/";
                }
                return r;
            };
            Field.prototype.rewriteField = function (s) {
                console.log(s);
                var splitted = s.split("/");
                for (var i = 0; i < splitted.length; ++i) {
                    console.log(splitted[i]);
                    if (splitted[i] !== "") {
                        this.mList[i].rewriteMember(splitted[i]);
                    }
                }
            };
            //Undo
            Field.prototype.undo = function () {
                this.rewriteField(this.uStack.undo());
            };
            return Field;
        })();
        Model.Field = Field;
    })(Model = SevenThree.Model || (SevenThree.Model = {}));
})(SevenThree || (SevenThree = {}));
///<reference path="../typings/angularjs/angular.d.ts" />
///<reference path="./Quiz.ts" />
///<reference path="./Model.ts" />
var SevenThree;
(function (SevenThree) {
    //画面状態．
    (function (Mode) {
        Mode[Mode["Input"] = 0] = "Input";
        Mode[Mode["Playing"] = 1] = "Playing"; //プレー画面
    })(SevenThree.Mode || (SevenThree.Mode = {}));
    var Mode = SevenThree.Mode;
    var Member = SevenThree.Model.Member;
    var Controller = (function () {
        function Controller($scope, field) {
            this.$scope = $scope;
            this.field = field;
            this.$scope.qNumber = this.field.qNumber;
            this.$scope.memberList = this.field.Members;
            this.$scope.tempMems = [new Member("a", 1), new Member("b", 2)];
            this.$scope.addMemberTemporally = this.addMemberTemporally.bind(this);
            this.$scope.confirmMembers = this.confirmMembers.bind(this);
            this.$scope.toggleSelected = this.toggleSelected.bind(this);
            this.$scope.onKeyDown = this.onKeyDown.bind(this);
            this.$scope.mode = Mode.Input;
            console.log(this.$scope.mode);
        }
        //入力画面では，Confirm membersを押さない限り参加者登録されません．
        //参加者のリストを一度保存しておきます．
        Controller.prototype.addMemberTemporally = function () {
            var byLine = this.$scope.inputText.split("\n");
            for (var i = 0; i < byLine.length; ++i) {
                var spTxt = byLine[i].split(",");
                var m = new Member(spTxt[1], parseInt(spTxt[0]));
                this.$scope.tempMems.push(m);
            }
        };
        //仮登録した参加者をすべて削除
        Controller.prototype.deleteAllMembers = function () {
            this.$scope.tempMems = [];
        };
        //参加者を正式に登録する．
        Controller.prototype.confirmMembers = function () {
            this.field.resetMembers();
            for (var i = 0; i < this.$scope.tempMems.length; ++i) {
                this.field.addMember(this.$scope.tempMems[i]);
            }
            this.$scope.qNumber = this.field.qNumber;
            this.$scope.memberList = this.field.Members;
        };
        Controller.prototype.toggleSelected = function (member) {
            console.log(member.id);
            this.field.toggleSelected(member.id);
            this.$scope.qNumber = this.field.qNumber;
            this.$scope.memberList = this.field.Members;
        };
        //キーが押されたときの挙動
        Controller.prototype.onKeyDown = function (e) {
            switch (e.which) {
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
        };
        return Controller;
    })();
    SevenThree.Controller = Controller;
})(SevenThree || (SevenThree = {}));
///<reference path="../typings/angularjs/angular.d.ts" />
///<reference path='Quiz.ts'/>
///<reference path='Model.ts'/>
///<reference path='Controller.ts' />
var SevenThree;
(function (SevenThree) {
    angular.module("seventhree", [])
        .service("field", SevenThree.Model.Field)
        .controller("fieldcontroller", SevenThree.Controller);
})(SevenThree || (SevenThree = {}));
