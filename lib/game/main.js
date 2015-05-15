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

        init: function(){
            //Load our Level
            this.loadLevel(LevelPeacefulKitchen);
			//this.loadLevel(LevelBasement);

            //some music
            ig.music.add('media/MUSIC/fadingWorld.*');
            ig.music.next();
            ig.music.volume = 0.5;
            ig.music.play();

            //Bind the Keyboard
            ig.input.bind( ig.KEY.LEFT_ARROW, 'left');
            ig.input.bind( ig.KEY.RIGHT_ARROW, 'right');
            ig.input.bind( ig.KEY.DOWN_ARROW, 'duck');
            ig.input.bind( ig.KEY.X, 'jump');
            ig.input.bind( ig.KEY.C, 'shoot');
            ig.input.bind( ig.KEY.Z, 'switch');
			ig.input.bind( ig.KEY.D, 'death');
			ig.input.bind( ig.KEY.A, 'climb');
			ig.input.bind( ig.KEY.S, 'lift');
            ig.input.bind( ig.KEY.I, 'invincible');
        },

        update:function(){
            var player = this.getEntitiesByType(EntityPlayer)[0];
            if(player){
                this.screen.x = player.pos.x - ig.system.width/2;
                this.screen.y = player.pos.y - ig.system.height/2;
            }
            this.parent();
        },

        draw:function(){
            this.parent();

            var x = ig.system.width/2,
                y = ig.system.height - 10;

            
            this.font.draw( 'Left/Right to walk, Down to Duck, Z Swaps, X Jumps, C Fires.', x, y, ig.Font.ALIGN.CENTER );
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
        ig.music.add('media/MUSIC/arnoldsong.*');
        ig.music.volume = 0.5;
        ig.music.play();

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


