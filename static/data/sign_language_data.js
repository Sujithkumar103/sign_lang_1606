// Sign language data
// This file contains additional sign language data that can be used
// when video files are not available

// Common sign language gestures and phrases
const SIGN_LANGUAGE_DATA = {
    // Alphabet
    'a': `<svg width="100" height="100" viewBox="0 0 100 100">
        <title>A in sign language</title>
        <g stroke="black" stroke-width="2" fill="none">
            <path class="fist" d="M30,30 C30,30 45,25 50,35 C55,25 70,30 70,30 L70,70 L30,70 Z" />
            <circle cx="50" cy="45" r="5" fill="black" />
        </g>
    </svg>`,
    
    'b': `<svg width="100" height="100" viewBox="0 0 100 100">
        <title>B in sign language</title>
        <g stroke="black" stroke-width="2" fill="none">
            <path class="palm" d="M40,30 L60,30 L60,70 L40,70 Z" />
            <path class="fingers" d="M40,30 L40,15 M45,30 L45,15 M50,30 L50,15 M55,30 L55,15 M60,30 L60,15" />
        </g>
    </svg>`,
    
    'c': `<svg width="100" height="100" viewBox="0 0 100 100">
        <title>C in sign language</title>
        <g stroke="black" stroke-width="2" fill="none">
            <path class="hand" d="M30,30 C65,15 75,35 70,70 C35,85 25,65 30,30 Z" />
        </g>
    </svg>`,

    // Common words
    'hi': `<svg width="100" height="100" viewBox="0 0 100 100">
        <title>Hi in sign language</title>
        <g stroke="black" stroke-width="2" fill="none">
            <path class="palm" d="M30,50 L70,50" />
            <path class="fingers" d="M30,50 L30,25 M40,50 L40,20 M50,50 L50,20 M60,50 L60,20 M70,50 L70,25" />
            <path class="wave" d="M50,20 Q60,15 50,10 Q40,5 50,0" stroke-dasharray="5,5" />
        </g>
    </svg>`,
    
    'love': `<svg width="100" height="100" viewBox="0 0 100 100">
        <title>Love in sign language</title>
        <g stroke="black" stroke-width="2" fill="none">
            <path class="arms" d="M20,20 L40,50 M80,20 L60,50" />
            <path class="heart" d="M40,50 C40,40 50,30 50,40 C50,30 60,40 60,50 C60,65 50,75 50,75 C50,75 40,65 40,50 Z" fill="rgba(255,0,0,0.2)" />
        </g>
    </svg>`,
    
    'friend': `<svg width="100" height="100" viewBox="0 0 100 100">
        <title>Friend in sign language</title>
        <g stroke="black" stroke-width="2" fill="none">
            <path class="hands" d="M25,50 L40,50 M60,50 L75,50" />
            <path class="left-index" d="M40,50 L40,30" />
            <path class="right-index" d="M60,50 L60,30" />
            <path class="hook" d="M40,30 C40,20 60,20 60,30" />
            <path class="motion" d="M40,40 C40,35 60,35 60,40" stroke-dasharray="5,5" />
        </g>
    </svg>`,
    
    // Question words
    'what': `<svg width="100" height="100" viewBox="0 0 100 100">
        <title>What in sign language</title>
        <g stroke="black" stroke-width="2" fill="none">
            <path class="fingers" d="M40,40 L40,20 M50,40 L50,15 M60,40 L60,20" />
            <path class="palm" d="M30,40 L70,40 L70,70 L30,70 Z" />
            <circle cx="50" cy="55" r="5" fill="black" />
            <path class="shake" d="M30,55 L15,55 M70,55 L85,55" stroke-dasharray="5,5" />
        </g>
    </svg>`,
    
    'who': `<svg width="100" height="100" viewBox="0 0 100 100">
        <title>Who in sign language</title>
        <g stroke="black" stroke-width="2" fill="none">
            <circle cx="50" cy="25" r="15" />
            <path class="chin" d="M50,40 L50,50" />
            <path class="finger" d="M50,50 C50,65 60,75 70,75" />
            <path class="question" d="M70,75 Q80,75 80,65" stroke-dasharray="5,5" />
        </g>
    </svg>`,
    
    'when': `<svg width="100" height="100" viewBox="0 0 100 100">
        <title>When in sign language</title>
        <g stroke="black" stroke-width="2" fill="none">
            <path class="wrist" d="M30,70 L70,70" />
            <path class="watch-face" d="M45,50 C45,40 55,40 55,50 C55,60 45,60 45,50 Z" />
            <path class="watch-band" d="M45,50 L30,50 M55,50 L70,50" />
            <path class="question" d="M50,30 L50,15 Q55,10 60,15" stroke-dasharray="5,5" />
        </g>
    </svg>`,
    
    // Phrases
    'thank you': `<svg width="100" height="100" viewBox="0 0 100 100">
        <title>Thank you in sign language</title>
        <g stroke="black" stroke-width="2" fill="none">
            <path class="mouth" d="M30,40 Q50,60 70,40" />
            <path class="hand" d="M30,70 L70,70 L70,90 L30,90 Z" />
            <path class="motion" d="M50,70 L50,40" stroke-dasharray="5,5" />
        </g>
    </svg>`,
    
    'please help me': `<svg width="100" height="100" viewBox="0 0 100 100">
        <title>Please help me in sign language</title>
        <g stroke="black" stroke-width="2" fill="none">
            <path class="pleading" d="M30,30 C30,20 70,20 70,30" />
            <path class="right-hand" d="M70,30 L70,60 L50,60" />
            <path class="left-hand" d="M30,30 L30,50 L50,50" />
            <path class="help-motion" d="M50,60 L50,80" stroke-dasharray="5,5" />
            <circle cx="50" cy="85" r="5" fill="black" />
        </g>
    </svg>`,
    
    'how are you': `<svg width="100" height="100" viewBox="0 0 100 100">
        <title>How are you in sign language</title>
        <g stroke="black" stroke-width="2" fill="none">
            <path class="questioning" d="M20,50 Q35,35 50,50 Q65,65 80,50" />
            <path class="hand" d="M40,70 L60,70 L60,90 L40,90 Z" />
            <path class="point" d="M50,70 L50,50" />
            <circle cx="50" cy="45" r="5" fill="black" />
        </g>
    </svg>`,
    
    // Emotions
    'happy': `<svg width="100" height="100" viewBox="0 0 100 100">
        <title>Happy in sign language</title>
        <g stroke="black" stroke-width="2" fill="none">
            <circle cx="50" cy="50" r="30" />
            <path class="smile" d="M35,50 Q50,70 65,50" />
            <path class="eyes" d="M40,40 L45,40 M55,40 L60,40" />
            <path class="motion" d="M50,20 Q60,10 70,20" stroke-dasharray="5,5" />
        </g>
    </svg>`,
    
    'sad': `<svg width="100" height="100" viewBox="0 0 100 100">
        <title>Sad in sign language</title>
        <g stroke="black" stroke-width="2" fill="none">
            <circle cx="50" cy="50" r="30" />
            <path class="frown" d="M35,60 Q50,40 65,60" />
            <path class="eyes" d="M40,40 L45,40 M55,40 L60,40" />
            <path class="tear" d="M45,40 Q40,50 45,55" fill="lightblue" />
        </g>
    </svg>`,
    
    'angry': `<svg width="100" height="100" viewBox="0 0 100 100">
        <title>Angry in sign language</title>
        <g stroke="black" stroke-width="2" fill="none">
            <circle cx="50" cy="50" r="30" />
            <path class="eyebrows" d="M35,35 L45,30 M55,30 L65,35" />
            <path class="eyes" d="M40,40 L45,40 M55,40 L60,40" />
            <path class="mouth" d="M40,60 L60,60" />
            <path class="motion" d="M20,20 L30,10 M80,20 L70,10" stroke-dasharray="5,5" fill="rgba(255,0,0,0.2)" />
        </g>
    </svg>`,
    
    // Common needs
    'food': `<svg width="100" height="100" viewBox="0 0 100 100">
        <title>Food in sign language</title>
        <g stroke="black" stroke-width="2" fill="none">
            <path class="hand" d="M30,50 L70,50" />
            <path class="fingers" d="M50,50 L50,20" />
            <path class="eating" d="M50,20 L50,10 Q40,5 50,0" stroke-dasharray="5,5" />
            <path class="mouth" d="M40,70 Q50,80 60,70" />
        </g>
    </svg>`,
    
    'water': `<svg width="100" height="100" viewBox="0 0 100 100">
        <title>Water in sign language</title>
        <g stroke="black" stroke-width="2" fill="none">
            <path class="w-shape" d="M30,30 L40,60 L50,30 L60,60 L70,30" />
            <path class="drinking" d="M50,30 L50,15 Q60,10 50,5" stroke-dasharray="5,5" />
        </g>
    </svg>`,
    
    'bathroom': `<svg width="100" height="100" viewBox="0 0 100 100">
        <title>Bathroom in sign language</title>
        <g stroke="black" stroke-width="2" fill="none">
            <path class="hand" d="M30,50 L45,50 M55,50 L70,50" />
            <path class="b-shake" d="M45,50 L45,30 M55,50 L55,30" />
            <path class="shake" d="M45,40 L55,40" stroke-dasharray="5,5" />
            <path class="motion" d="M45,30 L35,20 M55,30 L65,20" stroke-dasharray="5,5" />
        </g>
    </svg>`,
    
    // Directional words
    'here': `<svg width="100" height="100" viewBox="0 0 100 100">
        <title>Here in sign language</title>
        <g stroke="black" stroke-width="2" fill="none">
            <path class="arrow" d="M30,30 L70,70" />
            <path class="pointer" d="M70,70 L60,60 M70,70 L60,70" />
            <circle cx="70" cy="70" r="5" fill="black" />
        </g>
    </svg>`,
    
    'there': `<svg width="100" height="100" viewBox="0 0 100 100">
        <title>There in sign language</title>
        <g stroke="black" stroke-width="2" fill="none">
            <path class="arrow" d="M30,50 L70,50" />
            <path class="pointer" d="M70,50 L60,40 M70,50 L60,60" />
            <path class="motion" d="M30,50 L20,50" stroke-dasharray="5,5" />
        </g>
    </svg>`,
    
    'where': `<svg width="100" height="100" viewBox="0 0 100 100">
        <title>Where in sign language</title>
        <g stroke="black" stroke-width="2" fill="none">
            <path class="palm" d="M40,70 L60,70 L60,40 L40,40 Z" />
            <path class="fingers" d="M40,40 L40,20 M45,40 L45,15 M50,40 L50,15 M55,40 L55,15 M60,40 L60,20" />
            <path class="questioning" d="M30,55 L15,55 M70,55 L85,55" stroke-dasharray="5,5" />
        </g>
    </svg>`
};