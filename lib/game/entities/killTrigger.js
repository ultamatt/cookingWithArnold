ig.module(
	'game.entities.killTrigger'
)
.requires(
	'impact.entity'
)
.defines(function(){
	EntityKillTrigger = ig.Entity.extend({
		_wmDrawBox: true,
		_wmBoxColor: 'rgba( 255, 0, 0, 0.7)',
		size: {x:8, y:8},
		checkAgainst: ig.Entity.TYPE.A,
		update: function(){},
		check: function(other){
			if(other instanceof EntityPlayer){
				other.kill()
			}
		}
	});
});
