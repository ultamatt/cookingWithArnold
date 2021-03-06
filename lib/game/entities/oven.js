//Player Character in the game
ig.module(
    'game.entities.oven'
)

    .requires(
    'impact.entity'
)

    .defines(
    function(){
        EntityOven = ig.Entity.extend({
            animSheet: new ig.AnimationSheet('media/ENEMIES/oven.png', 37, 30),
            size: {x:37, y:30},
            offset: {x:0, y:0},
            flip: false,
            maxVel:{x:10000, y:10000},
            friction: {x: 100, y:0},
            accelGround:400,
            accelAir:200,
            speed: 20,
			health: 100,
            type: ig.Entity.TYPE.B,
            checkAgainst: ig.Entity.TYPE.A,
            collides: ig.Entity.COLLIDES.PASSIVE,

            //Fireball attack!
            fireballTimer: null,
            fireballDelay: 2,

            init: function( x, y, settings){
                this.parent( x, y, settings);
                if(settings.velX != null && settings.velY != null){
                    this.vel.x = settings.velX;
                    this.vel.y = settings.velY;
                }
                this.addAnim('ovenIdle', 1, [0]);
                this.addAnim('ovenWalk', 0.5, [0,5,6,5]);
                this.addAnim('ovenJump', 1, [6]);
                this.addAnim('ovenShoot', 0.2, [0,1,2,3]);
                this.addAnim('ovenFall', 0.4, [5,6]);
                this.fireballTimer = new ig.Timer();
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

                if(this.fireballTimer.delta() > this.fireballDelay
                    && this.distanceTo(ig.game.player) < 100) {
                    this.fireballTimer = new ig.Timer();
                    this.shootFireball();
                }
                
                if(Math.abs(this.vel.x) < this.speed){
                    var xdir = this.flip ? -1 : 1;
                    this.vel.x = this.speed * xdir;    
                }

                /////////////////
                // Animation
                ////////////////
                if(this.fireballTimer.delta() > this.fireballDelay){
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
                    console.log("An oven collided");
                    this.flip = !this.flip;
                }
            },

            check: function(other){
                other.receiveDamage(10, this);
                this.flip = !this.flip
                if(Math.abs(this.vel.x) < this.speed){
                    var xdir = this.flip ? -1 : 1;
                    this.vel.x = this.speed * xdir;    
                }
            },

            kill: function(){
                ig.game.stats.kills ++;
                this.parent();
                ig.game.spawnEntity(EntityGore, this.pos.x, this.pos.y + 10, {colorOffset: 1} );
            },

            shootFireball: function(){
                this.fireballTimer.reset();
                this.currentAnim = this.anims.ovenShoot;
                ig.game.spawnEntity( EntityFireball, this.pos.x, this.pos.y - 15, {flip:ig.game.player.pos.x < this.pos.x ? true: false});
            }
        });

        EntityFireball = ig.Entity.extend({
            size:{x:32, y:32},
            animSheet:new ig.AnimationSheet('media/EFFECTS/flame.png', 32, 32),
            maxVel:{x:50, y:0},
            type:ig.Entity.TYPE.B,
            checkAgainst:ig.Entity.TYPE.A,
            collides:ig.Entity.COLLIDES.PASSIVE,

            init:function (x, y, settings) {
                this.parent(x + (settings.flip ? -8 : 16), y + 27, settings);
                this.vel.x = this.accel.x = (settings.flip ? -this.maxVel.x : this.maxVel.x);
                this.addAnim('idle', 0.2, [0]);
            },

            handleMovementTrace:function (res) {
                this.parent(res);
                this.currentAnim = this.anims.idle;
				if (res.collision.x || res.collision.y)
                    this.kill();
            },
            check:function (other) {
                other.receiveDamage(10, this);
                this.kill();
            }

        });
    }
);
