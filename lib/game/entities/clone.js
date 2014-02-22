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
            animSheet: new ig.AnimationSheet('media/ENEMIES/Clone1.png', 37, 30),
            sheetSwap: 0,
            size: {x:22, y:46},
            maxVel:{x:50, y:100},
            offset: {x:8, y:0},
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
            fireballTimer: null,
            fireballDelay: 2,

            init: function( x, y, settings){
                this.parent( x, y, settings);
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


                var xdir = this.flip ? -1 : 1;
                this.vel.x = this.speed * xdir;

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
                ig.game.spawnEntity(EntityGore, this.pos.x, this.pos.y + 10, {colorOffset: 1} );
            },

            shootFireball: function(){
                this.fireballTimer.reset();
                this.currentAnim = this.anims.ovenShoot;
                //ig.game.spawnEntity( EntityFireball, this.pos.x, this.pos.y - 15, {flip:ig.game.player.pos.x < this.pos.x ? true: false});
            }
        });
    }
);