(function(r) {
  "use strict";

  var modules = {
    fs:r('fs'),
    path:r('path')
  };

  var dir = {
    data: __dirname + '/../../Data/'
  }

  var data = {
    loadMotd: function(motdLocation) {
      return modules.fs.readFileSync(dir.data + motdLocation).toString('utf8');
    },
    savePlayer: function(player) {

      var playerName =  player.name;

      try {
        modules.fs.writeFileSync('./Data/' + playerName + '.json', JSON.stringify(player));

      } catch (e) {
         /* istanbul ignore else*/
        if (e.code === 'ENOENT') {
          console.log('Unable to save file')
            return 'Unable to save file';
          }

      }
    }
  };
exports.data = data;
})(require);
