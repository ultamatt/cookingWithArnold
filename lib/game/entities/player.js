//Player Character in the game
ig.module(
    'game.entities.player'
)

.requires(
    'impact.entity',
    'game.utils.entityUtils',
    'impact.sound'
)

.defines(
    function(){
        EntityPlayer = ig.Entity.extend({
			//Weltmeister helps
			_wmDrawBox: true,
			_wmBoxColor: 'rgba( 255, 0, 0, 0.7)',

            //Animation Properties
            animSheet: null, 
			animSheetOne: new ig.AnimationSheet('media/CHARACTERS/PlayerArnold1.png', 40, 50),
			animSheetTwo: new ig.AnimationSheet('media/CHARACTERS/PlayerArnold2.png', 40, 50),
            sheetSwap: 0,
            size: {x:22, y:46},
            offset: {x:8, y:0},
            flip: false,
			lastInput: null,

            //Collision Properties
            type: ig.Entity.TYPE.A,
            checkAgainst: ig.Entity.TYPE.NONE,
            collides: ig.Entity.COLLIDES.PASSIVE,

            //Physics Properties
            maxVel:{x:100, y:300},
            friction: {x: 600, y:0},
            accelGround:400,
            accelAir:200,

            //Sound Properties
            jumpSFX: new ig.Sound('media/AUDIO FX/jump.*'),
			laserSFX: new ig.Sound('media/AUDIO FX/shoot.*'),
            shootSFX: new ig.Sound('media/AUDIO FX/shotgun.*'),
            deathSFX: new ig.Sound('media/AUDIO FX/death.*'),

            //Player Basic Attributes
            jump: 200,
            health: 20,
            weapon: 0,
			forking: false,
			forktime: 200,
            activeWeapon: "EntityBullet",
            totalWeapons: 5,
            startPosition: null,
            invincible:true,
            invincibleDelay:2,
            invincibleTimer:null,

            hit:true,
            hitDelay: 0.5,
            hitTimer:null,

            init: function( x, y, settings){
                ig.game.player = this;
                
				
				//Gives us the chance to make a random arnold clone body
				if(parseInt(Math.random() * 100) % 2 == 1){
					this.animSheet = this.animSheetOne;
				} else {
					this.animSheet = this.animSheetTwo;
				}

                this.setupAnimation(this.weapon);
                this.startPosition = { x:x, y:y };
                this.invincibleTimer = new ig.Timer();
                this.hitTimer = new ig.Timer();
                this.makeInvincible();
                this.parent( x, y, settings);
            },

            setupAnimation: function(offset){
                offset = offset * 9;
                this.addAnim('idle', 1, [0+offset]);
                this.addAnim('run', 0.15, [1+offset,2+offset,3+offset,4+offset]);
				this.addAnim('duck', 1, [5+offset]);
				this.addAnim('fall', 0.4, [6+offset,7+offset]);
				this.addAnim('jump', 1, [7+offset]);
                this.addAnim('hit', 0.5, [8+offset]);
				this.addAnim('fork', 0.5, [9+offset]);
                this.addAnim('die', 0.25, [8+offset, 50, 51]);
				this.addAnim('lift', 0.25, [48, 49]);
				this.addAnim('climb', 0.25, [46, 47]);

            },

            update: function(){
                /////////////////
                // Movement
                ////////////////

                //Handle Moving Left or Right

                var accel = this.standing ? this.accelGround : this.accelAir;
                if(!this.hit || this.invincible){

                    if(ig.input.state('left')){
                        this.accel.x = -accel;
                        this.flip = true;
						this.lastInput = 'left';
                    }
                    else if(ig.input.state('right')){
                        this.accel.x = accel;
                        this.flip = false;
						this.lastInput = 'right';
                    }
                    else{
                        this.accel.x = 0;
                    }

                    //Jumping Functionality
                    if(this.standing
                        && ig.input.pressed('jump')){
                        this.vel.y = -this.jump;
                        this.jumpSFX.play();
						this.lastInput = 'jump';
                    } 

                    //Weapon Swappin' Functionality!
                    if(ig.input.pressed('switch')){
						this.lastInput = 'switch';
                        this.weapon ++;
                        this.weapon = this.weapon % this.totalWeapons;
                        switch(this.weapon){
                            case(0):
                                this.activeWeapon = "EntityBullet";
                                break;
                            case(1):
                                this.activeWeapon = "EntityGrenade";
                                break;
							case(2):
								this.activeWeapon = "EntityAntimatterStream";
								break;
                            default:
                                this.activeWeapon = "EntityBullet";
                                break;
                        }
                        this.setupAnimation(this.weapon);
                    }

                    //Shootin Functionality! PEW PEW
                    if(ig.input.state('shoot')){
						var y = this.pos.y;
						if(ig.input.state('duck')){
							y += 6;
						}
                        switch(this.weapon){
                            case(0):
                                    //GrEnAdE!
									if(ig.input.pressed('shoot')){
                                        ig.game.stats.shots ++;
                                    	ig.game.spawnEntity( EntityGrenade, this.pos.x, y, {flip:this.flip});
									}
                                break;
							case(1):
                                    //SPATULA!
									if(ig.input.pressed('shoot')){
                                        ig.game.stats.shots ++;
                                    	ig.game.spawnEntity( EntityBullet, this.pos.x  + bulletSpread(), y + bulletSpread(), {flip:this.flip});
                                    	ig.game.spawnEntity( EntityBullet, this.pos.x  + bulletSpread(), y + bulletSpread(), {flip:this.flip});
                                    	ig.game.spawnEntity( EntityBullet, this.pos.x  + bulletSpread(), y + bulletSpread(), {flip:this.flip});
                                    	this.shootSFX.play();
									}
                                break;
							case(2):
									//ANTIGRIDDLE
                                    ig.game.stats.shots ++;
									ig.game.spawnEntity( EntityAntimatterStream, this.pos.x  + bulletSpread(), y + bulletSpread(), {flip:this.flip});
									ig.game.spawnEntity( EntityAntimatterStream, this.pos.x  + bulletSpread(), y + bulletSpread(), {flip:this.flip});
									ig.game.spawnEntity( EntityAntimatterStream, this.pos.x  + bulletSpread(), y + bulletSpread(), {flip:this.flip});
									//this.shootSFX.play();
                                break;
							case(3):
                                    //EMULSIFIER!
									if(ig.input.pressed('shoot')){
                                        ig.game.stats.shots ++;
                                    	ig.game.spawnEntity( EntityEmulsifierStream, this.pos.x, y, {flip:this.flip});

                                    	this.laserSFX.play();
									}
                                break;
							case(4):
                                    //FORK IT!
									if(ig.input.pressed('shoot')){
										this.currentAnim = this.anims.fork;
										this.forking = true;
										var _this = this;
										setTimeout(function(){_this.forking = false;}, _this.forktime);
									}
                                break;
                        }

                    }

                    /////////////////
                    // Animation
                    ////////////////

					if(ig.input.state('duck')){
						this.lastInput = 'duck';
                    	this.currentAnim = this.anims.duck;
                   	} else if(!this.forking){
                        if( this.vel.y < 0){
                            this.currentAnim = this.anims.jump;
                        }
                        else if( this.vel.y > 0){
                            this.currentAnim = this.anims.fall;
                        }
                        else if( this.vel.x != 0){
                            this.currentAnim = this.anims.run;
                        }
                        else if(!ig.input.pressed('duck')){
                            this.currentAnim = this.anims.idle;
                        }
                    }

					if(ig.input.state('death')){
						//this.currentAnim = this.anims.die;
						this.kill();
					} else if(ig.input.state('climb')){
						this.currentAnim = this.anims.climb
					} else if(ig.input.state('lift')){
						this.currentAnim = this.anims.lift
					} else if(ig.input.state('invincible')){
                        if(this.invincible && this.lastInput != 'invincible'){ 
                            console.log("Vincable");
                            this.invincibleDelay = 2; 
                            this.makeInvincible();
                        } else {
                            this.lastInput = 'invincible';
                            console.log("Invincible");
                            this.invincibleDelay = 100000000000000;
                            this.makeInvincible();    
                        }
                    }
                }
                this.currentAnim.flip.x = this.flip;

                //Are we still invincible?
                if(this.invincibleTimer.delta() > this.invincibleDelay)
                    this.invincible = false;

                if(this.hitTimer.delta() > this.hitDelay)
                    this.hit = false;

                this.parent();
            },

            kill: function(){
                this.hit = true;
                this.hitTimer.reset();
                this.currentAnim = this.anims.die;
                this.deathSFX.play();
                this.parent();
                ig.game.respawnPosition = this.startPosition;
                var settings = {
					size: this.size,
					offset: this.offset,
					animSheet: this.animSheet,
					animSheetFrameArray: [8+(9*this.weapon), 50, 51],
					callback: this.onDeath
				};
				ig.game.spawnEntity(EntityDeath, this.pos.x, this.pos.y, settings);

            },

            onDeath: function(){
                //console.log("On Death Lives Left: " + ig.game.lives);
                ig.game.stats.deaths ++;
                ig.game.lives --;
                if(ig.game.lives < 0){
                    ig.game.gameOver();
                } else {
                    var x = ig.game.respawnPosition.x;
                    var y = ig.game.respawnPosition.y;
                    ig.game.spawnEntity(EntityPlayer, x, y);                    
                }
            },

			receiveDamage: function(amount, from){
                if(this.invincible || this.hit)
                    return;

				if(this.forking){
					from.receiveDamage(1000, this);
					return;
				}
                    this.hit = true;
                    this.hitTimer.reset();
                    this.currentAnim = this.anims.hit;
                    this.vel.x = from.vel.x * 5;
                    this.vel.y = -5;

                this.parent(amount, from);
            },

            draw: function(){
                if(this.invincible
                    && this.currentAnim != this.anims.hit){
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

		EntityDeath = ig.Entity.extend({
			lifetime: 0.3,
			callback: null,
			type: ig.Entity.TYPE.NONE,
			collides: ig.Entity.COLLIDES.NEVER,
			gravityFactor: 0,

			init: function (x, y, settings) {
				this.parent(x, y, settings);
				this.addAnim('die', 0.10, settings.animSheetFrameArray, true);
				this.idleTimer = new ig.Timer();
			},

            update: function(){
                if(this.idleTimer.delta() > this.lifetime){
					ig.game.spawnEntity(EntityGore, this.pos.x, this.pos.y, { callback: this.callback });
               		ig.game.spawnEntity(EntityGore, this.pos.x, this.pos.y + 27);
              		ig.game.spawnEntity(EntityGore, this.pos.x, this.pos.y + 50);
					this.kill();
					//if(this.callBack)
                        //this.callBack();
                    return;
                }
				this.parent();
			}
		});

        EntityGore = ig.Entity.extend({
            lifetime: 1,
            callback: null,
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
                    if(this.callback)
	                	this.callback();
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
            animSheet: new ig.AnimationSheet( 'media/EFFECTS/blood.png', 2, 2 ),
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
		
		EntityBullet = ig.Entity.extend({
            size:{x:5, y:3},
            animSheet:new ig.AnimationSheet('media/WEAPONS/bullet.png', 5, 3),
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
            animSheet: new ig.AnimationSheet('media/WEAPONS/grenade.png', 8, 8),
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
            },

            kill: function(){
                for(var i = 0; i < 20; i++){
                    ig.game.spawnEntity(EntityGrenadeParticle, this.pos.x, this.pos.y);
                }
                this.parent();
            }
        });


		EntityGrenadeParticle = ig.Entity.extend({
            size: {x:1, y:1},
            maxVel: {x:160, y:200},
            lifetime: 1,
            fadetime: 1,
            bounciness :0.3,
            vel:{x:40, y:50},
            friction: {x:20, y:20},
            checkAgainst: ig.Entity.TYPE.B,
            collides: ig.Entity.COLLIDES.LITE,
            animSheet: new ig.AnimationSheet( 'media/EFFECTS/explosion.png', 1, 1),

            init: function(x, y, settings){
                this.parent(x, y, settings);
                this.vel.x = (Math.random() * 4 - 1) * this.vel.x;
                this.vel.y = (Math.random() * 10 - 1) * this.vel.y;
                this.idleTimer = new ig.Timer();
                var frameID = Math.round(Math.random()*7);
                this.addAnim('idle', 0.2, [frameID]);
            },

            update: function(){
                if(this.idleTimer.delta() > this.lifetime){
                    this.kill();
                    return;
                }
                this.currentAnim.alpha = this.idleTimer.delta().map( this.lifetime - this.fadetime, this.lifetime, 1, 0);
                this.parent();
            }
        });

		EntityAntimatterStream = ig.Entity.extend({
            size: {x: 10, y:1},
            maxVel: {x:200, y:200},
			lifetime: 3,
            fadetime: 2,
            bounciness: 1,
			gravityFactor: 0,
            vel:{x:200, y:0},
            friction: {x:0, y:0},

            type: ig.Entity.TYPE.NONE,
            checkAgainst: ig.Entity.TYPE.BOTH,
            collides: ig.Entity.COLLIDES.PASSIVE,
			animSheet: new ig.AnimationSheet('media/EFFECTS/water.png', 1, 1),

            init: function(x, y, settings){
                this.parent(x + (settings.flip ? -16 : 32), y+27, settings);
                this.vel.x = this.accel.x = (settings.flip ? -this.maxVel.x : this.maxVel.x);
                this.vel.y = 0;
				this.idleTimer = new ig.Timer();
                var frameID = Math.round(Math.random()*7);
                this.addAnim('idle', 0.2, [frameID]);
            },

            check: function(other){
                other.receiveDamage(1, this);
                this.kill();
            },

            handleMovementTrace: function( res ){
                this.parent( res );
                if(res.collision.x){
                    var yVel = parseInt(Math.random() * 100);
                    var yPosNeg = parseInt(Math.random() * 100) % 2;
                    var yPolarity = yPosNeg == 1 ? -1 : 1;
                    this.vel.y = yVel * yPolarity;
                }
            },

            update: function(){
                if(this.idleTimer.delta() > this.lifetime){
                    this.kill();
                    return;
                }
                this.currentAnim.alpha = this.idleTimer.delta().map( this.lifetime - this.fadetime, this.lifetime, 1, 0);
                this.parent();
            }        });

		//For when you need to Emulsify your opponents
		EntityEmulsifierStream = ig.Entity.extend({
            size: {x: 2, y:2},
            maxVel: {x:200, y:200}, 
			gravityFactor: 0,
            vel:{x:200, y:0},
            friction: {x:0, y:0},
			lifetime: 2, 
			type: ig.Entity.TYPE.NONE,
            checkAgainst: ig.Entity.TYPE.B,
            collides: ig.Entity.COLLIDES.PASSIVE,
			animSheet: new ig.AnimationSheet('media/EFFECTS/blood.png', 2, 2),

            init: function(x, y, settings){
                this.parent(x + (settings.flip ? -16 : 32), y+27, settings);
                this.vel.x = this.accel.x = (settings.flip ? -this.maxVel.x : this.maxVel.x);
                this.vel.y = 0;
				this.idleTimer = new ig.Timer();
				var frameID = Math.round(Math.random()*7);
                this.addAnim('idle', 0.2, [frameID]);
            },

            check: function(other){
                //other.receiveDamage(1, this);
                this.kill();
            },


            update: function(){
                if(this.idleTimer.delta() > this.lifetime){
                    this.kill();
                    return;
                }

                this.parent();
            },

			kill: function(){
					for(var i = 0; i < 20; i++){
						ig.game.spawnEntity(EntityEmulsifierParticle, this.pos.x, this.pos.y);
					}
                	this.parent();

            }

        });

		 EntityEmulsifierParticle = ig.Entity.extend({
            size: {x:1, y:1},
            maxVel: {x:200, y:200},
            lifetime: 2,
            fadetime: 1,
            bounciness: 0.5,
			gravityFactor: 0.5,
            friction:{x:20, y:20},

			type:ig.Entity.TYPE.NONE,
			checkAgainst:ig.Entity.TYPE.B,
            collides:ig.Entity.COLLIDES.PASSIVE,

			colorOffset: 0,
            totalColors: 7,
            animSheet: new ig.AnimationSheet( 'media/EFFECTS/explosion.png', 1, 1),
            init: function( x, y, settings ) {
                this.parent( x, y, settings );

                var frameID = Math.round(Math.random()*this.totalColors) + (this.colorOffset * (this.totalColors+1));
                this.addAnim( 'idle', 0.2, [frameID] );
                this.vel.x = (Math.random() * 200 - 100) + this.vel.x;
                this.vel.y = (Math.random() * 200 - 100) + this.vel.y;
                this.idleTimer = new ig.Timer();
            },
			check: function(other){
                other.receiveDamage(1, this);
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
);
