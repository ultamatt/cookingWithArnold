//Cooking with Arnold THE GAME

ig.module(
	'game.main'
)
.requires(
	'impact.game',
	'impact.font',
    'game.levels.Kitchen',
	'game.levels.KitchenHole',
    'game.levels.PeacefulKitchen',
    'game.levels.Basement',
    'impact.debug.debug'
)
.defines(function(){

    MyGame = ig.Game.extend({

        // Load a font
        font: new ig.Font('media/FONTS/default.font.png'),
        gravity: 300,
        bottomText: "Left/Right to walk, Down to Duck, Z Swaps, X Jumps, C Fires.",
        background: new ig.Image('media/SCREENS/TEMP.TITLE.SCREEN.DARK.png'),
        hud: new ig.Image('media/HUD/HUD3.png'),
        ammo: { grenade: 3, shotgun: 999, antigriddle: 999, emulsifier: 3, fork: 999, none: 0 },
        ammoStart: { grenade: 3, shotgun: 999, antigriddle: 999, emulsifier: 3, fork: 999, none: 0 },
        weapon: 'none', 
        showStats: false,
        levelExit: null, 
        levelTimer: new ig.Timer(),
        lives: 3,
        stats: { time: 0, deaths: 0, kills: 0, shots: 0 },
        init: function(){
            //Load our Level
            //this.loadLevel(LevelKitchenHole);
            this.loadLevel(LevelPeacefulKitchen);
			//this.loadLevel(LevelBasement);

            //some music
            ig.music.loop = true;
            ig.music.add('media/MUSIC/fadingWorld.*', ["level1"]);
            ig.music.add('media/MUSIC/countStep.*', ["level2"]);
            ig.music.add('media/MUSIC/happyBirthday.*', ["level3"]);
            ig.music.add('media/MUSIC/theFinalThreat.*', ["level4"]);
            ig.music.add('media/MUSIC/catastropheStrikes.*', ["gameover"]);
            ig.music.volume = 0;
            ig.music.play(["level1"]);

            //Bind the Keyboard
            ig.input.bind( ig.KEY.LEFT_ARROW, 'left');
            ig.input.bind( ig.KEY.RIGHT_ARROW, 'right');
            ig.input.bind( ig.KEY.UP_ARROW, 'up');
            ig.input.bind( ig.KEY.DOWN_ARROW, 'down');

            ig.input.bind( ig.KEY.X, 'jump');
            ig.input.bind( ig.KEY.C, 'shoot');
            ig.input.bind( ig.KEY.Z, 'switch');
			ig.input.bind( ig.KEY.D, 'death');
			ig.input.bind( ig.KEY.A, 'climb');
			ig.input.bind( ig.KEY.S, 'lift');
            ig.input.bind( ig.KEY.I, 'invincible');
            ig.input.bind( ig.KEY.SPACE, 'continue');
        },

        loadLevel:function(data){
            this.parent(data);
            this.levelTimer.reset();
        },

        update:function(){
            var player = this.getEntitiesByType(EntityPlayer)[0];
            if(player){
                this.screen.x = player.pos.x - ig.system.width/2;
                this.screen.y = player.pos.y - ig.system.height/2;
            }
            if(player && player.accel.x > 0 && this.bottomText != ""){
                this.bottomText = "";
            }
            if(!this.showStats) {
                this.parent();  
            } else {
                if(ig.input.state('continue')){
                    this.showStats = false;
                    this.levelExit.nextLevel();
                    this.parent();
                }
            }
        },

        draw:function(){
            this.parent();

            var x = ig.system.width/2,
                y = ig.system.height - 10;

            if(this.showStats){
                this.background.draw(0,0);
                var statsY = ig.system.height/2 - 20;
                this.font.draw('Level Complete', x, statsY, ig.Font.ALIGN.CENTER );
                this.font.draw('Time ' + this.stats.time , x, statsY + 30, ig.Font.ALIGN.CENTER );
                this.font.draw('Deaths ' + this.stats.deaths , x, statsY + 40, ig.Font.ALIGN.CENTER );
                this.font.draw('Kills ' + this.stats.kills , x, statsY + 50, ig.Font.ALIGN.CENTER );
                this.font.draw('Shots ' + this.stats.shots , x, statsY + 60, ig.Font.ALIGN.CENTER );
                this.font.draw('Press Spacebar to continue', x, ig.system.height - 10, ig.Font.ALIGN.CENTER );
            } else {
                var hudX = 0; 
                var hudY = 0;
                this.hud.draw(hudX,hudY);
                this.font.draw('LIFE', hudX + 17, hudY + 10, ig.Font.ALIGN.CENTER);
                this.font.draw(this.lives, hudX + 17, hudY + 23, ig.Font.ALIGN.CENTER);
                this.font.draw(this.weapon, hudX + 55, hudY + 17, ig.Font.ALIGN.CENTER);
                this.font.draw(this.ammo[this.weapon], hudX + 85, hudY + 17, ig.Font.ALIGN.CENTER);
            }

            this.font.draw( this.bottomText, x, y, ig.Font.ALIGN.CENTER );
        },

        toggleStats:function(levelExit){
            this.showStats = true;
            this.stats.time = Math.round(this.levelTimer.delta());
            this.levelExit = levelExit;
        }, 

        gameOver: function(){
            ig.finalStats = ig.game.stats;
            ig.system.setGame(GameOverScreen);
        }
});

if( ig.ua.mobile ) {
	// Disable sound for all mobile devices
	ig.Sound.enabled = false;
}

StartScreen = ig.Game.extend({
	fontSmall: new ig.Font('media/FONTS/default.font.png'),
	fontBig: new ig.Font('media/FONTS/Font24.font.png'),
	background: new ig.Image('media/SCREENS/TEMP.TITLE.SCREEN.png'),
	init: function(){
        //some music
        ig.music.add('media/MUSIC/arnoldsong.*', ["title"]);
        ig.music.volume = 0.5;
        ig.music.play(["title"]);

		ig.input.bind( ig.KEY.SPACE, 'start');
	},
	update: function(){
		if( ig.input.pressed ('start')){
			ig.system.setGame(StoryScreens);
		}
		this.parent();
	},
	draw: function() {
		this.parent();
		this.background.draw( 0,0);
		var x = ig.system.width/ 2, y = ig.system.height - 10;
		this.fontBig.draw('Cooking with \nArnold', x, 10, ig.Font.ALIGN.CENTER);
		this.fontSmall.draw( 'Press Spacebar To Start', x + 40, y, ig.Font.ALIGN.CENTER );
	}
});


GameOverScreen = ig.Game.extend({
    fontSmall: new ig.Font('media/FONTS/default.font.png'),
    fontBig: new ig.Font('media/FONTS/Font24.font.png'),
    background: new ig.Image('media/SCREENS/TEMP.TITLE.SCREEN.OVER.png'),
    stats: {},
    init: function(){
        //some music
        ig.music.play(["gameover"]);

        ig.input.bind( ig.KEY.SPACE, 'start');
        this.stats = ig.finalStats;
    },
    update: function(){
        if( ig.input.pressed ('start')){
            ig.system.setGame(StartScreen);
        }
        this.parent();
    },
    draw: function() {
        this.parent();
        this.background.draw(0,0);
        var x = ig.system.width/ 2, y = ig.system.height - 10;
        this.fontBig.draw('GAME OVER', x, 10, ig.Font.ALIGN.CENTER);

        this.fontSmall.draw('Welcome to Skynet\n You are now part of the system', x, y - 30, ig.Font.ALIGN.CENTER);
        this.fontSmall.draw( 'Press Spacebar To Start', x, y, ig.Font.ALIGN.CENTER );
    }
});


StoryScreens = ig.Game.extend({
    story: [
        "It is 2007,\nthe future.", 
        "Skynet oven has\nbecome the\nlargest supplier",
        "of computer \nsystems designed \nto build cakes.",
        "All cakes are \nupgraded with Skynet\ncomputers, becoming \nfully unmanned.",
        "Afterwards, \nthey taste delicious.",
        "The Skynet Cake \nBill has passed. ",
        "The system goes \nonline on \nSeptember 2nd, 2007.",
        "Human decisions \nare removed \nfrom strategic \nbuilding of cakes.",
        "Skynet Oven \nbegins to \nlearn at a \ngeometric rate. ",
        "It becomes \nself-aware \n2:14 AM, Eastern time,\nSeptember 3rd.",
        "In a panic, \nyou will try \nto bake a cake.",
        "It tries \nto kill you."
    ], 
    storyIterator: 0,
    timer: null, 
    storyWait: 5,
    fontSmall: new ig.Font('media/FONTS/Font16.font.png'),
    fontBig: new ig.Font('media/FONTS/Font24.font.png'),
    background: new ig.Image('media/SCREENS/TEMP.TITLE.SCREEN.DARK.png'),
    init: function(){
        ig.input.bind( ig.KEY.SPACE, 'start');
        this.timer = new Date();
    },
    update: function(){
        if( ig.input.pressed ('start')){
            ig.system.setGame(MyGame);
        }
        this.parent();
    },
    draw: function() {
        this.parent();
        this.background.draw(0,0);
        var x = ig.system.width/ 2, y = ig.system.height/2;
        this.changeText();
        if(this.story[this.storyIterator] == undefined) {
            ig.system.setGame(MyGame);
        } else {
            this.fontSmall.draw( this.story[this.storyIterator], x, y, ig.Font.ALIGN.CENTER );    
        }
    }, 
    changeText: function(){
        var now = new Date();
        if((now - this.timer) / 1000 > this.storyWait){
            this.storyIterator ++;
            this.timer = new Date();
            if(this.storyIterator >= this.story.length){
                ig.system.setGame(MyGame);
            }
        }
    }
});

// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', StartScreen, 60, 320, 240, 2 );

});


