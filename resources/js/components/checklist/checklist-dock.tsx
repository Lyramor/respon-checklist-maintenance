import { useEffect, useState } from 'react';
import type { ChecklistStats } from './checklist-stats';
import { jumpToSection, sectionId } from './focus';
import { ProgressRail } from './progress-rail';
import { SubmitBar } from './submit-bar';

interface ChecklistDockProps {
    stats: ChecklistStats;
    processing: boolean;
    onOpenConfirm: () => void;
}

/**
 * Konteks bagian dan tombol kirim ditahan di bawah layar, bukan di atas.
 * Di ponsel posisi ini tetap terjangkau ibu jari dan tidak bertabrakan
 * dengan topbar milik layout.
 */
function useActiveSection(count: number): number {
    const [active, setActive] = useState(0);

    useEffect(() => {
        let frame = 0;

        const update = () => {
            frame = 0;
            let current = 0;

            for (let index = 0; index < count; index += 1) {
                const element = document.getElementById(sectionId(index));

                if (element && element.getBoundingClientRect().top <= 160) {
                    current = index;
                }
            }

            setActive(current);
        };

        const onScroll = () => {
            if (frame === 0) {
                frame = window.requestAnimationFrame(update);
            }
        };

        update();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', onScroll);

            if (frame !== 0) {
                window.cancelAnimationFrame(frame);
            }
        };
    }, [count]);

    return active;
}

export function ChecklistDock({ stats, processing, onOpenConfirm }: ChecklistDockProps) {
    const activeIndex = useActiveSection(stats.sections.length);

    return (
        <div className="sticky bottom-0 z-30 rounded-t-[10px] border border-b-0 border-line bg-surface/95 px-4 py-2 pb-[max(8px,env(safe-area-inset-bottom))] backdrop-blur sm:px-5">
            <ProgressRail stats={stats} activeIndex={activeIndex} onJumpSection={jumpToSection} />
            <SubmitBar blankCount={stats.blanks.length} processing={processing} onOpenConfirm={onOpenConfirm} />
        </div>
    );
}
