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
            animSheet: new ig.AnimationSheet('media/oven.png', 37, 30),
            size: {x:37, y:30},
            offset: {x:0, y:0},
            flip: false,
            maxVel:{x:50, y:100},
            friction: {x: 600, y:0},
            accelGround:300,
            accelAir:100,
            jump: 100,
            speed: 20,
            type: ig.Entity.TYPE.B,
            checkAgainst: ig.Entity.TYPE.A,
            collides: ig.Entity.COLLIDES.PASSIVE,

            init: function( x, y, settings){
                this.parent( x, y, settings);
                this.addAnim('ovenIdle', 1, [0]);
                this.addAnim('ovenWalk', 0.5, [0,5,6,5]);
                this.addAnim('ovenJump', 1, [6]);
                this.addAnim('ovenShoot', 0.5, [0,1,2,3]);
                this.addAnim('ovenFall', 0.4, [5,6]);
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
            }
        });
    }
)