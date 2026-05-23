"use client";

import { useEffect, useState } from "react";
import { Panel, Group, Separator } from "react-resizable-panels";
import { GripVertical } from "lucide-react";

interface ResizableLayoutProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  leftDefaultSize?: number;
  rightDefaultSize?: number;
  leftMinSize?: number;
  rightMinSize?: number;
}

export function ResizableLayout({
  leftContent,
  rightContent,
  leftDefaultSize = 65,
  rightDefaultSize = 35,
  leftMinSize = 30,
  rightMinSize = 20,
}: ResizableLayoutProps) {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1280); // xl breakpoint in Tailwind
    };
    
    // Initial check
    handleResize();
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isDesktop) {
    return (
      <div className="flex flex-col gap-6">
        <div>{leftContent}</div>
        <div className="h-[600px]">{rightContent}</div>
      </div>
    );
  }

  return (
    <Group orientation="horizontal" className="h-full items-stretch">
      <Panel defaultSize={leftDefaultSize} minSize={leftMinSize} className="flex flex-col">
        <div className="h-full overflow-y-auto pr-2 pb-6">
          {leftContent}
        </div>
      </Panel>
      
      <Separator className="relative flex w-4 items-center justify-center outline-none group cursor-col-resize z-10 mx-2">
        <div className="z-10 flex h-8 w-4 items-center justify-center rounded-sm border bg-white shadow-sm transition-colors group-hover:bg-slate-50 group-active:bg-slate-100">
          <GripVertical className="h-3 w-3 text-slate-400" />
        </div>
        <div className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-slate-200 transition-colors group-hover:bg-indigo-400 group-active:bg-indigo-500" />
      </Separator>

      <Panel defaultSize={rightDefaultSize} minSize={rightMinSize} className="flex flex-col">
        <div className="h-full pb-6">
          {rightContent}
        </div>
      </Panel>
    </Group>
  );
}
