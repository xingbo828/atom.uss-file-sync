var File = require('atom').File;
var spawn = require('child_process').spawn;

module.exports = function() {
  /*
    Private methods
  */
  var _exec = function(shellScriptPath, arg) {
    var sync;
    if(!!arg){
      sync = spawn(shellScriptPath, [arg]);
    } else {
      sync = spawn(shellScriptPath);
    }
    sync.stdout.on('data', function(data) {
      atom.notifications.addSuccess('', {
        detail: data
      });
    });
    sync.on('error', function(err) {
      atom.notifications.addError('Error: ' + err.code, {
        detail: err
      });
    });
  };
  var _syncFile = function() {
    var editor = atom.workspace.getActiveTextEditor();
    var filePath = editor.getPath();
    var searchPhrase = atom.config.get("uss-file-sync.uss_local_env_path") + '/workspace/';
    if (filePath.indexOf(searchPhrase) !== -1) {
      var relative_file_path_array = filePath.split(searchPhrase);
      var relative_file_path = relative_file_path_array[1];
      if(atom.config.get("uss-file-sync.script_type") === "shell"){
        _exec(atom.config.get("uss-file-sync.uss_local_env_path") + '/scripts/copy-docroot-file.sh', relative_file_path);
      } else if(atom.config.get("uss-file-sync.script_type") === "python"){
        _exec(atom.config.get("uss-file-sync.uss_local_env_path") + '/scripts/copy-docroot-direct.py', relative_file_path);
      } else {
        atom.notifications.addError('Error: Missing config:script_type', {
          detail: "Please set your script_type to either 'shell' or 'python'"
        });
      }

    }
  };

  var _syncAllFiles = function() {
    if(atom.config.get("uss-file-sync.script_type") === "shell"){
      _exec(atom.config.get("uss-file-sync.uss_local_env_path") + '/scripts/sync-docroot.sh');
    } else if(atom.config.get("uss-file-sync.script_type") === "python"){
      _exec(atom.config.get("uss-file-sync.uss_local_env_path") + '/scripts/sync-docroot.py');
    } else {
      atom.notifications.addError('Error: Missing config:script_type', {
        detail: "Please set your script_type to either 'shell' or 'python'"
      });
    }
  };

  return {
    config: {
      uss_local_env_path: {
        type: "string",
        default: '/data/source/uss-local-environment'
      },
      script_type: {
        type: "string",
        default: 'shell'
      }
    },
    activate: function() {
      atom.commands.add('atom-workspace', "uss-file-sync:uss-sync-all", _syncAllFiles);
      atom.packages.onDidActivateInitialPackages(function() {
        atom.workspace.observeTextEditors(function(editor) {
          editor.onDidSave(function() {
            _syncFile();
          });
        });
      });
    }
  };
}();
