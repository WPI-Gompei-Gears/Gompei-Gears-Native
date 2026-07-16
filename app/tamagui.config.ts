import { defaultConfig } from '@tamagui/config/v5'
import { createTamagui } from 'tamagui'
import { createAnimations } from '@tamagui/animations-react-native'

const config = createTamagui({
  ...defaultConfig,
    themes: {
        ...defaultConfig.themes,

        // Global color override for buttons in Light Mode
        light_Button: {
            background: '#ac2b37',         // Main button color (e.g., Blue)
            backgroundHover: '#8f2934',    // Color on hover
            backgroundPress: '#7b232c',    // Color when pressed
            backgroundFocus: '#8f2934',
            color: '#ffffff',              // Text color inside button
        }
    },
    media: {
        ...defaultConfig.media,
        // add your own media queries here, if wanted
    },
    animations: createAnimations({
        bouncy: {
            damping: 9,
            mass: 0.9,
            stiffness: 100,
        },
        lazy: {
            damping: 18,
            stiffness: 50,
        },
        quick: {
            damping: 20,
            mass: 1.2,
            stiffness: 250,
        },

        // Custom: Snaps back quickly with subtle weight
        bouncyPress: {
            damping: 1,    // Higher damping stops the awkward wiggle
            mass: 0.01,       // Lower mass makes it respond instantly
            stiffness: 100,  // Higher stiffness speeds up the snap-back
        },
    }),
    settings: {
        ...defaultConfig.settings,
        onlyAllowShorthands: false,
    }
})

export default config

type OurConfig = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends OurConfig {}
}
