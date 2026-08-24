import { FRESHNESS_STYLES } from "@/lib/freshness";
import type { FreshnessStatus } from "@/lib/freshness";

type Props = {
  imageUrl: string | null;
  freshness: FreshnessStatus;
  alt: string;
  size?: "sm" | "md";
};

export function ItemThumbnail({ imageUrl, freshness, alt, size = "md" }: Props) {
  const style = FRESHNESS_STYLES[freshness];
  const dimension = size === "sm" ? "h-10 w-10" : "h-14 w-14";

  return (
    <div
      className={`${dimension} ${style.bg} ring-2 ring-offset-2 ring-offset-linen ${style.ring} flex shrink-0 items-center justify-center overflow-hidden rounded-2xl`}
      title={style.label}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <span className={size === "sm" ? "text-base" : "text-xl"} aria-hidden>
          🫙
        </span>
      )}
    </div>
  );
}
