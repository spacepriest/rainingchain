//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
eval(loadDependency(['Quest','OfflineAction','Highscore','Material','Main'],['Competition']));

var Competition = exports.Competition = function(highscore,end,reward){
	var high = Highscore.get(highscore);
	var a = {
		id:Math.randomId(),
		startTime:Date.now(),
		endTime:end || 0,
		name:high.name,
		description:high.description,
		rank:[],
		order:high.order,
		highscore:highscore || '',
		quest:Quest.get(Highscore.getQuest(highscore)).name,
		reward:reward || [],	
	}
	Competition.CURRENT = a;
	return a;
}

Competition.Rank = function(username,score){
	return {
		username:username || '',
		score:score || 0,	
	}
}

Competition.Reward = function(item,exp){
	return {
		item:item || {},
		exp:exp || 0,	
	}
}

Competition.Reward.randomlyGenerate = function(){
	var mat = Material.getRandom();
	return [
		Competition.Reward({'wood-0':20},2000),
		Competition.Reward({'wood-0':16},1600),
		Competition.Reward({'wood-0':12},1200),
		Competition.Reward({'wood-0':8},800),
		Competition.Reward({'wood-0':4},400),	
	]
}

Competition.CURRENT = null;
var db;
Competition.init = function(dbLink,app){
	db = dbLink;
	db.competition.findOne({},{_id:0},function(err,res){
		if(res)
			Competition.CURRENT = res;
		else {
			Competition.generateRandom();
		}
		var comp = Competition.getCurrent();
		var timeDiff = comp.endTime - Date.now();
		setTimeout(function(){
			Competition.end(comp);
		},timeDiff);
	});
	app.post('/competitionHomePage',function(req,res){
		res.send({
			competition:Competition.getHomePage()
		});
	});
	
	
}

Competition.generateRandom = function(){
	Competition(Competition.getNext(),Date.now()+CST.WEEK,Competition.Reward.randomlyGenerate());
}

Competition.save = function(){
	var comp = Competition.getCurrent();
	db.competition.upsert({id:comp.id},comp);
}


Competition.onQuestComplete = function(key,highscoreInfo){
	var comp = Competition.getCurrent();
	if(!comp) return;
	
	for(var j in highscoreInfo){
		if(j !== comp.highscore)
			continue;
		var username = Main.get(key).username;
			
		var alreadyThere = false;
		for(var i in comp.rank){
			if(comp.rank[i].username === username){
				alreadyThere = true;
				if((comp.order === 'ascending' && highscoreInfo[j] > comp.rank[i].score)
					|| (comp.order === 'descending' && highscoreInfo[j] < comp.rank[i].score)
				){
					comp.rank[i].score = highscoreInfo[j];
					Competition.updateRank(comp);
					Competition.save();
				}		
			}
		}
		if(alreadyThere === false){
			comp.rank.push(Competition.Rank(username,highscoreInfo[j]));
			Competition.updateRank(comp);
			Competition.save();
		}
	}	
}

Competition.updateRank = function(comp){
	if(comp.order === 'ascending')
		comp.rank.sort(function(a,b){
			return a-b;
		});
	else 
		comp.rank.sort(function(a,b){
			return b-a;
		});
}


Competition.getCurrent = function(){
	return Competition.CURRENT;
}

Competition.getNext = function(){
	var list = [
		'QlureKill-killCount',
		'QlureKill-timeEasy',
		'QlureKill-timeHard',
		'QbaseDefence-remainingpthard',
		'QbaseDefence-remainingpteasy',
		'QbaseDefence-remainingpt4',
	];
	return list.random();
}

Competition.end = function(comp){
	//give reward
	for(var i = 0; i < comp.reward.length; i++){
		if(comp.rank[i]){
			OfflineAction(comp.rank[i].username,'message',OfflineAction.Data.message(
				'Congratulation! You finished #' + (i+1) + ' in the competition! You win ' + comp.reward[i].exp + ' exp and a bunch of items.'
			));
			OfflineAction(comp.rank[i].username,'questPopup',OfflineAction.Data.message(
				'Congratulation! You finished #' + (i+1) + ' in the competition! You win ' + comp.reward[i].exp + ' exp and a bunch of items.'
			));
			OfflineAction(comp.rank[i].username,'addExp',OfflineAction.Data.addExp(comp.reward[i].exp,false));
			OfflineAction(comp.rank[i].username,'addItem',OfflineAction.Data.addItem(comp.reward[i].item));
		}
	}
	db.competition.remove({id:comp.id},db.err);
	Competition.generateRandom();
}

Competition.getHomePage = function(){
	var cur = Competition.getCurrent();
	var temp = {};
	for(var i in cur){
		if(i === 'rank')
			temp[i] = cur[i].slice(0,5);
		else
			temp[i] = cur[i];
	}
	return temp;
}	




