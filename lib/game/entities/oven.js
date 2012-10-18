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
            animSheet: new ig.AnimationSheet('media/oven3.png', 77, 64),
            size: {x:77, y:64},
            offset: {x:0, y:0},
            flip: false,
            init: function( x, y, settings){
                this.parent( x, y, settings);
                this.addAnim('idleOven', 1, [0]);
                this.addAnim('testOven', 0.5, [0,1,2,3,4]);
            },

            update: function(){
                /////////////////
                // Movement
                ////////////////

                if(ig.input.pressed('testOven')){
                    this.currentAnim = this.anims.testOven;
                }

                this.currentAnim.flip.x = this.flip;
                this.parent();
            }
        });
    }
)