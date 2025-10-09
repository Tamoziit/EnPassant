import type { TimerProps } from "@/types";
import formatTime from "@/utils/formatTime";
import { useEffect, useState, useRef } from "react";

const Timer = ({ initialTime, isActive, serverTime, lastMoveTimestamp, status }: TimerProps) => {
	const [timeRemaining, setTimeRemaining] = useState(initialTime);
	const [displayTime, setDisplayTime] = useState(initialTime);
	const animationFrameRef = useRef<number>(null);
	const lastUpdateRef = useRef<number>(Date.now());
	const hasTimedOut = useRef(false);

	// Sync with server time when it updates
	useEffect(() => {
		if (serverTime !== undefined) {
			setTimeRemaining(serverTime);
			setDisplayTime(serverTime);
			lastUpdateRef.current = Date.now();
			hasTimedOut.current = false;
		}
	}, [serverTime]);

	useEffect(() => {
		// stopping ticker if inactive, timed out, or status is not null
		if (!isActive || hasTimedOut.current || status !== null) {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
			return;
		}

		const animate = () => {
			const now = Date.now();
			const elapsed = now - lastUpdateRef.current;

			setDisplayTime((prev) => {
				const newTime = Math.max(0, prev - elapsed);

				if (newTime <= 0 && !hasTimedOut.current) {
					hasTimedOut.current = true;
					return 0;
				}

				return newTime;
			});

			lastUpdateRef.current = now;
			animationFrameRef.current = requestAnimationFrame(animate);
		};

		lastUpdateRef.current = Date.now();
		animationFrameRef.current = requestAnimationFrame(animate);

		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
		};
	}, [isActive, status]);

	const isLowTime = displayTime < 20000; // Less than 20 seconds
	const isCriticalTime = displayTime < 10000; // Less than 10 seconds

	return (
		<div
			className={`
                font-mono text-base font-medium p-1 rounded-lg
                transition-all duration-200
                ${isCriticalTime
					? 'bg-red-600 text-gray-200 shadow-lg shadow-red-500/50'
					: isLowTime
						? 'bg-orange-500 text-gray-200'
						: 'bg-slate-700 text-gray-200'
				}
        ${isCriticalTime && isActive ? 'animate-pulse' : ''}
				${isActive ? 'text-gray-200' : 'text-gray-500'}
            `}
			style={{
				minWidth: displayTime < 10000 ? '70px' : '85px',
				textAlign: 'center'
			}}
		>
			{formatTime(displayTime)}
		</div>
	);
};

export default Timer;