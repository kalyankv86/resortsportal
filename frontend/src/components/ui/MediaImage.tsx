import Image from "next/image";
import type { MediaItem } from "@/lib/media";
import { cn } from "@/lib/cn";

/**
 * Renders a MediaItem via next/image. `fill` mode by default so it adapts to
 * any bento/card frame; pass `sizes` for correct responsive loading.
 */
export function MediaImage({
  item,
  className,
  sizes = "100vw",
  priority = false,
  rounded = true,
}: {
  item: MediaItem;
  className?: string;
  sizes?: string;
  priority?: boolean;
  rounded?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-sage-100",
        rounded && "rounded-card",
        className,
      )}
    >
      <Image
        src={item.src}
        alt={item.alt}
        fill
        sizes={sizes}
        priority={priority}
        placeholder={item.blurDataURL ? "blur" : "empty"}
        blurDataURL={item.blurDataURL}
        className="object-cover"
        unoptimized={item.src.startsWith("data:") || item.src.startsWith("/media/")}
      />
    </div>
  );
}
