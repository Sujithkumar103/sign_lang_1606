// Sign language helper functions

// Get sign language data for a word
function getSignData(text) {
    // This would typically come from a more comprehensive database
    // For now, we'll return SVG representations for a few common words
    
    const signData = {
        'hello': `<svg width="100" height="100" viewBox="0 0 100 100">
            <title>Hello in sign language</title>
            <g stroke="black" stroke-width="2" fill="none">
                <path class="palm" d="M30,50 Q50,30 70,50" />
                <path class="fingers" d="M30,50 L30,20 M40,50 L40,15 M50,50 L50,15 M60,50 L60,15 M70,50 L70,20" />
                <path class="hand-motion" d="M30,50 Q50,70 70,50" stroke-dasharray="5,5" />
            </g>
        </svg>`,
        
        'thank': `<svg width="100" height="100" viewBox="0 0 100 100">
            <title>Thank you in sign language</title>
            <g stroke="black" stroke-width="2" fill="none">
                <path class="palm" d="M30,30 L70,30 L70,70 L30,70 Z" />
                <path class="motion" d="M50,30 L50,15 M50,70 L50,85" stroke-dasharray="5,5" />
            </g>
        </svg>`,
        
        'please': `<svg width="100" height="100" viewBox="0 0 100 100">
            <title>Please in sign language</title>
            <g stroke="black" stroke-width="2" fill="none">
                <circle cx="50" cy="50" r="20" />
                <path class="palm" d="M30,50 L70,50" />
                <path class="circular-motion" d="M50,30 A20,20 0 0 1 70,50 A20,20 0 0 1 50,70 A20,20 0 0 1 30,50" stroke-dasharray="5,5" />
            </g>
        </svg>`,
        
        'yes': `<svg width="100" height="100" viewBox="0 0 100 100">
            <title>Yes in sign language</title>
            <g stroke="black" stroke-width="2" fill="none">
                <path class="hand" d="M40,40 L60,40 L60,80 L40,80 Z" />
                <path class="nodding-motion" d="M50,40 L50,20 M50,80 L50,100" stroke-dasharray="5,5" />
            </g>
        </svg>`,
        
        'no': `<svg width="100" height="100" viewBox="0 0 100 100">
            <title>No in sign language</title>
            <g stroke="black" stroke-width="2" fill="none">
                <path class="hand" d="M30,30 L70,30 L70,70 L30,70 Z" />
                <path class="shake-motion" d="M30,50 L10,50 M70,50 L90,50" stroke-dasharray="5,5" />
            </g>
        </svg>`,
        
        'help': `<svg width="100" height="100" viewBox="0 0 100 100">
            <title>Help in sign language</title>
            <g stroke="black" stroke-width="2" fill="none">
                <path class="palm" d="M20,50 L40,50" />
                <path class="fist" d="M40,30 L60,30 L60,70 L40,70 Z" />
                <path class="motion" d="M60,50 L80,50" stroke-dasharray="5,5" />
            </g>
        </svg>`
    };
    
    return signData[text] || null;
}

// Animate the sign language SVG
function animateSign(svgElement) {
    // Add animation class to SVG element
    svgElement.classList.add('animated');
    
    // Find motion paths that should be animated
    const motionPaths = svgElement.querySelectorAll('path[stroke-dasharray]');
    
    // Add animation to each motion path
    motionPaths.forEach((path, index) => {
        // Create animation element
        const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animate.setAttribute('attributeName', 'stroke-dashoffset');
        animate.setAttribute('from', '0');
        animate.setAttribute('to', '20');
        animate.setAttribute('dur', '1.5s');
        animate.setAttribute('repeatCount', 'indefinite');
        
        // Add animation to path
        path.appendChild(animate);
    });
}