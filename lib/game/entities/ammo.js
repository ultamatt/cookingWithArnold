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
            type:null,
            gravity:0,
            type: ig.Entity.TYPE.B,
            checkAgainst: ig.Entity.TYPE.A,
            collides: ig.Entity.COLLIDES.PASSIVE,

            update: function(){},
            check: function(other){
                if(other instanceof EntityPlayer){
                    ig.game.toggleStats(this);
                }
            },
            nextLevel:function(){
                if(this.level) {
                    var levelName = this.level.replace(/ ^( Level)?(\ w)(\ w*)/, function( m, l, a, b ){
                        return a.toUpperCase() + b;
                    });
                    ig.game.loadLevelDeferred( ig.global['Level' + levelName] );
                }
            }
        });
    }
);
