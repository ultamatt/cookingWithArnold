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
            flip: true,
            maxVel:{x:100, y:150},
            friction: {x: 600, y:0},
            accelGround:400,
            accelAir:200,
            jump: 200,
            speed: 75,
			health: 1000,
			cakeSFX: new ig.Sound('media/AUDIO FX/cake.*'),
            ovenSFX: new ig.Sound('media/AUDIO FX/ovenTaunt.*'),
            oven2SFX: new ig.Sound('media/AUDIO FX/ovenTaunt2.*'),
            oven3SFX: new ig.Sound('media/AUDIO FX/ovenTaunt3.*'),
            type: ig.Entity.TYPE.B,
            checkAgainst: ig.Entity.TYPE.A,
            collides: ig.Entity.COLLIDES.PASSIVE,

			//Fireball attack!
            ovenTimer: null,
            ovenDelay: 5,
            // 'oven', 'transforming', 'superoven'
			transformationState: 'oven',
            init: function( x, y, settings){
                this.parent( x, y, settings);
                this.addAnim('idle', 0.5, [0]);
                this.addAnim('transform', 0.5, [0,1,2,3,4], true);
                this.addAnim('shoot', 0.5, [4,5,6,3], true);
				this.ovenTimer = new ig.Timer();
            },

            update: function(){
                if(this.transformationState == 'oven' && this.distanceTo(ig.game.player) < 60) {
					//NOT JUST ANOTHER OVEN... 
                    this.currentAnim = this.anims.transform;
                    this.transformationState = 'transforming';
                    
                } 

                if(this.transformationState == 'superoven') {
					//We should fire ovens and move towards the player. 
					if(this.ovenTimer.delta() > this.ovenDelay
						&& this.distanceTo(ig.game.player) < 100) {
                        this.fireOven();
					}

                    if(!ig.game.collisionMap.getTile(
                        (this.pos.x + (this.flip ? +4 : this.size.x - 4)),
                        (this.pos.y + this.size.y+1)))
                    {
                        this.flip = !this.flip;
                    }

                    var xdir = this.flip ? -1 : 1;
                    this.vel.x = this.speed * xdir;
				}

                //We have completed the transformation and we should
                // set ourselves to the finished state
                if(this.transformationState == 'transforming'
                    && this.currentAnim == this.anims.transform 
                    && this.currentAnim.frame == 4){
                    //We've animated the transformation
					this.addAnim('idle', 0.5, [3, 4]);
                    this.transformationState = 'superoven';
				}

     //            if(ig.input.pressed('transform') && this.transformationState == 'oven'){
					// this.currentAnim = this.anims.transform;
     //            }

                this.currentAnim.flip.x = !this.flip;
                this.parent();
            },

            handleMovementTrace: function( res ){
                this.parent( res );
                if(res.collision.x){
                    this.flip = !this.flip;
                }
            },

            check: function(other){
				other.receiveDamage(10, this);
            },

            kill: function(){
                ig.game.stats.kills ++;
                this.parent();
                ig.game.spawnEntity(EntityGore, this.pos.x, this.pos.y + 10, {colorOffset: 1} );
				ig.game.spawnEntity(EntityGore, this.pos.x, this.pos.y + 20, {colorOffset: 1} );
				ig.game.spawnEntity(EntityGore, this.pos.x, this.pos.y + 30, {colorOffset: 1} );
            },

            fireOven: function(){
                var which = parseInt(Math.random() * 100) % 3;
                if(which == 0){
                    var whichTaunt = parseInt(Math.random() * 100) % 4;
                    this.ovenTimer.reset();
                    if(whichTaunt == 0){
                        this.cakeSFX.play();
                    } else if(whichTaunt == 1){
                        this.ovenSFX.play();
                    } else if(whichTaunt == 2){
                        this.oven2SFX.play();
                    } else if(whichTaunt == 3){
                        this.oven3SFX.play();
                    }
                } else if(which == 1){
                    this.ovenTimer.reset();
                    this.speed = 75; 
                } else if (which == 2) {
                    this.ovenTimer.reset();
                    this.currentAnim = this.anims.shoot;
                    var xdir = this.flip ? -1 : 1;
                    var velX = 200 * xdir;
                    ig.game.spawnEntity(EntityOven, this.pos.x + 10, this.pos.y + 10, {
                        flip: ig.game.player.pos.x < this.pos.x ? true : false, 
                        velX: velX,
                        velY: -200
                    });
                    this.speed = 20;
                }
            }
        });
    }
);
