var CompositeDisposable = require('atom').CompositeDisposable;
var File = require('atom').File;
var exec = require('child_process').exec;

/*
  Private methods
*/
var _exec = function(shellScriptPath){
  atom.notifications.addInfo('Preparing to sync...', {
    dismissable: false
  });
  exec(shellScriptPath, function (error, stdout, stderr) {
    atom.notifications.addSuccess('', {
      detail: stdout
    });
    if (error !== null) {
      atom.notifications.addError('Error', {
        detail: error
      });
    }
  });
};
var _syncFile = function(){
  var editor = atom.workspace.getActiveTextEditor();
  var filePath = editor.getPath();
  var searchPhrase = atom.config.get("uss-file-sync.uss_local_env_path") + '/workspace/';
  if(filePath.indexOf(searchPhrase) !== -1){
    var relative_file_path_array = filePath.split(searchPhrase);
    var relative_file_path = relative_file_path_array[1];
    _exec(atom.config.get("uss-file-sync.uss_local_env_path") +'/scripts/copy-docroot-file.sh ' + relative_file_path);
  }
};

var _syncAllFiles = function(){
  _exec(atom.config.get("uss-file-sync.uss_local_env_path") +'/scripts/sync-docroot.sh');
};
module.exports = {
  config : {
    uss_local_env_path:{
      type:"string",
      default:'/data/source/uss-local-environment'
    }

  },
  activate: function() {
    atom.commands.add('atom-workspace', "uss-file-sync:uss-sync-all", _syncAllFiles);
    atom.packages.onDidActivateInitialPackages(function(){
      console.log('test');
      atom.workspace.observeTextEditors(function(editor){
        editor.onDidSave(function(){
          _syncFile();
        });
      });
    });
  }

};
