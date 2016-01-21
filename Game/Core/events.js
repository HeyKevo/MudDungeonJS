(function(r) {
        "use strict";

        var modules = {
            helper: r('./helpers'),
            data: r('./data').data,
            playerSetup: {
                player: r('./PlayerSetup/player-manager')
            },
            commands: r('./commands'),
            loadPlayerLocation: r('./loadRoom'),
            world: {
                valston: r('../World/valston/prison')
            },
        };

        var events = {
            enterRoom: function(player, direction, status, playersInRoom) {
                var name = player.getName();
                var socket = player.getSocket();

                // console.log(socket)
                var pace = 'walk'; //TODO: fix walk and walks
                var dir = direction || 'load'; // prev location
                // var playerInRoomArray = playersInRoom;

                var enterMessageSelf = {
                    load: 'You have appeared',
                    enter: 'You' + ' ' + pace + ' in from the ' + dir,
                    leave: 'You' + ' ' + pace + ' ' + dir
                };

                var enterMessageOther = {
                    load: name + ' has appeared',
                    enter: name + ' ' + pace + ' in from the ' + dir,
                    leave: name + ' ' + pace + ' ' + dir
                };


                playersInRoom.forEach(function(playersInRoom) {

                    var playerName = playersInRoom.getName();
                    console.log(name + " " + playerName)
                    if (name !== playerName) {
                        var playersSocket = playersInRoom.getSocket();
                        modules.helper.helpers.send(playersSocket, enterMessageOther[status])
                    } else {
                        modules.helper.helpers.send(socket, enterMessageSelf[status])
                    }


                });

            },
            move: function(player, direction, nextRoom) {

                var socket = player.getSocket();

                var location = JSON.parse(player.getLocation());

                var region = location.region;
                var area = location.area;
                var areaId = location.areaID;
                var room = modules['world'][region][area][areaId];


               // console.log("Checking if exit exists" + room  + " " +  direction.toLowerCase().charAt(0) + " " + direction + " " + room.exits + " hard code " + room.exits.n);

                if (room.exits.hasOwnProperty(direction)) {

                        if (room.exits[direction].locked === false) {


                            events.enterRoom(player, direction, 'leave', room.players)

                            modules.playerSetup.player.playerManager.removePlayerFromRoom(socket, player, region, area, areaId);

                            var exits = events.exits(room.exits);


                                player.setLocation(exits[direction].region, exits[direction].area, exits[direction].areaID);
                                var nextRoom = modules['world'][exits[direction].region][exits[direction].area][exits[direction].areaID];
                                events.enterRoom(player, direction, 'enter', nextRoom.players)

                                socket.emit('playerLocation.loadRoom', modules.loadPlayerLocation.playerLocation.loadRoom(player, direction, 'join'));

                        } else {
                            modules.helper.helpers.send(socket, 'The exit is locked');
                            //Wait for new command
                            socket.emit('parseInput', modules.commands.commands.parseInput(pc));
                        }


                    } else {
                        modules.helper.helpers.send(socket, 'There doesn\'t seem to be an exit this way.');
                        //Wait for new command
                        socket.emit('parseInput', modules.commands.commands.parseInput(player));
                    }

                },
                look: function(socket, playerInfo, preposition, item) {

                    
                        //console.log(preposition + " " + item)

                        var name = playerInfo.getName();
                        var location = JSON.parse(playerInfo.getLocation());

                        var region = location.region;
                        var area = location.area;
                        var areaId = location.areaID;
                        var room = modules['world'][region][area][areaId];

                    if (preposition == null) {

                        var exits = events.exits(room.exits);


                        //broadcast to all that player looked around
                        modules.helper.helpers.send(socket, 'You look around');

                        modules.helper.helpers.send(socket, room.title);
                        modules.helper.helpers.send(socket, room.description);
                        modules.helper.helpers.send(socket, 'Exits: [' + exits.exits + ']');

                        var roomItems = room.items;
                        var roomItemCount = roomItems.length;
                        var displayItems = '';

                        for (var i = 0; i < roomItemCount; i++) {

                            displayItems += roomItems[i].description.room + '\r\n';

                        }

                        modules.helper.helpers.send(socket, displayItems);

                        room.players.forEach(function (playersInRoom) {

                            var playerName = playersInRoom.getName();
                            var playerSocket = playersInRoom.getSocket();
                            if (name !== playerName) {
                                modules.helper.helpers.send(socket, playerName + " is here.");
                                modules.helper.helpers.send(playerSocket, name + ' looks around')
                            }
                        });

                    }
                    else if (preposition == 'at') {
                       // console.log(room.items)
                       // console.log(item)
                        console.time('lookAt');

                        var roomItems = room.items;
                        var roomItemCount = roomItems.length;

                        var itemKeywords;
                        var itemKeywordsCount;
                        var found = false;

                        for (var i = 0; i < roomItemCount; i++) {

                            console.log(roomItems[i])

                            if(roomItems[i].hasOwnProperty('keywords') && found == false) {
                                itemKeywords = roomItems[i].keywords;
                                itemKeywordsCount = itemKeywords.length;

                                for (var j = 0; j < itemKeywordsCount; j++) {

                                    if (itemKeywords[j] == item.trim().toLowerCase()) {
                                        modules.helper.helpers.send(socket, roomItems[i].description.look);
                                        found = true;
                                        break;
                                    }

                                }
                            }



                        }

                        if (!found) {
                            modules.helper.helpers.send(socket,'Sorry you don\'t see that here');
                        }
console.timeEnd('lookAt');
                       //if(room.items.hasOwnProperty('Wooden')) {
                       //    modules.helper.helpers.send(socket, room.items[item].description.look);
                       //}
                       // else {
                       //    modules.helper.helpers.send(socket,'Sorry you don\'t see that here');
                       //}
                    }


                    },
                    exits: function(exits) {



                        var exitObj = new Object;

                        exitObj.exits = [];

                        if (exits.hasOwnProperty('North')) {
                            exitObj.exits.push('North');
                            exitObj.North = {
                                region: exits.North.location.region,
                                area: exits.North.location.area,
                                areaID: exits.North.location.areaID
                            };
                        }
                        if (exits.hasOwnProperty('East')) {
                            exitObj.exits.push('East');
                            exitObj.East = {
                                region: exits.East.location.region,
                                area: exits.East.location.area,
                                areaID: exits.East.location.areaID
                            };
                        }
                        if (exits.hasOwnProperty('South')) {
                            exitObj.exits.push('South');
                            exitObj.South = {
                                region: exits.South.location.region,
                                area: exits.South.location.area,
                                areaID: exits.South.location.areaID
                            };
                        }
                        if (exits.hasOwnProperty('West')) {
                            exitObj.exits.push('West');
                            exitObj.West = {
                                region: exits.West.location.region,
                                area: exits.West.location.area,
                                areaID: exits.West.location.areaID
                            };
                        }




                        return exitObj;

                    },
                    score: function(socket, player) {
                            console.time('Score')
                    var scoreSheet =  modules.data.loadFile(null, 'score');


                    var name = player.getName();
                    var desc = player.getDescription();
                    var Class = player.getClass();
                    var race = player.getRace();
                    var age = player.getAge();
                    var level = player.getLevel();
                    var info = player.getPlayerInfo();

                    function pad(value, length, position) {

                        if (position == 'left') {
                            try {
                                return (value.toString().length < length) ? pad(" " + value, length, 'left') : value;
                            }
                            catch (e) {
                                console.log(e)
                            }
                        } else if (position == 'right') {
                            try {
                                return (value.toString().length < length) ? pad(value + " ", length, 'right') : value;
                            }
                            catch (e) {
                                console.log(e)
                            }
                        }
                    }




                    var data = {
                       pName: name,
                       pDesc: desc,
                       pClass: pad(Class, 10, 'right'),
                       pRace: pad(race, 10, 'right'),
                        pSex: pad(info.sex, 10, 'right'),
                       pAge: pad(age,10, 'right'),
                        pHP: pad(info.information.hitpoints, 5, 'left'),
                        HPMax: pad(info.information.maxHitpoints, 5, 'right'),
                        pMana: pad(info.information.mana, 5, 'left'),
                        ManaMax: pad(info.information.maxMana, 5, 'right'),
                        pMoves: pad(info.information.moves,5,'left'),
                        MovesMax: pad(info.information.maxMoves, 5, 'right'),
                       pLevel: pad(level, 10, 'right'),
                       pAlign:  pad(info.information.alignment,12, 'right'),
                        pTNL: pad(info.information.experienceToNextLevel, 11, 'left'),
                       pStr: pad(info.information.stats.strength, 3, 'left'),
                       StrMax: pad(info.information.stats.strength, 3, 'right'),
                       pDex: pad(info.information.stats.dexterity, 3, 'left'),
                       dexMax: pad(info.information.stats.dexterity, 3, 'right'),
                       pCon: pad(info.information.stats.constitution, 3, 'left'),
                       conMax: pad(info.information.stats.constitution, 3, 'right'),
                       pInt: pad(info.information.stats.intelligence, 3, 'left'),
                       intMax: pad(info.information.stats.intelligence, 3, 'right'),
                       pWis: pad(info.information.stats.wisdom, 3, 'left'),
                       wisMax: pad(info.information.stats.wisdom, 3, 'right'),
                       pCha: pad(info.information.stats.charisma, 3, 'left'),
                       chaMax: pad(info.information.stats.charisma, 3, 'right'),
                        pGold: pad(info.gold, 11 , 'left'),
                        pSilver: pad(info.silver, 11 , 'left'),
                        pCopper: pad(info.copper, 11 , 'left'),
                        pExplore: pad(info.explored,5, 'left'),
                        pHitRoll: pad(info.hitroll, 5, 'left'),
                        pDamRoll: pad(info.damroll, 5, 'left'),
                        pHours: pad(info.hours, 12, 'left'),
                        pMkills: pad(info.mkills, 5, 'left'),
                        pMDeaths: pad(info.mDeaths, 5, 'left'),
                        pWeight: pad(info.weight, 3, 'left'),
                        maxWeight: pad(info.maxWeight, 3, 'right'),
                        pStatus: pad(info.status, 12, 'right'),
                        pWimpy: pad(info.wimpy, 12, 'right'),
                        pPKills:  pad(info.pkKills, 5, 'left'),
                        pPKDeaths:  pad(info.pkKills, 5, 'left'),
                        pDeaths:  pad(info.pkDeaths, 5, 'left'),
                        pPKPoints: pad(info.pkPoints, 5, 'left'),
                    };

                    scoreSheet = scoreSheet.replace(/(pName)|(pDesc)|(pAge)|(pWeight)|(maxWeight)|(pStatus)|(pHP)|(HPMax)|(pMana)|(ManaMax)|(pHours)|(pMkills)|(pMDeaths)|(pHitRoll)|(pDamRoll)|(pWimpy)|(pMoves)|(MovesMax)|(pTNL)|(pExplore)|(pSex)|(pGold)|(pCopper)|(pSilver)|(pClass)|(pRace)|(pLevel)|(pAlign)|(pPKills)|(pPKDeaths)|(pPKPoints)|(pStr)|(StrMax)|(pDex)|(dexMax)|(pCon)|(conMax)|(pInt)|(intMax)|(pWis)|(wisMax)|(pCha)|(chaMax)/g, function(matched){

                          return data[matched];
                        });
console.timeEnd('Score')

                  /// http://stackoverflow.com/questions/15604140/replace-multiple-strings-with-multiple-other-strings scoreSheet.replace("#desc#", description);

                    modules.helper.helpers.send(socket, scoreSheet);


                }

            };
            exports.events = events;
        })(require);
