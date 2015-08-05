.import QtQuick.LocalStorage 2.0 as LS

function save(grid, diff, level){
    var str=""
    for(var i=0; i<grid.count; i++){
        var state=grid.get(i).myEstate
        if(state==="void")
            str+="0"
        else if(state==="full")
            str+="1"
        else
            str+="2"
    }
    setSave(diff, level, str)
}
function setParameter(param, value){
    var db = getDatabase();
    var ret = false;
    db.transaction(function(tx) {
        var rs = tx.executeSql('INSERT OR REPLACE INTO tsettings VALUES (?, ?);', [param, value]);
        if (rs.rowsAffected > 0) {
            ret = true;
        }
        else {
            ret = false;
        }
    }
    );
    return ret;
}
function getParameter(param){
    var db = getDatabase();
    var ret = -1;
    db.transaction(function(tx) {
        var rs = tx.executeSql('SELECT value FROM tsettings WHERE (param=?);', [param]);

        if (rs.rows.length > 0) {
            ret = rs.rows.item(0).value;
        } else {
            ret = -1;
        }
    })
    return ret;
}

function getDatabase() {
    return LS.LocalStorage.openDatabaseSync("Picross", "1.0", "StorageDatabase", 100000);
}

function initialize() {
    var db = getDatabase();
    db.transaction(
                function(tx) {
                    tx.executeSql('CREATE TABLE IF NOT EXISTS tcompleted(diff INT, level INT,isCompleted BOOLEAN, PRIMARY KEY(diff, level))');
                    tx.executeSql('CREATE TABLE IF NOT EXISTS tsave(diff INT, level INT, save TEXT, PRIMARY KEY(diff, level))');
                    tx.executeSql('CREATE TABLE IF NOT EXISTS tsettings(param TEXT, value INT, PRIMARY KEY(param))');
                    tx.executeSql('INSERT OR IGNORE INTO tsettings(param , value) VALUES (\'autoLoadSave\', 1), (\'space\', 5) ');
                });
}
function initializeSaves() {
    var db = getDatabase();
    db.transaction(
                function(tx) {
                    tx.executeSql('CREATE TABLE IF NOT EXISTS tsave(diff INT, level INT, save TEXT, PRIMARY KEY(diff, level))');
                });
}
function setIsCompleted(diff, level, isCompleted) {
    var db = getDatabase();
    var ret = false;
    db.transaction(function(tx) {
        var rs = tx.executeSql('INSERT OR REPLACE INTO tcompleted VALUES (?, ?, ?);', [diff, level, isCompleted]);
        if (rs.rowsAffected > 0) {
            ret = true;
        }
        else {
            ret = false;
        }
    }
    );
    return ret;
}
function setSave(diff, level, save) {
    var db = getDatabase();
    var ret = false;
    db.transaction(function(tx) {
        var rs = tx.executeSql('INSERT OR REPLACE INTO tsave VALUES (?, ?, ?);', [diff, level, save]);
        if (rs.rowsAffected > 0) {
            ret = true;
        }
        else {
            ret = false;
        }
    }
    );
    return ret;
}

function isCompleted(diff, level) {
    var db = getDatabase();
    var ret = true;
    db.transaction(function(tx) {
        var rs = tx.executeSql('SELECT isCompleted FROM tcompleted WHERE (diff=? AND level=?);', [diff, level]);
        if (rs.rows.length > 0) {
            ret = true;
        } else {
            ret = false;
        }
    })
    return ret;
}

function eraseSave(diff, level){
    var db = getDatabase();
    var ret = true;
    db.transaction(function(tx) {
        var rs = tx.executeSql('DELETE FROM tsave WHERE (diff=? AND level=?);', [diff, level]);
        if (rs.rows.length > 0) {
            ret = true;
        } else {
            ret = false;
        }
    })
    return ret;
}

function getNbCompletedLevel(diff){
    var db = getDatabase();
    var ret = 0;
    db.transaction(function(tx) {
        var rs = tx.executeSql('SELECT COUNT(*) AS myCount FROM tcompleted WHERE (diff=? AND isCompleted=\'true\');', [diff]);
        if (rs.rows.length > 0) {
            ret = rs.rows.item(0).myCount;
        } else {
            ret = 0;
        }
    })
    return ret;
}


function getSave(diff, level) {
    var db = getDatabase();
    var ret = "";
    db.transaction(function(tx) {
        var rs = tx.executeSql('SELECT save FROM tsave WHERE (diff=? AND level=?);', [diff, level]);

        if (rs.rows.length > 0) {
            ret = rs.rows.item(0).save;
        } else {
            ret = "";
        }
    })
    return ret;
}

function destroyData() {
    var db = getDatabase();
    db.transaction(function(tx) {
        var rs = tx.executeSql('DROP TABLE tsave');
        rs = rs && tx.executeSql('DROP TABLE tcompleted');
    });
}
function destroySaves() {
    var db = getDatabase();
    db.transaction(function(tx) {
        var rs = tx.executeSql('DROP TABLE tsave');
    });
}
function destroySettings(){
    var db = getDatabase();
    db.transaction(function(tx) {
        var rs = tx.executeSql('DROP TABLE tsettings');
    });
    initialize()
}
