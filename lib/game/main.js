//Resident Raver, a game by O'Reilly Books
// Implemented (Poorly I'd bet), by John Moeller :)

ig.module(
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',
    'game.levels.kitchen',
    'game.levels.peacefulkitchen',
    'game.levels.Basement',
    'impact.debug.debug'
)
.defines(function(){

    MyGame = ig.Game.extend({

        // Load a font
        font: new ig.Font('media/FONTS/04b03.font.png'),
        gravity: 300,

        init: function(){
            //Load our Level
            //this.loadLevel(LevelPeacefulkitchen);
			this.loadLevel(LevelBasement);

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
                y = ig.system.height/2;

            //this.font.draw( 'Welcome to Cooking with Arnold!', x, y, ig.Font.ALIGN.CENTER );
        }
});


// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', MyGame, 60, 320, 240, 2 );

});


