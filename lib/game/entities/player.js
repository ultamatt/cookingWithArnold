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
            //Animation Properties
            animSheet: new ig.AnimationSheet('media/idris.png', 40, 50),
            size: {x:22, y:49},
            offset: {x:8, y:0},
            flip: false,

            //Collision Properties
            type: ig.Entity.TYPE.A,
            checkAgainst: ig.Entity.TYPE.NONE,
            collides: ig.Entity.COLLIDES.PASSIVE,

            //Physics Properties
            maxVel:{x:100, y:150},
            friction: {x: 600, y:0},
            accelGround:400,
            accelAir:200,

            //Player Basic Attributes
            jump: 200,
            health: 20,
            weapon: 0,
            activeWeapon: "EntityBullet",
            totalWeapons: 2,
            startPosition: null,
            invincible:true,
            invincibleDelay:2,
            invincibleTimer:null,

            init: function( x, y, settings){
                this.parent( x, y, settings);
                this.setupAnimation(this.weapon);
                this.startPosition = {x:x, y:y};
                this.invincibleTimer = new ig.Timer();
                this.makeInvincible();
            },

            setupAnimation: function(offset){
                offset = offset * 10;
                this.addAnim('idle', 1, [0+offset]);
                this.addAnim('run', 0.07, [0+offset,1+offset,2+offset,3+offset,4+offset,5+offset]);
                this.addAnim('jump', 1, [9+offset]);
                this.addAnim('fall', 0.4, [6+offset,7+offset]);
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

                //Weapon Swappin' Functionality!
                if(ig.input.pressed('switch')){
                    this.weapon ++;
                    this.weapon = this.weapon % this.totalWeapons;
                    switch(this.weapon){
                        case(0):
                            this.activeWeapon = "EntityBullet";
                            break;
                        case(1):
                            this.activeWeapon = "EntityGrenade";
                            break;
                        default:
                            this.activeWeapon = "EntityBullet";
                            break;
                    }
                    this.setupAnimation(this.weapon);
                }

                //Shootin Functionality! PEW PEW
                if(ig.input.pressed('shoot')){
                    switch(this.weapon){
                        case(0):
                                //A SHOTGUN!
                                ig.game.spawnEntity( EntityBullet, this.pos.x  + bulletSpread(), this.pos.y + bulletSpread(), {flip:this.flip});
                                ig.game.spawnEntity( EntityBullet, this.pos.x  + bulletSpread(), this.pos.y + bulletSpread(), {flip:this.flip});
                                ig.game.spawnEntity( EntityBullet, this.pos.x  + bulletSpread(), this.pos.y + bulletSpread(), {flip:this.flip});
                            break;
                        case(1):
                                //GrEnAdE!
                                ig.game.spawnEntity( EntityGrenade, this.pos.x, this.pos.y, {flip:this.flip});
                            break;
                    }

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

                //Are we still invincible?
                if(this.invincibleTimer.delta() > this.invincibleDelay)
                    this.invincible = false;

                this.parent();
            },

            kill: function(){
                this.parent();
                var x = this.startPosition.x;
                var y = this.startPosition.y;
                ig.game.spawnEntity(EntityGore, this.pos.x, this.pos.y, {callBack:function(){ig.game.spawnEntity( EntityPlayer, x, y)}} );
                ig.game.spawnEntity(EntityGore, this.pos.x, this.pos.y + 27);
                ig.game.spawnEntity(EntityGore, this.pos.x, this.pos.y + 50);
            },

            receiveDamage: function(amount, from){
                if(this.invincible)
                    return;
                this.parent(amount, from);
            },

            draw: function(){
                if(this.invincible){
                    this.currentAnim.alpha = this.invincibleTimer.delta() / this.invincibleDelay * 1;
                }
                else{
                    this.currentAnim.alpha = 1;
                }

                this.parent();
            },

            makeInvincible: function(){
                this.invincible = true;
                this.invincibleTimer.reset();
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
                this.parent(x + (settings.flip ? -16 : 32), y+27, settings);
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
        EntityGore = ig.Entity.extend({
            lifetime: 1,
            callBack: null,
            particles: 25,
            init: function (x, y, settings){
                this.parent(x, y, settings);
                for(var i = 0; i < this.particles; i++)
                    ig.game.spawnEntity(EntityGoreParticle, x, y, {colorOffset: settings.colorOffset ? settings.colorOffset : 0});
                this.idleTimer = new ig.Timer();
            },
            update: function(){
                if(this.idleTimer.delta() > this.lifetime){
                    this.kill();
                    if(this.callBack)
                        this.callBack();
                    return;
                }
            }
        });
        EntityGoreParticle = ig.Entity.extend({
            size: {x:2, y:2},
            maxVel: {x:160, y:200},
            lifetime: 2,
            fadetime: 1,
            bounciness: 0,
            vel:{x:100, y:30},
            friction:{x:100, y:0},
            collides: ig.Entity.COLLIDES.LITE,
            colorOffset: 0,
            totalColors: 7,
            animSheet: new ig.AnimationSheet( 'media/blood.png', 2, 2 ),
            init: function( x, y, settings ) {
                this.parent( x, y, settings );

                var frameID = Math.round(Math.random()*this.totalColors) + (this.colorOffset * (this.totalColors+1));
                this.addAnim( 'idle', 0.2, [frameID] );
                this.vel.x = (Math.random() * 2 - 1) * this.vel.x;
                this.vel.y = (Math.random() * 2 - 1) * this.vel.y;
                this.idleTimer = new ig.Timer();
            },
            update: function(){
                if(this.idleTimer.delta() > this.lifetime){
                    this.kill();
                    return;
                }

                this.parent();
            }
        });
    }
)