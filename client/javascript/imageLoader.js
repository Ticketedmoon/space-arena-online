export default class ImageLoader {

    loadAnimationImageSets(self) {
        this.loadBackgroundAnimationImageSet(self);
        this.loadLaunchAnimationImageSet(self);
        this.loadBoostAnimationImageSet(self);
        this.loadLaserImageSet(self);
        this.loadAmmoImageSet(self);
    }

    loadBackgroundAnimationImageSet(self) {
        self.load.path = 'assets/background/';

        // background animation sprites
        self.load.image('background_anim_1', 'background_0.png');
        self.load.image('background_anim_2', 'background_1.png');
        self.load.image('background_anim_3', 'background_2.png');
        self.load.image('background_anim_4', 'background_3.png');
        self.load.image('background_anim_5', 'background_4.png');
        self.load.image('background_anim_6', 'background_5.png');
        self.load.image('background_anim_7', 'background_6.png');
        self.load.image('background_anim_8', 'background_7.png');
    }

    loadLaunchAnimationImageSet(self) {
        self.load.path = 'assets/player/';

        // Player animation sprites
        self.load.image('player_anim_1', 'player_0.png');
        self.load.image('player_anim_2', 'player_1.png');
        self.load.image('player_anim_3', 'player_2.png');
        self.load.image('player_anim_4', 'player_3.png');
        self.load.image('player_anim_5', 'player_4.png');
        self.load.image('player_anim_6', 'player_5.png');
        self.load.image('player_anim_7', 'player_6.png');
        self.load.image('player_anim_8', 'player_7.png');
    }

    loadBoostAnimationImageSet(self) {
         // Engine Thrusters animation sprites
         self.load.image('player_boost_anim_1', 'player_0_boost.png');
         self.load.image('player_boost_anim_2', 'player_1_boost.png');
         self.load.image('player_boost_anim_3', 'player_2_boost.png');
         self.load.image('player_boost_anim_4', 'player_3_boost.png');
         self.load.image('player_boost_anim_5', 'player_4_boost.png');
         self.load.image('player_boost_anim_6', 'player_5_boost.png');
         self.load.image('player_boost_anim_7', 'player_6_boost.png');
         self.load.image('player_boost_anim_8', 'player_7_boost.png');
    }

    loadLaserImageSet(self) {
        self.load.path = 'assets/projectiles/';
        self.load.image('player_laser_shoot_1', 'beam_0.png');
        self.load.image('player_laser_shoot_2', 'beam_1.png');
        self.load.image('player_laser_shoot_3', 'beam_2.png');
        self.load.image('player_laser_shoot_4', 'beam_3.png');
        self.load.image('player_laser_shoot_5', 'beam_4.png');
    }

    loadAmmoImageSet(self) {
        self.load.path = 'assets/ammo/';
        self.load.image('ammo_full', 'ammo_full.png');
    }
}