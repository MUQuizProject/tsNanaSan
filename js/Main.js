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
        var Parameter = (function () {
            function Parameter() {
                this.right = 0;
                this.misses = 0;
                this.state = 1 /* Normal */;
            }
            Object.defineProperty(Parameter.prototype, "Right", {
                get: function () {
                    return this.right;
                },
                set: function (n) {
                    this.right = n;
                    if (this.right >= 7) {
                        this.state = 2 /* Win */;
                    }
                    else {
                        this.state = 1 /* Normal */;
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Parameter.prototype, "Misses", {
                get: function () {
                    return this.misses;
                },
                set: function (n) {
                    this.misses = n;
                    if (this.misses >= 3) {
                        this.state = 0 /* Lose */;
                    }
                    else {
                        this.state = 1 /* Normal */;
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Parameter.prototype, "State", {
                get: function () {
                    return this.state;
                },
                enumerable: true,
                configurable: true
            });
            Parameter.prototype.to_s = function () {
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
        var Member = (function () {
            function Member(name, id) {
                this.id = id;
                this.name = name;
                this.parameter = new Parameter();
                this.isSelected = false;
            }
            Object.defineProperty(Member.prototype, "Selected", {
                get: function () {
                    return this.isSelected;
                },
                set: function (flag) {
                    this.isSelected = flag;
                },
                enumerable: true,
                configurable: true
            });
            Member.prototype.getRight = function () {
                return this.parameter.Right;
            };
            Member.prototype.getMisses = function () {
                return this.parameter.Misses;
            };
            Member.prototype.getState = function () {
                return this.parameter.State;
            };
            Member.prototype.to_s = function () {
                return this.id + ":" + this.parameter.to_s();
            };
            Member.prototype.answerRight = function () {
                this.parameter.Right = this.parameter.Right + 1;
            };
            Member.prototype.answerWrong = function () {
                this.parameter.Misses = this.parameter.Misses + 1;
            };
            Member.prototype.rewriteMember = function (s) {
                var ss = s.split(":");
                this.id = parseInt(ss[0]);
                this.parameter.rewriteParameter(ss[1]);
            };
            return Member;
        })();
        Model.Member = Member;
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
        var Field = (function () {
            function Field() {
                this.mList = [];
                this.qNum = 1;
                this.uStack = new Undo();
            }
            Field.prototype.addMember = function (m) {
                this.mList.push(m);
            };
            Field.prototype.resetMembers = function () {
                this.mList = [];
            };
            Object.defineProperty(Field.prototype, "Members", {
                get: function () {
                    return this.mList;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Field.prototype, "qNumber", {
                get: function () {
                    return this.qNum;
                },
                enumerable: true,
                configurable: true
            });
            Field.prototype.toggleSelected = function (id) {
                for (var i = 0; i < this.mList.length; ++i) {
                    if (this.mList[i].id === id) {
                        this.mList[i].Selected = !(this.mList[i].Selected);
                    }
                }
                ;
                console.log("selected: " + this.getSelected());
            };
            Field.prototype.getSelected = function () {
                var r = [];
                for (var i = 0; i < this.mList.length; ++i) {
                    r.push(this.mList[i].Selected);
                }
                return r;
            };
            Field.prototype.resetSelected = function () {
                for (var i = 0; i < this.mList.length; ++i) {
                    this.mList[i].Selected = false;
                }
            };
            Field.prototype.answerRight = function () {
                this.uStack.stack(this.to_s());
                var sList = this.getSelected();
                console.log("selected:" + sList);
                for (var i = 0; i < sList.length; ++i) {
                    if (sList[i]) {
                        this.mList[i].answerRight();
                    }
                }
                this.qNum++;
                this.resetSelected();
            };
            Field.prototype.answerWrong = function () {
                this.uStack.stack(this.to_s());
                var sList = this.getSelected();
                console.log("selected:" + sList);
                for (var i = 0; i < sList.length; ++i) {
                    if (sList[i]) {
                        this.mList[i].answerWrong();
                    }
                }
                this.qNum++;
                this.resetSelected();
            };
            Field.prototype.to_s = function () {
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
    (function (Mode) {
        Mode[Mode["Input"] = 0] = "Input";
        Mode[Mode["Playing"] = 1] = "Playing";
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
            this.$scope.mode = 0 /* Input */;
            console.log(this.$scope.mode);
        }
        Controller.prototype.addMemberTemporally = function () {
            var byLine = this.$scope.inputText.split("\n");
            for (var i = 0; i < byLine.length; ++i) {
                var spTxt = byLine[i].split(",");
                var m = new Member(spTxt[1], parseInt(spTxt[0]));
                this.$scope.tempMems.push(m);
            }
        };
        Controller.prototype.deleteAllMembers = function () {
            this.$scope.tempMems = [];
        };
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
        Controller.prototype.onKeyDown = function () {
            switch (event.keyCode) {
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
    angular.module("seventhree", []).service("field", SevenThree.Model.Field).controller("fieldcontroller", SevenThree.Controller);
})(SevenThree || (SevenThree = {}));
