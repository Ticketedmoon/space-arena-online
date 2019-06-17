export default class AnimationManager {

    initializeAnimationGroup(self) {
        this.backgroundAnim = this.initializeBackgroundAnimation(self);
        this.launchAnim = this.initializeLaunchAnimation(self);
        this.boostAnim = this.initializeBoostAnimation(self);
        this.bulletAnim = this.initializeBulletAnimation(self);
    }

    initializeLaunchAnimation(self) {
        // Normal Launch Animation
        return self.anims.create({
            key: 'launch',
            frames: [
                { key: 'player_anim_1' },
                { key: 'player_anim_2' },
                { key: 'player_anim_3' },
                { key: 'player_anim_4' },
                { key: 'player_anim_5' },
                { key: 'player_anim_6' },
                { key: 'player_anim_7' },
                { key: 'player_anim_8', duration: 10 }
            ],
            frameRate: 16,
            repeat: -1
        });
    }

    initializeBoostAnimation(self) {
        // Engine Thruster Boost Animation
        return self.anims.create({
            key: 'boost',
            frames: [
                { key: 'player_boost_anim_1' },
                { key: 'player_boost_anim_2' },
                { key: 'player_boost_anim_3' },
                { key: 'player_boost_anim_4' },
                { key: 'player_boost_anim_5' },
                { key: 'player_boost_anim_6' },
                { key: 'player_boost_anim_7' },
                { key: 'player_boost_anim_8', duration: 10 }
            ],
            frameRate: 16,
            repeat: -1
        });
    }

    initializeBackgroundAnimation(self) {
         // Background Image
         return self.anims.create({
            key: 'load',
            frames: [
                { key: 'background_anim_1' },
                { key: 'background_anim_2' },
                { key: 'background_anim_3' },
                { key: 'background_anim_4' },
                { key: 'background_anim_5' },
                { key: 'background_anim_6' },
                { key: 'background_anim_7' },
                { key: 'background_anim_8', duration: 10 }
            ],
            frameRate: 8,
            repeat: -1
        });
    }

    initializeBulletAnimation(self) {
        // Background Image
        return self.anims.create({
           key: 'bullet',
           frames: [
               { key: 'player_laser_shoot_1' },
               { key: 'player_laser_shoot_2' },
               { key: 'player_laser_shoot_3' },
               { key: 'player_laser_shoot_4' },
               { key: 'player_laser_shoot_5', duration: 10 }
           ],
           frameRate: 8,
           repeat: -1
       });
   }

}