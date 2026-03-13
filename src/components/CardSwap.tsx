import React, {
    Children,
    cloneElement,
    forwardRef,
    isValidElement,
    useEffect,
    useMemo,
    useRef,
    useCallback,
    type ReactElement,
    type ReactNode,
    type MouseEvent as ReactMouseEvent,
    type RefCallback,
} from 'react';
import gsap from 'gsap';

export interface CardSwapProps {
    width?: number | string;
    height?: number | string;
    cardDistance?: number;
    verticalDistance?: number;
    delay?: number;
    pauseOnHover?: boolean;
    onCardClick?: (idx: number) => void;
    skewAmount?: number;
    easing?: 'linear' | 'elastic';
    children: ReactNode;
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    customClass?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ customClass, ...rest }, ref) => (
    <div
        ref={ref}
        {...rest}
        className={`absolute top-0 left-0 rounded-xl border border-white bg-black transform-3d will-change-transform backface-hidden ${customClass ?? ''} ${rest.className ?? ''}`.trim()}
    />
));
Card.displayName = 'Card';

type CardNode = HTMLDivElement | null;

type Slot = {
    x: number;
    y: number;
    scale: number;
    opacity: number;
    zIndex: number;
    rotateZ: number;
};

const placeNow = (el: HTMLElement, slot: Slot) =>
    gsap.set(el, {
        x: slot.x,
        y: slot.y,
        scale: slot.scale,
        opacity: slot.opacity,
        rotateZ: slot.rotateZ,
        zIndex: slot.zIndex,
        transformOrigin: 'center center',
        force3D: true,
    });

