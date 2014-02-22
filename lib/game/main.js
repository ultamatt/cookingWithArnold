//Resident Raver, a game by O'Reilly Books
// Implemented (Poorly I'd bet), by John Moeller :)

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
            ig.music.add('media/MUSIC/arnoldsong.*');
            ig.music.volume = 0.5;
            //ig.music.play();

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
        },

        update:function(){
            var player = this.getEntitiesByType(EntityPlayer)[0];
            if(player){
                this.screen.x = player.pos.x - ig.system.width/2;
                this.screen.y = player.pos.y - ig.system.height/2;
            }
            // Update all entities and backgroundMaps
            this.parent();
        },

        draw:function(){
            // Draw all entities and backgroundMaps
            this.parent();


            // Add your own drawing code here
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
		ig.input.bind( ig.KEY.SPACE, 'start');
	},
	update: function(){
		if( ig.input.pressed ('start')){
			ig.system.setGame(MyGame);
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


// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', StartScreen, 60, 320, 240, 2 );

});


