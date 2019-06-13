export default class AnimationManager {

    initializeAnimationGroup(self) {
        this.initializeLaunchAnimation(self);
        this.initializeBoostAnimation(self);
        this.initializeBackgroundAnimation(self);
    }

    initializeLaunchAnimation(self) {
        // Normal Launch Animation
        self.anims.create({
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
        self.anims.create({
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
         self.anims.create({
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

}