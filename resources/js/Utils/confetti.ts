import confetti from 'canvas-confetti';

export function fireChampionConfetti() {
    confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a3e635', '#38bdf8', '#fbbf24', '#ffffff'],
    });
}

export function firePodiumCelebration() {
    const end = Date.now() + 1500;
    const colors = ['#a3e635', '#f59e0b', '#38bdf8'];

    (function frame() {
        confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors,
        });
        confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors,
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    })();
}
