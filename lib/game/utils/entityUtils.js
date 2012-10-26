ig.module( 'game.utils.entityUtils' )
    .requires(
    )

    .defines(
        function(){
            bulletSpread = function(){
                return (Math.random() * 5) - 2;
            }
    });