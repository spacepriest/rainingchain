//12/13/2014 8:02 PM
/*jslint node: true, undef:true, sub:true, asi:true, funcscope:true, forin:true, unused:false*//*global True, False, loadAPI*/
/*Go to http://jshint.com/ and copy paste your code to spot syntax errors.*/

'use strict';
var s = loadAPI('v1.0','QkillTheDragon',{
	name:"Kill The Dragon",
	author:"rc"
});
var m = s.map; var b = s.boss; var g;

/* COMMENT:
Talk with NPC who ask to kill Dragon. 
Activate switch to destroy rocks blocking path.
Kill Dragon. 
Talk NPC to complete quest.
*/

s.newVariable({
	haveKilledDragon:false,
	haveDestroyedRock:false
});

s.newEvent('talkNpc',function(key){ //triggered by talking to ringo. teleport to main
	s.teleport(key,'main','t1','party');
	s.setRespawn(key,'main','t1','party',true);
});
s.newEvent('killDragon',function(key){ //linked with Dragon deathEvent
	s.set(key,'haveKilledDragon',true);
});
s.newEvent('talkRingo',function(key){ //
	if(s.get(key,'haveKilledDragon') === false){
		s.message(key,"Go kill the dragon!");
	} else {
		s.completeQuest(key);
	}
});
s.newEvent('activateSwitch',function(key){ //
	s.set(key,'haveDestroyedRock',true);
});
s.newEvent('canSeeRock',function(key){ //
	if(s.get(key,'haveDestroyedRock') === false){
		return true;	//visible
	} else {
		return false;	//invisible
	}
});

s.newMap('main',{
	name:"Super Map",
	lvl:0,
	grid:["0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","1111111111111111111111111110000000111111","1000000000000000000000000011000001100000","1000000000000000000000000011000001100000","1000000000000000000000000011000001100000","1100000000000000000000000110000000110000","0111111111111111111111111100000000011111","0011111111111111111111111000000000001111","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000","0000000000000000000000000000000000000000"],
	tileset:'v1.2'
},{
	spot:{e1:{x:784,y:144},b1:{x:896,y:480,width:160,height:32},t1:{x:656,y:688},n1:{x:976,y:720},q1:{x:1104,y:816}},
	load:function(spot){
		m.spawnActor(spot.n1,'npc',{
			dialogue:'talkRingo',
		});
		m.spawnActor(spot.e1,'dragon',{
			deathEvent:'killDragon',
		});
		m.spawnToggle(spot.q1,function(key){
			return !s.get(key,'haveDestroyedRock');
		},'activateSwitch');
		m.spawnBlock(spot.b1,'canSeeRock');
	}
});
s.newMapAddon('QfirstTown-main',{
	spot:{q1:{x:1168,y:1648}},
	load:function(spot){
		m.spawnActor(spot.q1,'npc',{
			name:'QkillTheDragon',
			dialogue:'talkNpc',
			sprite:s.newNpc.sprite('skeleton',1),
		});
	}
});

s.exports(exports);
