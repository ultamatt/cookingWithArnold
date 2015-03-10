//Player Character in the game
ig.module(
    'game.entities.superOven'
)

    .requires(
    'impact.entity'
)

    .defines(
    function(){
        EntitySuperOven = ig.Entity.extend({
            animSheet: new ig.AnimationSheet('media/ENEMIES/superoven.png', 64, 64),
            size: {x:64, y:64},
            flip: false,
            maxVel:{x:100, y:150},
            friction: {x: 600, y:0},
            accelGround:400,
            accelAir:200,
            jump: 200,
			health: 1000,

			cakeSFX: new ig.Sound('media/AUDIO FX/cake.*'),
            type: ig.Entity.TYPE.B,
            checkAgainst: ig.Entity.TYPE.A,
            collides: ig.Entity.COLLIDES.PASSIVE,

			//Fireball attack!
            ovenTimer: null,
            ovenDelay: 3,

			transformed: false,
            init: function( x, y, settings){
                this.parent( x, y, settings);
                this.addAnim('idle', 1, [0]);
                this.addAnim('transform', 1, [0,1,2,3,4], true);
                this.addAnim('shoot', 1, [4,5,6,3], true);
				this.ovenTimer = new ig.Timer();
            },

            update: function(){
                if(!this.tranformed && this.distanceTo(ig.game.player) < 40) {
					//JUST ANOTHER OVEN
                    this.currentAnim = this.anims.transform;
                } else {
					//NOT!
					if(this.ovenTimer.delta() > this.ovenDelay
						&& this.distanceTo(ig.game.player) < 100) {
						this.fireOven();
					}
				}


				if(this.transformed == false && this.currentAnim == this.anims.transform && this.currentAnim.currentFrame == 4){
					this.transformed = true;
					this.addAnim('idle', 1, [3, 4]);
				}

                if(ig.input.pressed('transform') && this.transformed == false){
					this.currentAnim = this.anims.transform;
                }

                this.currentAnim.flip.x = this.flip;
                this.parent();
            },

            check: function(other){
				other.receiveDamage(10, this);
            },

            kill: function(){
                this.parent();
                ig.game.spawnEntity(EntityGore, this.pos.x, this.pos.y + 10, {colorOffset: 1} );
				ig.game.spawnEntity(EntityGore, this.pos.x, this.pos.y + 20, {colorOffset: 1} );
				ig.game.spawnEntity(EntityGore, this.pos.x, this.pos.y + 30, {colorOffset: 1} );
            },

            fireOven: function(){
				this.ovenTimer.reset();
                this.currentAnim = this.anims.shoot;
				var which = parseInt(Math.random() * 100) % 3;
				if(which == 0){
	                this.cakeSFX.play();
				}
                ig.game.spawnEntity(EntityOven, this.pos.x + 10, this.pos.y + 10, {flip: ig.game.player.pos.x < this.pos.x ? true : false});
            }
        });
    }
);