const CardSwap: React.FC<CardSwapProps> = ({
    width = 500,
    height = 400,
    cardDistance = 60,
    verticalDistance = 70,
    delay = 5000,
    pauseOnHover = false,
    onCardClick,
    skewAmount = 6,
    easing = 'elastic',
    children,
}) => {
    const config = useMemo(
        () =>
            easing === 'elastic'
                ? {
                    ease: 'elastic.out(0.72,0.82)',
                    duration: 1.05,
                    lift: 42,
                    settle: 0.1,
                }
                : {
                    ease: 'power2.inOut',
                    duration: 0.58,
                    lift: 28,
                    settle: 0.06,
                },
        [easing]
    );

    const childArr = useMemo(() => Children.toArray(children) as ReactElement<CardProps>[], [children]);
    const cardNodes = useRef<CardNode[]>([]);
    const order = useRef<number[]>([]);
    const tlRef = useRef<gsap.core.Timeline | null>(null);
    const intervalRef = useRef<number | null>(null);
    const container = useRef<HTMLDivElement | null>(null);

    const getCardRef = useCallback(
        (index: number): RefCallback<HTMLDivElement> =>
            (node: HTMLDivElement | null) => {
                cardNodes.current[index] = node;
            },
        []
    );

    useEffect(() => {
        order.current = Array.from({ length: childArr.length }, (_, i) => i);
    }, [childArr.length]);

    const stackWidth = typeof width === 'number' ? width + cardDistance * 2 + 40 : width;
    const stackHeight = typeof height === 'number' ? height + verticalDistance * 2 + config.lift + 40 : height;

    const getSlot = useCallback((position: number): Slot => {
        const visibleDepth = Math.min(position, 2);
        const hiddenDepth = position > 2;

        return {
            x: hiddenDepth ? cardDistance * 2.6 : visibleDepth * cardDistance,
            y: hiddenDepth ? visibleDepth * verticalDistance + 18 : visibleDepth * verticalDistance,
            scale: hiddenDepth ? 0.9 : 1 - visibleDepth * 0.06,
            opacity: hiddenDepth ? 0 : 1 - visibleDepth * 0.14,
            zIndex: Math.max(1, 30 - position),
            rotateZ: hiddenDepth ? 0 : -visibleDepth * Math.max(1.2, skewAmount * 0.32),
        };
    }, [cardDistance, verticalDistance, skewAmount]);

    useEffect(() => {
        const total = childArr.length;
        const nodes = cardNodes.current.slice(0, total);
        if (!nodes.every(Boolean)) return;

        const applyOrder = (indices: number[]) => {
            indices.forEach((cardIndex, position) => {
                const node = cardNodes.current[cardIndex];
                if (!node) return;
                placeNow(node, getSlot(position));
            });
        };

        applyOrder(order.current);

        const swap = () => {
            if (order.current.length < 2) return;

            const [front, ...rest] = order.current;
            const nextOrder = [...rest, front];
            const frontNode = cardNodes.current[front];
            if (!frontNode) return;

            tlRef.current?.kill();
            const tl = gsap.timeline({ onComplete: () => { order.current = nextOrder; } });
            tlRef.current = tl;

            tl.to(frontNode, {
                x: cardDistance * 1.25,
                y: -config.lift,
                scale: 1.02,
                rotateZ: Math.max(2.2, skewAmount * 0.42),
                opacity: 1,
                duration: config.duration * 0.42,
                ease: 'power2.out',
            });

            nextOrder.slice(0, -1).forEach((cardIndex, position) => {
                const node = cardNodes.current[cardIndex];
                if (!node) return;
                const slot = getSlot(position);
                tl.to(
                    node,
                    {
                        x: slot.x,
                        y: slot.y,
                        scale: slot.scale,
                        opacity: slot.opacity,
                        rotateZ: slot.rotateZ,
                        zIndex: slot.zIndex,
                        duration: config.duration,
                        ease: config.ease,
                    },
                    config.settle
                );
            });

            const backSlot = getSlot(Math.max(nextOrder.length - 1, 0));
            tl.set(frontNode, { zIndex: backSlot.zIndex }, config.settle);
            tl.to(
                frontNode,
                {
                    x: backSlot.x,
                    y: backSlot.y,
                    scale: backSlot.scale,
                    opacity: backSlot.opacity,
                    rotateZ: backSlot.rotateZ,
                    duration: config.duration,
                    ease: config.ease,
                },
                config.settle + config.duration * 0.16
            );
        };

        const startInterval = () => {
            if (intervalRef.current) window.clearInterval(intervalRef.current);
            intervalRef.current = window.setInterval(swap, delay);
        };

        startInterval();

        if (pauseOnHover && container.current) {
            const node = container.current;
            const pause = () => {
                tlRef.current?.pause();
                if (intervalRef.current) {
                    window.clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
            };
            const resume = () => {
                tlRef.current?.resume();
                startInterval();
            };

            node.addEventListener('mouseenter', pause);
            node.addEventListener('mouseleave', resume);

            return () => {
                node.removeEventListener('mouseenter', pause);
                node.removeEventListener('mouseleave', resume);
                tlRef.current?.kill();
                if (intervalRef.current) window.clearInterval(intervalRef.current);
            };
        }

        return () => {
            tlRef.current?.kill();
            if (intervalRef.current) window.clearInterval(intervalRef.current);
        };
    }, [delay, pauseOnHover, config, childArr.length, getSlot, cardDistance, skewAmount]);

    const rendered = childArr.map((child, i) =>
        isValidElement<CardProps>(child)
            ? cloneElement(child, {
                key: i,
                ref: getCardRef(i),
                style: {
                    width,
                    height,
                    ...(child.props.style ?? {}),
                },
                onClick: e => {
                    child.props.onClick?.(e as ReactMouseEvent<HTMLDivElement>);
                    onCardClick?.(i);
                },
            } as CardProps & { ref: RefCallback<HTMLDivElement> })
            : child
    );

    return (
        <div
            ref={container}
            style={{
                width: stackWidth,
                height: stackHeight,
                perspective: '1200px',
                position: 'relative',
                overflow: 'visible',
            }}
        >
            {rendered}
        </div>
    );
};

export default CardSwap;

