//Player Character in the game
ig.module(
    'game.entities.ammo'
)

    .requires(
    'impact.entity'
)

    .defines(
    function(){
        EntityAmmo = ig.Entity.extend({
            animSheet: new ig.AnimationSheet('media/WEAPONS/ammo.png', 12, 12),
            size: {x:12, y:12},
            offset: {x:0, y:0},
            floatTimer: null,
            floatDelay: .5,
            floatPolarity: true,
            floatRandomPolarity: true,
            ammoType: "fork",
            ammoAmount: 1,
            checkAgainst: ig.Entity.TYPE.A,
            init: function( x, y, settings ) {
                var offset = 0;
                this.ammoType = settings.ammoType;
                if(this.ammoType == "grenade"){ offset = 0; this.ammoAmount = 3;}
                else if(this.ammoType == "shotgun"){ offset = 1;  this.ammoAmount = 24; }
                else if(this.ammoType == "antigriddle"){ offset = 2;  this.ammoAmount = 100; }
                else if(this.ammoType == "emulsifier"){ offset = 3;  this.ammoAmount = 3;}
                else if(this.ammoType == "fork"){ offset = 4;  this.ammoAmount = 1;}
                this.addAnim( 'idle', 1, [0 + offset] );
                this.floatTimer = new ig.Timer();
                this.parent( x, y, settings );
            },
            update: function(){
                if(this.floatTimer.delta() > this.floatDelay) {
                    this.floatTimer = new ig.Timer();
                    this.floatPolarity = !this.floatPolarity;
                    this.floatRandomPolarity = parseInt(Math.random() * 100) % 2;
                    this.floatRandomPolarity = this.floatRandomPolarity == 1 ? -1 : 1;
                }
                var howMuch = this.floatPolarity == true ? -1 : 1;
                this.pos.y += howMuch * this.floatTimer.delta();
                this.pos.x += this.floatRandomPolarity * this.floatTimer.delta();
            },
            check: function(other){
                if(other instanceof EntityPlayer){
                    ig.game.ammo[this.type] +=  this.ammoAmount;
                    this.kill();
                }
            }
        });
    }
);
