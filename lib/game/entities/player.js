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
			
            //Player Attributes: 
            jump: 200,
            health: 20,
            weapon: 0,
            climbing: false, 
            forking: false, 

            //Deal with Player Input State
            input: null,
            weaponList: ["grenade","shotgun","antigriddle","emulsifier","fork"],
            forktime: 200,
            activeWeapon: "EntityBullet",
            totalWeapons: 5,
            gravity:1, 
            defaultGravity: 1,
            over_ladder: false,
            ladder: null,
            possible_land_on_entity: false,

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
            
            //Invincible 
            invincible:true,
            invincibleDelay:2,
            invincibleTimer:null,

            //Getting Hit 
            hit:true,
            hitDelay: 0.5,
            hitTimer:null,

            init: function( x, y, settings){
                ig.game.player = this;
                ig.game.respawnPosition = { x:x, y:y };

				//Gives us the chance to make a random arnold clone body
				parseInt(Math.random() * 100) % 2 == 1 ? 
					this.animSheet = this.animSheetOne :
					this.animSheet = this.animSheetTwo;

                //Setup My Sprite Sheet
                this.setupAnimation(this.weapon);

                //reset the important stuff
                this.resetStuff();

                //Make ourselves invincible
                this.makeInvincible();

                this.parent( x, y, settings);
            },

            resetStuff: function(){
                //Hackyness here to copy an object instead of doing straight up
                // assignment trying to reset the users' beginning ammo counts
                ig.game.ammo = JSON.parse(JSON.stringify(ig.game.ammoStart));

                //reset our timers for being hit or invincible. 
                this.invincibleTimer = new ig.Timer();
                this.hitTimer = new ig.Timer();
            },

            setupAnimation: function(offset){
                //Setup which weapon we have selected
                ig.game.weapon = this.weaponList[offset];

                //setup the animation sheet for whatever weapon we're using
                offset = offset * 9;
                this.addAnim('idle', 1, [0+offset]);
                this.addAnim('running', 0.15, [1+offset,2+offset,3+offset,4+offset]);
				this.addAnim('ducking', 1, [5+offset]);
				this.addAnim('falling', 0.4, [6+offset,7+offset]);
				this.addAnim('jumping', 1, [7+offset]);
                this.addAnim('lifting', 0.25, [48, 49]);
                this.addAnim('climbing', 0.25, [46, 47]);

				this.addAnim('forking', 0.5, [9+offset]);
                this.addAnim('hit', 0.5, [8+offset]);
                this.addAnim('die', 0.25, [8+offset, 50, 51]);
				
            },

            update: function(){
                // Handle input. ie 'left', 'up', etc.
                if(this.input === null){
                    this.stop();
                } else {
                    console.log("Input!" + this.input);
                    this.handle_movement_input(this.input);
                }

                // Disable gravity when over a ladder.
                if(this.over_ladder) this.gravity = 0;
                else this.gravity = this.defaultGravity;

                // Do not update climbing animation while still.
                if(this.climbing && this.input !== 'up' && this.input !== 'down'){
                    this.currentAnim.timer.pause();
                }
                    
                if(this.climbing && (this.input === 'up' || this.input === 'down')){
                    this.currentAnim.timer.unpause();
                }
                    

                this.parent();

                this.after_movement_and_collision();

                // Must receive input again for it to count.
                this.input = null;

                // Handle animations.
                if(!this.standing && this.anims.falling){
                    this.currentAnim = this.anims.falling;
                } else if(this.climbing && this.anims.climbing) {
                    this.currentAnim = this.anims.climbing;
                } else if(this.vel.x !== 0 && this.anims.running) {
                    this.currentAnim = this.anims.running;
                    this.currentAnim.flip.x = (this.vel.x > 0 ? true : false);
                } else if(this.anims.idle) {
                    this.currentAnim = this.anims.idle;
                    this.currentAnim.flip.x = !this.is_facing_left();
                }
            },

            handle_movement_input: function(direction) {
                var leftOrRight = direction === 'left' || direction === 'right';
                var upOrDown = direction === 'up' || direction === 'down';
                if (this.climbing && leftOrRight) {
                    // Getting off ladders.
                    this.jump_off_ladder(direction);
                } else if (leftOrRight && (this.standing || this.over_ladder)) {
                    // Running while atop ladders and on the ground.
                    this.set_velocity_by_direction(direction);
                } else if (leftOrRight && !this.standing) {
                    // Prevent moving horizontally by walking 
                    // over a ledge while holding key.
                    this.stop();
                } else if (this.climbing && 
                      ((direction === 'up' && this.at_top_of_ladder()) 
                    || (direction === 'down' && this.at_bottom_of_ladder()))){ 
                    // Getting off at the top and the bottom of ladders.
                    this.climbing = false;
                } else if (upOrDown && this.climbing) {
                    // Moving up and down ladders.
                    this.set_velocity_by_direction(direction);
                } else if (upOrDown && this.over_ladder) {
                    // Getting on to ladders.
                    this.mount_ladder();                    
                } else if (upOrDown && this.standing) {
                    // Prevent moving horizontally by tapping 
                    //  left or right and then holding up or down.
                    this.stop();
                }
            },

            stop: function() {
                this.vel.x = 0; // never move horizontally without input
                if(this.standing) { this.vel.y = 0; }// prevent climbing but allow falling
            },

            handleMovementTrace: function( res ) {
                this.parent(res);
                if(this.over_ladder) this.standing = true;
            },

            after_movement_and_collision: function() {
                // Handle smoothly getting off ladder.
                if(this.climbing && this.input === 'down' && this.at_bottom_of_ladder()) {
                    this.climbing = false;
                } else if(this.climbing && this.input === 'up' && this.at_top_of_ladder()) {
                    this.pos.y = this.ladder.pos.y - this.size.y;
                    this.vel.y = 0;
                    this.climbing = false;
                }

                // If position has changed, recalculate if over ladder.
                if(this.last.x !== this.pos.x || this.last.y !== this.pos.y) {
                    this.check_for_ladder();
                }

                // Handle landing on top of a ladder, and stopping immediately!
                // Just landed on a ladder.
                if(this.possible_land_on_entity && this.standing && this.over_ladder) this.pos.y = this.ladder.pos.y - this.size.y;
                // Flag possible ladder landing situation.
                this.flag_possible_land_on_entity();
            },

            flag_possible_land_on_entity: function() {
                this.possible_land_on_entity = !this.standing;
            },

            check_for_ladder: function() {
                this.ladder = null;
                this.over_ladder = false;
                this.size.y += 1; // because 1px under still counts
                var ladders = ig.game.getEntitiesByType(EntityClimbTrigger);
                for(var i=0; i<ladders.length; i++) {
                    if(this.touches(ladders[i])) {
                        this.ladder = ladders[i];
                        this.over_ladder = true;
                        break;
                    }
                }
                this.size.y -= 1;
            },

            at_top_of_ladder: function() {
                return this.pos.y + this.size.y - 2 <= this.ladder.pos.y;
            },

            at_bottom_of_ladder: function() {
                var velocity = { x: 0, y: 1 };
                var result = ig.game.collisionMap.trace(this.pos.x, this.pos.y, velocity.x, velocity.y, this.size.x, this.size.y);
                var stopped_by_floor = result.collision.y;
                var out_of_ladder = this.pos.y >= this.ladder.pos.y + this.ladder.size.y;
                return stopped_by_floor || out_of_ladder;
            },

            mount_ladder: function() {
                this.pos.x = this.ladder.pos.x + this.ladder.size.x/2 - this.size.x/2; // align player over ladder
                this.vel.x = 0; // prevents possible case of not being centered
                this.climbing = true;
            },

            jump_off_ladder: function(side) {
                this.stop();
                if(!this.can_move_in_direction(side)) return;
                this.pos.x += ig.game.collisionMap.tilesize * (side === 'left' ? -1 : 1);
                this.climbing = false;
                // Need to know there is no ladder to prevent walking on air.
                this.check_for_ladder();
            },

            set_velocity_by_direction: function(direction) {
                this.vel.x = 0;
                this.vel.y = 0;
                if(direction === 'left' || direction === 'right')
                    this.vel.x = ( direction === 'left' ? -1 : 1 ) * this.speed;
                if(direction === 'up' || direction === 'down')
                    this.vel.y = ( direction === 'up' ? -1 : 1 ) * this.speed;
            },


            stop: function() {
                this.vel.x = 0; // never move horizontally without input
                if(this.standing) this.vel.y = 0; // prevent climbing but allow falling
            },

            is_facing_left: function() {
                if(this.anims.running) return this.anims.running.flip.x === false;
                else return false;
            },

            can_move_in_direction: function(direction) {
                var velocity = { x: 0, y: 0 };
                // Left and Right check a few pixels further than immediately beside,
                // because when on a ladder, entity is a few pixels from edge of tile.
                if     (direction === 'left')  velocity.x = -1 * (this.offset.x + 1);
                else if(direction === 'right') velocity.x =  1 * (this.offset.x + 1);
                else if(direction === 'up')    velocity.y = -1;
                else if(direction === 'down')  velocity.y =  1;
                var result = ig.game.collisionMap.trace(this.pos.x, this.pos.y, velocity.x, velocity.y, this.size.x, this.size.y);
                if(direction === 'left' || direction === 'right') return !result.collision.x;
                else return !result.collision.y;
            },
     //            var accel = this.standing ? this.accelGround : this.accelAir;
     //            if(!this.hit || this.invincible){
     //                this.checkClimbing();
     //                if(this.climbing){
     //                    this.gravity = 0;
     //                    if(this.input !== 'climb' && this.input !== 'duck'){
     //                        this.currentAnim.timer.pause();
     //                    } else if(this.input === 'climb' || this.input === 'duck'){
     //                        this.currentAnim.timer.unpause();
     //                    }
                            
     //                    if(ig.input.state('climb')) {
     //                        this.vel.y = -10;
     //                        this.lastInput = 'climb';
     //                    } else if(ig.input.state('duck')){
     //                        this.vel.y = 10;
     //                        this.lastInput = 'duck';
     //                    } else{
     //                        this.vel.y = 0;
     //                    }
     //                } else {
     //                    this.gravity = 1;
     //                    if(ig.input.state('left')){
     //                        this.accel.x = -accel;
     //                        this.flip = true;
    	// 					this.lastInput = 'left';
     //                    }
     //                    else if(ig.input.state('right')){
     //                        this.accel.x = accel;
     //                        this.flip = false;
    	// 					this.lastInput = 'right';
     //                    }
     //                    else{
     //                        this.accel.x = 0;
     //                    }

     //                    //Jumping Functionality
     //                    if(this.standing
     //                        && ig.input.pressed('jump')){
     //                        this.vel.y = -this.jump;
     //                        this.jumpSFX.play();
    	// 					this.lastInput = 'jump';
     //                    } 

     //                    //Weapon Swappin' Functionality!
     //                    if(ig.input.pressed('switch')){
    	// 					this.lastInput = 'switch';
     //                        this.weapon ++;
     //                        this.weapon = this.weapon % this.totalWeapons;
     //                        switch(this.weapon){
     //                            case(0):
     //                                this.activeWeapon = "EntityBullet";
     //                                break;
     //                            case(1):
     //                                this.activeWeapon = "EntityGrenade";
     //                                break;
    	// 						case(2):
    	// 							this.activeWeapon = "EntityAntimatterStream";
    	// 							break;
     //                            default:
     //                                this.activeWeapon = "EntityBullet";
     //                                break;
     //                        }
     //                        this.setupAnimation(this.weapon);
     //                    }

     //                    //Shootin Functionality! PEW PEW
     //                    if(ig.input.state('shoot')){
    	// 					var y = this.pos.y;
    	// 					if(ig.input.state('duck')){
    	// 						y += 6;
    	// 					}
     //                        switch(this.weapon){
     //                            case(0):
     //                                    //GrEnAdE!
    	// 								if(ig.input.pressed('shoot') && ig.game.ammo["grenade"] > 0){
     //                                        ig.game.ammo["grenade"]--;
     //                                        ig.game.stats.shots ++;
     //                                    	ig.game.spawnEntity( EntityGrenade, this.pos.x, y, {flip:this.flip});
    	// 								}
     //                                break;
    	// 						case(1):
     //                                    //SPATULA!
    	// 								if(ig.input.pressed('shoot') && ig.game.ammo["shotgun"] > 0){
     //                                        ig.game.ammo["shotgun"]--;
     //                                        ig.game.stats.shots ++;
     //                                    	ig.game.spawnEntity( EntityBullet, this.pos.x  + bulletSpread(), y + bulletSpread(), {flip:this.flip});
     //                                    	ig.game.spawnEntity( EntityBullet, this.pos.x  + bulletSpread(), y + bulletSpread(), {flip:this.flip});
     //                                    	ig.game.spawnEntity( EntityBullet, this.pos.x  + bulletSpread(), y + bulletSpread(), {flip:this.flip});
     //                                    	this.shootSFX.play();
    	// 								}
     //                                break;
    	// 						case(2):
    	// 								//ANTIGRIDDLE
     //                                    if( ig.game.ammo["antigriddle"] > 0 ){
     //                                        ig.game.ammo["antigriddle"]--;
     //                                        ig.game.stats.shots ++;
     //    									ig.game.spawnEntity( EntityAntimatterStream, this.pos.x  + bulletSpread(), y + bulletSpread(), {flip:this.flip});
     //    									ig.game.spawnEntity( EntityAntimatterStream, this.pos.x  + bulletSpread(), y + bulletSpread(), {flip:this.flip});
     //    									ig.game.spawnEntity( EntityAntimatterStream, this.pos.x  + bulletSpread(), y + bulletSpread(), {flip:this.flip});
     //    									//this.shootSFX.play();
     //                                    }
     //                                break;
    	// 						case(3):
     //                                    //EMULSIFIER!
    	// 								if(ig.input.pressed('shoot') && ig.game.ammo["emulsifier"] > 0){
     //                                        ig.game.ammo["emulsifier"]--;
     //                                        ig.game.stats.shots ++;
     //                                    	ig.game.spawnEntity( EntityEmulsifierStream, this.pos.x, y, {flip:this.flip});

     //                                    	this.laserSFX.play();
    	// 								}
     //                                break;
    	// 						case(4):
     //                                    //FORK IT!
    	// 								if(ig.input.pressed('shoot')){
    	// 									this.currentAnim = this.anims.fork;
    	// 									this.forking = true;
    	// 									var _this = this;
    	// 									setTimeout(function(){_this.forking = false;}, _this.forktime);
    	// 								}
     //                                break;
     //                        }

     //                    }
     //                }

     //                /////////////////
     //                // Animation
     //                ////////////////

					// if(ig.input.state('duck')){
					// 	this.lastInput = 'duck';
     //                	this.currentAnim = this.anims.duck;
     //               	} else if(!this.forking){
     //                    if( this.vel.y < 0){
     //                        this.currentAnim = this.anims.jump;
     //                    }
     //                    else if( this.vel.y > 0){
     //                        this.currentAnim = this.anims.fall;
     //                    }
     //                    else if( this.vel.x != 0){
     //                        this.currentAnim = this.anims.run;
     //                    }
     //                    else if(!ig.input.pressed('duck')){
     //                        this.currentAnim = this.anims.idle;
     //                    }
     //                }

					// if(ig.input.state('death')){
					// 	//this.currentAnim = this.anims.die;
					// 	this.kill();
					// } else if(ig.input.state('climb')){
					// 	this.currentAnim = this.anims.climb
					// } else if(ig.input.state('lift')){
					// 	this.currentAnim = this.anims.lift
					// } else if(ig.input.state('invincible')){
     //                    if(this.invincible && this.lastInput != 'invincible'){ 
     //                        this.invincibleDelay = 2; 
     //                        this.makeInvincible();
     //                    } else {
     //                        this.lastInput = 'invincible';
     //                        this.invincibleDelay = 100000000000000;
     //                        this.makeInvincible();    
     //                    }
     //                }
     //            }
     //            this.currentAnim.flip.x = this.flip;

     //            //Are we still invincible?
     //            if(this.invincibleTimer.delta() > this.invincibleDelay)
     //                this.invincible = false;

     //            if(this.hitTimer.delta() > this.hitDelay)
     //                this.hit = false;

     //            this.parent();
     //        },

            checkClimbing: function() {
                //this.ladder = null;
                this.climbing = false;
                this.size.y += 1; // because 1px under still counts
                var ladders = ig.game.getEntitiesByType(EntityClimbTrigger);
                for(var i=0; i<ladders.length; i++) {
                    if(this.touches(ladders[i])) {
                        //this.ladder = ladders[i];
                        this.climbing = true;
                        break;
                    }
                }
                if(this.climbing){
                    console.log("Wanna Climb?");
                } else {
                    console.log("No Climbing!");
                }
                this.size.y -= 1;
            },

            kill: function(){
                this.hit = true;
                this.hitTimer.reset();
                this.currentAnim = this.anims.die;
                this.deathSFX.play();

                this.parent();

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
                other.receiveDamage(10, this);
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
            }        
        });

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
