//Player Character in the game
ig.module(
    'game.entities.selectableArnold'
)

    .requires(
    'impact.entity', 
	'impact.sound'
)

    .defines(
    function(){
        EntitySelectableArnold = ig.Entity.extend({
            animSheet: new ig.AnimationSheet('media/INTRO/CHAR.SEL.1.png', 64, 128),
			blackShirtSheet: new ig.AnimationSheet('media/INTRO/CHAR.SEL.1.png', 64, 128),
			whiteShirtSheet: new ig.AnimationSheet('media/INTRO/CHAR.SEL.2.png', 64, 128),
			cloneSFX: new ig.Sound('media/AUDIO FX/clone.*'),
			clone2SFX: new ig.Sound('media/AUDIO FX/clone2.*'),
            init: function( x, y, settings){
                this.parent( x, y, settings);
				if(settings.style != null && settings.style == "whiteArnold"){
					this.animSheet = this.whiteShirtSheet;
				} else if (settings.style != null && settings.style == "blackArnold"){
					this.animSheet = this.blackShirtSheet;
				}
                this.addAnim('idle', 1, [0]);
                this.addAnim('selected', 0.5, [1,2]);
            },

            update: function(){

                if(ig.input.pressed('selected')){
                    this.currentAnim = this.anims.selected;
                }

                this.parent();
            },
			
			selected: function(){
				this.currentAnim = this.anims.selected;
				if(parseInt(Math.random() * 10) % 2 == 1){
					this.cloneSFX.play();
				} else {
					this.clone2SFX.play();
				} 
			}, 
			
			deselected: function(){
				this.currentAnim = this.anims.idle;
			}
        });
    }
)