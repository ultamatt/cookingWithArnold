ig.module(
    'game.entities.hud'
)
.requires(
    'impact.entity'
)
.defines(function(){
EntityHud = ig.Entity.extend({
    size: {x: 320, y: 20},
    zIndex:800,
    animSheet: new ig.AnimationSheet( 'media/HUD/hud2.png', 112, 48 ),
    collides: ig.Entity.COLLIDES.NEVER,
    gravityFactor: 0,
    init: function( x, y, settings ) {
        //this.addAnim( 'idle', 1, [0] );
        this.parent( x, y, settings );
        this.pos.x=ig.game.screen.x;
        this.pos.y=ig.game.screen.y;
    },
    update: function(){
        this.pos.x=ig.game.screen.x;
        this.pos.y=ig.game.screen.y;
        if(ig.input.mouse.y<=20)
        {
            //console.log('mouse zone');
        }
        else
        {
        
        }
        this.parent();
    },
    draw: function(){
        this.parent();
        // switch(ig.game.playmode)
        // {
        //     case "timeattack":
        //         ig.game.font.draw( 'Score: '+ig.game.score, 7, 5);
        //         ig.game.font.draw('Collected: '+ig.game.drops+"/"+ig.game.tdrops, 167, 5);
        //         var CurrentTimeValue = new Date(Math.round(ig.game.getEntitiesByType(EntityLevelstats)[0].currentTime*1000));
        //         ig.game.font.draw('Time: '+CurrentTimeValue.getMinutes()+'\''+CurrentTimeValue.getSeconds()+'\''+Math.round((CurrentTimeValue.getMilliseconds()/10)),7,220);
        //         break;
        //     case "story":
        //         ig.game.font.draw( 'Score: '+ig.game.score, 7, 5);
        //         ig.game.font.draw('Collected: '+ig.game.drops+"/"+ig.game.tdrops, 167, 5);
        //         var CurrentTimeValue = new Date(Math.round(ig.game.getEntitiesByType(EntityLevelstats)[0].currentTime*1000));
        //         break;
        // }
    }
});
});