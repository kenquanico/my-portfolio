import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

interface TrueFocusProps {
    sentence?: string;
    separator?: string;
    manualMode?: boolean;
    blurAmount?: number;
    borderColor?: string;
    glowColor?: string;
    animationDuration?: number;
    pauseBetweenAnimations?: number;
}

interface FocusRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

const TrueFocus: React.FC<TrueFocusProps> = ({
                                                 sentence = 'True Focus',
                                                 separator = ' ',
                                                 manualMode = false,
                                                 blurAmount = 5,
                                                 borderColor = 'green',
                                                 glowColor = 'rgba(0, 255, 0, 0.6)',
                                                 animationDuration = 0.5,
                                                 pauseBetweenAnimations = 1
                                             }) => {
    const words = sentence.split(separator);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [lastActiveIndex, setLastActiveIndex] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const [focusRect, setFocusRect] = useState<FocusRect>({ x: 0, y: 0, width: 0, height: 0 });

    const measureRect = (index: number) => {
        requestAnimationFrame(() => {
            if (!wordRefs.current[index] || !containerRef.current) return;
            const parentRect = containerRef.current.getBoundingClientRect();
            const activeRect = wordRefs.current[index]!.getBoundingClientRect();
            setFocusRect({
                x: activeRect.left - parentRect.left,
                y: activeRect.top - parentRect.top,
                width: activeRect.width,
                height: activeRect.height
            });
        });
    };

    useEffect(() => { measureRect(0); }, []);

    useEffect(() => {
        if (!manualMode) {
            const interval = setInterval(() => {
                setCurrentIndex(prev => (prev + 1) % words.length);
            }, (animationDuration + pauseBetweenAnimations) * 1000);
            return () => clearInterval(interval);
        }
    }, [manualMode, animationDuration, pauseBetweenAnimations, words.length]);

    useEffect(() => { measureRect(currentIndex); }, [currentIndex, words.length]);

    const handleMouseEnter = (index: number) => {
        if (manualMode) {
            setLastActiveIndex(index);
            setCurrentIndex(index);
        }
    };

    const handleMouseLeave = () => {
        if (manualMode) setCurrentIndex(lastActiveIndex!);
    };

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                display: 'inline-flex',
                gap: '2.5rem',
                justifyContent: 'center',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                outline: 'none',
                userSelect: 'none',
                padding: '8px 0',
            }}
        >
            {words.map((word, index) => {
                const isActive = index === currentIndex;
                return (
                    <span
                        key={index}
                        ref={el => { wordRefs.current[index] = el; }}
                        style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: '13px',
                            fontWeight: 400,
                            letterSpacing: '0.22em',
                            textTransform: 'uppercase' as const,
                            color: isActive
                                ? 'rgba(212,200,235,0.9)'
                                : 'rgba(177,165,210,0.45)',
                            filter: isActive ? `blur(0px)` : `blur(${blurAmount}px)`,
                            transition: `filter ${animationDuration}s ease, color ${animationDuration}s ease`,
                            outline: 'none',
                            userSelect: 'none',
                            cursor: 'pointer',
                            display: 'block',
                        } as React.CSSProperties}
                        onMouseEnter={() => handleMouseEnter(index)}
                        onMouseLeave={handleMouseLeave}
                    >
                        {word}
                    </span>
                );
            })}

            <motion.div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    pointerEvents: 'none',
                    boxSizing: 'border-box',
                }}
                animate={{
                    x: focusRect.x,
                    y: focusRect.y,
                    width: focusRect.width,
                    height: focusRect.height,
                    opacity: focusRect.width > 0 ? 1 : 0
                }}
                transition={{ duration: animationDuration, ease: [0.16, 1, 0.3, 1] }}
            >
                <span style={{
                    position: 'absolute', width: 10, height: 10,
                    top: -6, left: -6,
                    borderTop: `1px solid ${borderColor}`,
                    borderLeft: `1px solid ${borderColor}`,
                    borderRadius: '2px 0 0 0',
                    filter: `drop-shadow(0 0 4px ${glowColor})`
                }} />
                <span style={{
                    position: 'absolute', width: 10, height: 10,
                    top: -6, right: -6,
                    borderTop: `1px solid ${borderColor}`,
                    borderRight: `1px solid ${borderColor}`,
                    borderRadius: '0 2px 0 0',
                    filter: `drop-shadow(0 0 4px ${glowColor})`
                }} />
                <span style={{
                    position: 'absolute', width: 10, height: 10,
                    bottom: -6, left: -6,
                    borderBottom: `1px solid ${borderColor}`,
                    borderLeft: `1px solid ${borderColor}`,
                    borderRadius: '0 0 0 2px',
                    filter: `drop-shadow(0 0 4px ${glowColor})`
                }} />
                <span style={{
                    position: 'absolute', width: 10, height: 10,
                    bottom: -6, right: -6,
                    borderBottom: `1px solid ${borderColor}`,
                    borderRight: `1px solid ${borderColor}`,
                    borderRadius: '0 0 2px 0',
                    filter: `drop-shadow(0 0 4px ${glowColor})`
                }} />
            </motion.div>
        </div>
    );
};

export default TrueFocus;