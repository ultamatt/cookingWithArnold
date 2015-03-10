//Player Character in the game
ig.module(
    'game.entities.talkingHead'
)

    .requires(
    'impact.entity'
)

    .defines(
    function(){
        EntityTalkingHead = ig.Entity.extend({
            animSheet: new ig.AnimationSheet('media/CHARACTERS/mattHead.png', 32, 32),
            size: {x:16, y:28},
            offset: {x:4, y:2},
            flip: false,
            maxVel:{x:100, y:150},
            friction: {x: 600, y:0},
            accelGround:400,
            accelAir:200,
            jump: 200,
            init: function( x, y, settings){
                this.parent( x, y, settings);
                this.addAnim('nothing', 1, [0]);
                this.addAnim('talk', 0.07, [0,1,2,3,4,5]);
                this.addAnim('blink', 1, [6]);
                this.addAnim('question', 1, [7]);
                this.addAnim('angry', 1, [8]);
                this.addAnim('love', 1, [9]);
            },

            update: function(){
                /////////////////
                // Movement
                ////////////////

                /////////////////
                // Animation
                ////////////////
                if(ig.input.pressed('talk')){
                    if(this.currentAnim =+ this.anims.talk)
                        this.currentAnim = this.anims.nothing;
                    else
                        this.currentAnim = this.anims.talk;
                }

                if(ig.input.pressed('blink')){
                    this.currentAnim = this.anims.blink;
                }

                if(ig.input.pressed('question')){
                    this.currentAnim = this.anims.question;
                }

                if(ig.input.pressed('angry')){
                    this.currentAnim = this.anims.angry;
                }

                if(ig.input.pressed('love')){
                    this.currentAnim = this.anims.love;
                }

                this.currentAnim.flip.x = this.flip;
                this.parent();
            }
        });
    }
)
