//Player Character in the game
ig.module(
    'game.entities.clone'
)

    .requires(
    'impact.entity'
)

    .defines(
    function(){
        EntityClone = ig.Entity.extend({
            animSheet: null,
			animSheetSleeves: new ig.AnimationSheet('media/ENEMIES/Clone1.png', 40, 50),
			animSheetNoSleeves: new ig.AnimationSheet('media/ENEMIES/Clone2.png', 40, 50),
            sheetSwap: 0,
            size: {x:22, y:46},
            offset: {x:8, y:0},
            flip: false,
			lastInput: null,

			maxVel:{x:50, y:100},
            friction: {x: 600, y:0},
            accelGround:300,
            accelAir:100,
            jump: 100,
            speed: 20,
			health: 100,
            type: ig.Entity.TYPE.B,
            checkAgainst: ig.Entity.TYPE.A,
            collides: ig.Entity.COLLIDES.PASSIVE,

            //Fireball attack!
            gunTimer: null,
            gunDelay: 2,

            init: function( x, y, settings){
                this.parent( x, y, settings);
				//Gives us the chance to make a random arnold clone body
				if(parseInt(Math.random() * 100) % 2 == 1){
					this.animSheet = this.animSheetSleeves;
				} else {
					this.animSheet = this.animSheetNoSleeves;
				}

                this.addAnim('ovenIdle', 1, [0]);
                this.addAnim('ovenWalk', 0.5, [0,5,6,5]);
                this.addAnim('ovenJump', 1, [6]);
                this.addAnim('ovenShoot', 0.2, [0,1,2,3]);
                this.addAnim('ovenFall', 0.4, [5,6]);
                this.gunTimer = new ig.Timer();
            },

            update: function(){
                /////////////////
                // Movement
                ////////////////

                //Are we near a ledge?
                var accel = this.standing ? this.accelGround : this.accelAir;

                if(!ig.game.collisionMap.getTile(
                    (this.pos.x + (this.flip ? +4 : this.size.x - 4)),
                    (this.pos.y + this.size.y+1)))
                {
                    this.flip = !this.flip;
                }




                var xdir = this.flip ? -1 : 1;
                this.vel.x = this.speed * xdir;

                /////////////////
                // Animation
                ////////////////
				 if(this.gunTimer.delta() > this.gunDelay
                    && this.distanceTo(ig.game.player) < 200) {
                    this.gunTimer = new ig.Timer();
                    this.shoot();
                } else {
                    if( this.vel.y < 0){
                        this.currentAnim = this.anims.ovenJump;
                    }
                    else if( this.vel.y > 0){
                        this.currentAnim = this.anims.ovenFall;
                    }
                    else if( this.vel.x != 0){
                        this.currentAnim = this.anims.ovenWalk;
                    }
                    else{
                        this.currentAnim = this.anims.ovenIdle;
                    }
                }

                this.currentAnim.flip.x = this.flip;
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
                this.flip = !this.flip;
                var xdir = this.flip ? -1 : 1;
                this.vel.x = this.speed * xdir;
            },

            kill: function(){
                this.parent();
                ig.game.spawnEntity(EntityGore, this.pos.x, this.pos.y + 10 );
            },

            shoot: function(){
                this.gunTimer.reset();
				ig.game.spawnEntity( EntityBadguyBullet, this.pos.x  + bulletSpread(), this.pos.y + bulletSpread(), {flip:this.flip});
            }
        });
		
		EntityBadguyBullet = ig.Entity.extend({
            size:{x:5, y:3},
            animSheet:new ig.AnimationSheet('media/WEAPONS/bullet.png', 5, 3),
            maxVel:{x:400, y:0},
            type:ig.Entity.TYPE.NONE,
            checkAgainst:ig.Entity.TYPE.A,
            collides:ig.Entity.COLLIDES.PASSIVE,

            init:function (x, y, settings) {
                this.parent(x + (settings.flip ? -8 : 16), y + 27, settings);
                this.vel.x = this.accel.x = (settings.flip ? -this.maxVel.x : this.maxVel.x);
                this.addAnim('idle', 0.2, [0]);
            },

            handleMovementTrace:function (res) {
                this.parent(res);
                if (res.collision.x || res.collision.y)
                    this.kill();
            },
            check:function (other) {
                other.receiveDamage(2, this);
                this.kill();
            }

        });
    }
);
