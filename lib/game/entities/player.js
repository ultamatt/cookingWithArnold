//Player Character in the game
ig.module(
    'game.entities.player'
)

.requires(
    'impact.entity',
    'game.utils.entityUtils'
)

.defines(
    function(){
        EntityPlayer = ig.Entity.extend({
            animSheet: new ig.AnimationSheet('media/idris.png', 40, 50),
            size: {x:22, y:49},
            offset: {x:8, y:0},
            flip: false,
            maxVel:{x:100, y:150},
            friction: {x: 600, y:0},
            accelGround:400,
            accelAir:200,
            jump: 200,
            health: 20,
            type: ig.Entity.TYPE.A,
            checkAgainst: ig.Entity.TYPE.NONE,
            collides: ig.Entity.COLLIDES.PASSIVE,

            init: function( x, y, settings){
                this.parent( x, y, settings);
                this.addAnim('idle', 1, [0]);
                this.addAnim('run', 0.07, [0,1,2,3,4,5]);
                this.addAnim('jump', 1, [9]);
                this.addAnim('fall', 0.4, [6,7]);
            },

            update: function(){
                /////////////////
                // Movement
                ////////////////

                //Handle Moving Left or Right
                var accel = this.standing ? this.accelGround : this.accelAir;

                if(ig.input.state('left')){
                    this.accel.x = -accel;
                    this.flip = true;
                }
                else if(ig.input.state('right')){
                    this.accel.x = accel;
                    this.flip = false;
                }
                else{
                    this.accel.x = 0;
                }

                //Jumping Functionality
                if(this.standing
                    && ig.input.pressed('jump')){
                    this.vel.y = -this.jump;
                }

                if(ig.input.pressed('shoot')){
                    ig.mark("SampleBulletSpread", bulletSpread());
                    ig.game.spawnEntity( EntityBullet, this.pos.x  + bulletSpread(), this.pos.y + bulletSpread(), {flip:this.flip});
                    ig.game.spawnEntity( EntityBullet, this.pos.x  + bulletSpread(), this.pos.y + bulletSpread(), {flip:this.flip});
                    ig.game.spawnEntity( EntityBullet, this.pos.x  + bulletSpread(), this.pos.y + bulletSpread(), {flip:this.flip});
                }
                /////////////////
                // Animation
                ////////////////

                if( this.vel.y < 0){
                    this.currentAnim = this.anims.jump;
                }
                else if( this.vel.y > 0){
                    this.currentAnim = this.anims.fall;
                }
                else if( this.vel.x != 0){
                    this.currentAnim = this.anims.run;
                }
                else{
                    this.currentAnim = this.anims.idle;
                }

                this.currentAnim.flip.x = this.flip;
                this.parent();
            }
        });
        EntityBullet = ig.Entity.extend({
            size:{x:5, y:3},
            animSheet:new ig.AnimationSheet('media/bullet.png', 5, 3),
            maxVel:{x:400, y:0},
            type:ig.Entity.TYPE.NONE,
            checkAgainst:ig.Entity.TYPE.B,
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
                other.receiveDamage(1, this);
                this.kill();
            }

        });
        EntityGrenade = ig.Entity.extend({
            size: {x: 4, y:4},
            offset: {x:2, y:2},
            animSheet: new ig.AnimationSheet('media/grenade.png', 8, 8),
            maxVel:{x:200, y:200},
            bounciness: 0.6,
            bounceCounter: 0,
            type: ig.Entity.TYPE.NONE,
            checkAgainst: ig.Entity.TYPE.BOTH,
            collides: ig.Entity.COLLIDES.PASSIVE,

            init: function(x, y, settings){
                this.parent(x + (settings.flip ? -8 : 16), y+27, settings);
                this.vel.x = this.accel.x = (settings.flip ? -this.maxVel.x : this.maxVel.x);
                this.vel.y = -(50 + Math.random()*100);
                this.addAnim('idle', 0.2, [0,1]);
            },

            handleMovementTrace: function(res){
                this.parent(res);
                if( res.collision.x || res.collision.y){
                    this.bounceCounter++;
                    if(this.bounceCounter > 3)
                        this.kill();
                }

            },
            check: function(other){
                other.receiveDamage(10, this);
                this.kill();
            }
        });
    }
)