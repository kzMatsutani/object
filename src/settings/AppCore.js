var appCore = (function () {
  function AppCore() {
    this._init();
  }

  AppCore.prototype._init = function () {
    console.log("初期化");
    this.event_list = {};
  }

  AppCore.prototype.addEvent = function (event_name, func_obj) {
    if (event_name != "" && func_obj != null) {
      if (this.event_list[event_name] == null) {
        this.event_list[event_name] = [];
      }
      var chk_flg = false;
      for (var i = 0; i < this.event_list[event_name].length; i++) {
        if (this.event_list[event_name][i] == func_obj) {
          // console.log("同一イベントです")
          chk_flg = true;
          break;
        }
      }
      if (chk_flg == false) {
        // console.log(`イベントリスナーを${event_name}を登録しました`)
        this.event_list[event_name].push(func_obj);
      }
    }
  }

  AppCore.prototype.executeEvent = function (event_name) {
    if (this.event_list[event_name] != null) {
      // console.log("イベントを実行します");
      for (var i = 0; i < this.event_list[event_name].length; i++) {
        this.event_list[event_name][i](this);
      }
    }
  }

  AppCore.prototype.removeEvent = function (event_name, func_obj) {
    if (this.event_list[event_name] != null) {
      for (var i = 0; i < this.event_list[event_name].length; i++) {
        if (this.event_list[event_name][i] == func_obj) {
          // console.log("イベントを削除します");
          this.event_list[event_name].splice(i);
        }
      }
    }
  }

  var instance;

  var _static = {
    name: 'AppCore',
    // インスタンスを取得するメソッド
    // シングルトンオブジェクトのインスタンスを返す。
    getInstance: function () {
      if (instance === undefined) {
        instance = new AppCore();
      }
      return instance;
    }
  };
  return _static;
})();


export default appCore;